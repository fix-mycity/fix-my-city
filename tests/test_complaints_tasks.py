import sys
import os
import pytest
from unittest.mock import patch, Mock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add city_operation_service to path so we can import from it
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "city_operation_service")))

from database import Base
from modules.complaints.model import Complaint, ComplaintMediaStatus

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

@patch("modules.complaints.tasks.SessionLocal")
@patch("httpx.Client.post")
def test_classify_and_route_complaint_task_auto_route(mock_post, mock_session_local, db_session):
    """
    Test that a complaint with high AI confidence and supportive image is auto-routed.
    """
    # 1. Setup mock SessionLocal to use our in-memory SQLite db
    mock_session_local.return_value = db_session
    
    # 2. Setup mock AI service response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "complaint_id": 101,
        "issue_type": "pothole",
        "confidence_score": 0.89,
        "reasoning": "Visible road crack and deep asphalt cavity in center lane.",
        "primary_focal_point": "pothole",
        "image_text_agreement": "SUPPORTIVE"
    }
    mock_response.raise_for_status = lambda: None
    mock_post.return_value = mock_response

    # 3. Create test complaint in SQLite
    complaint = Complaint(
        id=101,
        title="Nasty pothole",
        description="There is a big pothole near the crossing.",
        location_lat=12.97,
        location_lng=77.59,
        image_url="http://s3.com/fmc-upload-101.jpg",
        media_status="MEDIA_READY",
        ai_routing_status="PENDING",
        department="general",
        status="PENDING",
        reported_by=1
    )
    db_session.add(complaint)
    db_session.commit()

    # 4. Call the celery task directly
    from modules.complaints.tasks import classify_and_route_complaint_task
    classify_and_route_complaint_task(101)

    # 5. Assert database updates using a new session context (since task closes SessionLocal)
    check_session = TestingSessionLocal()
    try:
        updated_complaint = check_session.query(Complaint).filter(Complaint.id == 101).first()
        assert updated_complaint.ai_routing_status == "SUCCESS"
        assert updated_complaint.department == "traffic"  # mapped from pothole -> traffic
        assert updated_complaint.status == "ASSIGNED"
        assert updated_complaint.ai_issue_type == "pothole"
        assert updated_complaint.ai_confidence == 0.89
        assert updated_complaint.ai_image_agreement == "SUPPORTIVE"
        assert "Visible road crack" in updated_complaint.ai_reasoning
    finally:
        check_session.close()

@patch("modules.complaints.tasks.SessionLocal")
@patch("httpx.Client.post")
def test_classify_and_route_complaint_task_manual_triage(mock_post, mock_session_local, db_session):
    """
    Test that low confidence or contradictory agreement routes to PENDING_TRIAGE.
    """
    mock_session_local.return_value = db_session
    
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "complaint_id": 102,
        "issue_type": "water_leak",
        "confidence_score": 0.95,
        "reasoning": "The image is an indoor selfie which has nothing to do with the reported leak.",
        "primary_focal_point": "face",
        "image_text_agreement": "CONTRADICTORY"  # Contradictory image
    }
    mock_response.raise_for_status = lambda: None
    mock_post.return_value = mock_response

    complaint = Complaint(
        id=102,
        title="Water leak on street",
        description="Pipe burst at intersection",
        location_lat=12.97,
        location_lng=77.59,
        image_url="http://s3.com/fmc-upload-102.jpg",
        media_status="MEDIA_READY",
        ai_routing_status="PENDING",
        department="general",
        status="PENDING",
        reported_by=1
    )
    db_session.add(complaint)
    db_session.commit()

    from modules.complaints.tasks import classify_and_route_complaint_task
    classify_and_route_complaint_task(102)

    # Assert database updates using a new session context (since task closes SessionLocal)
    check_session = TestingSessionLocal()
    try:
        updated_complaint = check_session.query(Complaint).filter(Complaint.id == 102).first()
        assert updated_complaint.ai_routing_status == "PENDING_TRIAGE"
        assert updated_complaint.department == "general"  # left in general
        assert updated_complaint.status == "PENDING"      # not auto-assigned
        assert updated_complaint.ai_image_agreement == "CONTRADICTORY"
    finally:
        check_session.close()
