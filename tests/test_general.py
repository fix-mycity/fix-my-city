import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add city_operation_service to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "city_operation_service")))

from main import app
from database import Base
from dependencies.db import get_db
from dependencies.auth import get_current_user, UserData
# Import all models to ensure they register on metadata
import modules.complaints.model
import modules.users.model
from modules.general.model import GeneralFieldWorker
from modules.general.schema import ComplaintCreate, WorkerCreate, ComplaintUpdate, WorkerUpdate
from modules.general.service import GeneralComplaintService, GeneralFieldWorkerService

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
        return UserData(
            id=1,
            username="adminuser",
            email="admin@example.com",
            role="Department_Admin",
            permissions=["dept:general"]
        )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


# =====================================================================
# Service Layer Tests
# =====================================================================

def test_create_general_worker_service(db_session):
    worker_data = WorkerCreate(
        first_name="John",
        last_name="Doe",
        email="john.doe@municipal.gov",
        phone="+919876543210",
        password="securepassword123",
        skill="Electrical",
        experience=5
    )
    worker = GeneralFieldWorkerService.create_worker(db_session, worker_data)
    assert worker.id is not None
    assert worker.first_name == "John"
    assert worker.email == "john.doe@municipal.gov"
    assert worker.availability == "AVAILABLE"
    assert worker.employment_status == "ACTIVE"


def test_create_general_complaint_service(db_session):
    complaint_data = ComplaintCreate(
        category="Streetlights",
        title="Flickering streetlight",
        description="The street lamp near post 12 is flickering",
        ward="Ward 5",
        area="West Lane",
        priority="MEDIUM"
    )
    complaint = GeneralComplaintService.create_complaint(db_session, complaint_data)
    assert complaint["id"] is not None
    assert complaint["complaint_number"].startswith("GNC-")
    assert complaint["status"] == "NEW"
    assert complaint["category"] == "General"  # Mapped to general fallback


def test_assign_worker_service(db_session):
    # Create worker
    worker_data = WorkerCreate(
        first_name="Jane",
        last_name="Smith",
        email="jane.smith@municipal.gov",
        phone="+919876543211",
        password="securepassword123",
        skill="Animal Control"
    )
    worker = GeneralFieldWorkerService.create_worker(db_session, worker_data)

    # Create complaint
    complaint_data = ComplaintCreate(
        category="Stray Animals",
        title="Stray dog aggregation",
        description="Pack of dogs near market"
    )
    complaint = GeneralComplaintService.create_complaint(db_session, complaint_data)

    # Assign worker
    updated_complaint = GeneralComplaintService.assign_worker(
        db_session, complaint["id"], worker.id, notes="Please check during morning shifts"
    )
    assert updated_complaint["assigned_worker_id"] == worker.id
    assert updated_complaint["status"] == "ASSIGNED"
    assert updated_complaint["authority_notes"] == "Please check during morning shifts"


# =====================================================================
# API / Router Layer Tests
# =====================================================================

def test_api_list_complaints(client):
    response = client.get("/api/city/general/complaints")
    assert response.status_code == 200
    json_data = response.json()
    assert "items" in json_data
    assert "total_items" in json_data


def test_api_create_worker(client):
    worker_payload = {
        "first_name": "Marcus",
        "last_name": "Aurelius",
        "email": "marcus@municipal.gov",
        "phone": "+919988776655",
        "password": "philosophicalpwd",
        "designation": "Street Inspector",
        "skill": "Road Repair",
        "experience": 10
    }
    response = client.post("/api/city/general/workers", json=worker_payload)
    if response.status_code != 201:
        print("API create worker failed with body:", response.json())
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["first_name"] == "Marcus"
    assert json_data["email"] == "marcus@municipal.gov"
