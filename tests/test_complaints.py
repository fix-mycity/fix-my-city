import sys
import os
import pytest
from io import BytesIO
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add city_operation_service to path so we can import from it
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "city_operation_service")))

from main import app
from database import Base
from dependencies.db import get_db
from dependencies.auth import get_current_user, UserData
from modules.complaints.model import Complaint, ComplaintStatus, ComplaintDepartment
from modules.complaints.schema import ComplaintCreate
from modules.users.model import Profile
from modules.complaints.service import (
    classify_department,
    create_complaint,
    get_complaint_by_id,
    get_my_complaints,
    get_all_complaints,
    update_complaint_image
)

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def fixture_client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_get_current_user():
        return UserData(id=1, username="testuser", email="test@example.com")

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


# =====================================================================
# Unit Tests for Department Auto-Classification & Service functions
# =====================================================================

def test_classify_department():
    assert classify_department("Traffic jam near signal", "Car accident happened") == ComplaintDepartment.TRAFFIC.value
    assert classify_department("Garbage dump overflow", "Trash is everywhere") == ComplaintDepartment.WASTE.value
    assert classify_department("Leak in main pipe", "Drinking water is overflowing") == ComplaintDepartment.WATER.value
    assert classify_department("Street dog issue", "Dogs barking at night") == ComplaintDepartment.GENERAL.value


def test_create_complaint_service(db_session):
    data = ComplaintCreate(
        title="Garbage spill",
        description="Trash is piled up",
        location_lat=12.34,
        location_lng=56.78,
        image_url="https://example.com/trash.jpg"
    )
    
    complaint = create_complaint(db_session, user_id=1, data=data)
    assert complaint.id is not None
    assert complaint.reported_by == 1
    assert complaint.title == "Garbage spill"
    assert complaint.department == ComplaintDepartment.WASTE.value
    assert complaint.status == ComplaintStatus.PENDING.value
    assert complaint.image_url == "https://example.com/trash.jpg"


def test_get_complaint_by_id_service(db_session):
    data = ComplaintCreate(
        title="Test Water Leak",
        description="Leaking pipe in garden",
        location_lat=12.34,
        location_lng=56.78
    )
    created = create_complaint(db_session, user_id=1, data=data)
    
    fetched = get_complaint_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.department == ComplaintDepartment.WATER.value


def test_get_my_complaints_service(db_session):
    # Create complaints for two different users
    c1 = Complaint(
        title="Traffic delay", description="Accident",
        location_lat=0, location_lng=0, reported_by=1, department="traffic"
    )
    c2 = Complaint(
        title="Garbage", description="Waste pile",
        location_lat=0, location_lng=0, reported_by=1, department="waste"
    )
    c3 = Complaint(
        title="Water leak", description="Pipe leak",
        location_lat=0, location_lng=0, reported_by=2, department="water"
    )
    db_session.add_all([c1, c2, c3])
    db_session.commit()

    my_complaints = get_my_complaints(db_session, user_id=1)
    assert len(my_complaints) == 2
    assert {c.title for c in my_complaints} == {"Traffic delay", "Garbage"}


def test_update_complaint_image_service(db_session):
    c1 = Complaint(
        title="Traffic delay", description="Accident",
        location_lat=0, location_lng=0, reported_by=1, department="traffic"
    )
    db_session.add(c1)
    db_session.commit()

    # Success update
    updated = update_complaint_image(db_session, complaint_id=c1.id, user_id=1, image_url="https://s3.com/pic.jpg")
    assert updated is not None
    assert updated.image_url == "https://s3.com/pic.jpg"

    # Fails if wrong user
    updated_wrong_user = update_complaint_image(db_session, complaint_id=c1.id, user_id=2, image_url="https://s3.com/pic2.jpg")
    assert updated_wrong_user is None


# =====================================================================
# API Integration Tests (Mocking S3 upload via Celery)
# =====================================================================

@patch("modules.complaints.router.upload_complaint_media_task.delay")
def test_api_create_complaint(mock_delay, client, db_session):
    # Set up user profile with a phone number
    profile = Profile(user_id=1, phone_number="1234567890")
    db_session.add(profile)
    db_session.commit()

    file_data = {"file": ("test.jpg", BytesIO(b"dummy image data"), "image/jpeg")}
    form_data = {
        "title": "Road pothole near intersection",
        "description": "Deep pothole causing slow traffic",
        "location_lat": 13.01,
        "location_lng": 80.22
    }
    response = client.post(
        "/complaints/",
        data=form_data,
        files=file_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["reported_by"] == 1
    assert data["department"] == "traffic"
    assert data["status"] == "PENDING"
    assert data["media_status"] == "MEDIA_PENDING"
    assert data["image_url"] is None

    mock_delay.assert_called_once()
    assert mock_delay.call_args[0][0] == data["id"]
    temp_path = mock_delay.call_args[0][1]
    assert mock_delay.call_args[0][2] == "test.jpg"

    # Clean up temp file
    if os.path.exists(temp_path):
        os.remove(temp_path)


@patch("modules.complaints.router.upload_complaint_media_task.delay")
def test_api_create_complaint_fails_without_phone_number(mock_delay, client, db_session):
    # Set up user profile with NO phone number
    profile = Profile(user_id=1, phone_number=None)
    db_session.add(profile)
    db_session.commit()

    file_data = {"file": ("test.jpg", BytesIO(b"dummy image data"), "image/jpeg")}
    form_data = {
        "title": "Road pothole near intersection",
        "description": "Deep pothole causing slow traffic",
        "location_lat": 13.01,
        "location_lng": 80.22
    }
    response = client.post(
        "/complaints/",
        data=form_data,
        files=file_data
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Mobile number is required to report complaints. Please update your profile."
    mock_delay.assert_not_called()



def test_api_read_my_complaints(client, db_session):
    c1 = Complaint(
        title="Road pothole", description="Pothole issue",
        location_lat=1.0, location_lng=2.0, reported_by=1, department="traffic"
    )
    db_session.add(c1)
    db_session.commit()

    response = client.get("/complaints/me")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Road pothole"


def test_api_read_all_complaints(client, db_session):
    c1 = Complaint(
        title="Road pothole", description="Pothole",
        location_lat=1.0, location_lng=2.0, reported_by=1, department="traffic"
    )
    c2 = Complaint(
        title="Water leak", description="Leak",
        location_lat=3.0, location_lng=4.0, reported_by=2, department="water"
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    response = client.get("/complaints/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2
    assert data["total_items"] == 2


def test_api_read_complaint_by_id(client, db_session):
    c1 = Complaint(
        title="Water pipe leak", description="Leaking water",
        location_lat=1.0, location_lng=2.0, reported_by=1, department="water"
    )
    db_session.add(c1)
    db_session.commit()

    # Success
    response = client.get(f"/complaints/{c1.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Water pipe leak"

    # Not found
    response_nf = client.get("/complaints/999")
    assert response_nf.status_code == 404


@patch("modules.complaints.router.upload_file_to_s3")
def test_api_upload_complaint_image(mock_upload, client, db_session):
    mock_upload.return_value = "https://s3.amazonaws.com/fixmycity/complaints/test-image.jpg"

    c1 = Complaint(
        title="Water pipe leak", description="Leaking water",
        location_lat=1.0, location_lng=2.0, reported_by=1, department="water"
    )
    db_session.add(c1)
    db_session.commit()

    # Success upload
    file_data = {"file": ("test.jpg", BytesIO(b"dummy image data"), "image/jpeg")}
    response = client.post(f"/complaints/{c1.id}/image", files=file_data)
    assert response.status_code == 200
    assert response.json()["image_url"] == "https://s3.amazonaws.com/fixmycity/complaints/test-image.jpg"

    # Fails if uploading non-image or video content type
    file_data_invalid = {"file": ("test.txt", BytesIO(b"text data"), "text/plain")}
    response_invalid = client.post(f"/complaints/{c1.id}/image", files=file_data_invalid)
    assert response_invalid.status_code == 400
    assert "must be an image or a video" in response_invalid.json()["detail"]


@patch("modules.complaints.router.upload_file_to_s3")
def test_api_upload_complaint_image_unauthorized(mock_upload, client, db_session):
    mock_upload.return_value = "https://s3.amazonaws.com/fixmycity/complaints/test-image.jpg"

    # Complaint owned by user ID 2 (current user has ID 1)
    c1 = Complaint(
        title="Water pipe leak", description="Leaking water",
        location_lat=1.0, location_lng=2.0, reported_by=2, department="water"
    )
    db_session.add(c1)
    db_session.commit()

    file_data = {"file": ("test.jpg", BytesIO(b"dummy image data"), "image/jpeg")}
    response = client.post(f"/complaints/{c1.id}/image", files=file_data)
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"]


# =====================================================================
# API Integration Tests for Profile Avatar Upload
# =====================================================================

@patch("modules.users.router.upload_file_to_s3")
def test_api_upload_profile_avatar(mock_upload, client):
    mock_upload.return_value = "https://s3.amazonaws.com/fixmycity/avatars/avatar-test.jpg"

    file_data = {"file": ("avatar.png", BytesIO(b"dummy image bytes"), "image/png")}
    response = client.post("/users/me/profile/avatar", files=file_data)
    assert response.status_code == 200
    data = response.json()
    assert data["avatar_url"] == "https://s3.amazonaws.com/fixmycity/avatars/avatar-test.jpg"

    # Fails if invalid content type
    file_data_invalid = {"file": ("avatar.txt", BytesIO(b"text"), "text/plain")}
    response_invalid = client.post("/users/me/profile/avatar", files=file_data_invalid)
    assert response_invalid.status_code == 400
    assert "must be an image" in response_invalid.json()["detail"]


@patch("modules.complaints.schema.generate_presigned_url")
def test_api_complaint_media_status(mock_presign, client, db_session):
    mock_presign.side_effect = lambda x: f"presigned-{x}"

    # 1. Create a dummy complaint with media status PENDING
    c1 = Complaint(
        title="Water pipe leak", description="Leaking water",
        location_lat=1.0, location_lng=2.0, reported_by=1, department="water",
        media_status="MEDIA_PENDING"
    )
    db_session.add(c1)
    db_session.commit()

    # 2. Call the endpoint
    response = client.get(f"/complaints/{c1.id}/media-status")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == c1.id
    assert data["media_status"] == "MEDIA_PENDING"
    assert data["image_url"] is None

    # 3. Update status to READY and image_url
    c1.media_status = "MEDIA_READY"
    c1.image_url = "complaints/test-image.jpg"
    db_session.commit()

    # 4. Call again and verify pre-signed URL is generated/returned
    response = client.get(f"/complaints/{c1.id}/media-status")
    assert response.status_code == 200
    data = response.json()
    assert data["media_status"] == "MEDIA_READY"
    assert data["image_url"] == "presigned-complaints/test-image.jpg"

