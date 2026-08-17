import sys
import os
import pytest
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
from modules.feed.model import Post, PostStatus, Suggestion
from modules.complaints.model import Complaint, ComplaintStatus, Feedback

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Current Mock User Data
current_mock_user = UserData(id=1, username="testcitizen", email="citizen@example.com", role="Citizen")

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
        return current_mock_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


# =====================================================================
# Verification Tests
# =====================================================================

def test_citizen_cannot_post_to_feed(client):
    global current_mock_user
    current_mock_user = UserData(id=1, username="testcitizen", email="citizen@example.com", role="Citizen")
    
    response = client.post(
        "/feed/posts",
        data={
            "title": "Citizen Event",
            "content": "This should fail",
            "category": "Event"
        }
    )
    assert response.status_code == 403
    assert "Only authorities are allowed to upload public feed posts" in response.json()["detail"]

def test_authority_can_post_to_feed(client, db_session):
    global current_mock_user
    current_mock_user = UserData(id=2, username="water_admin", email="water@dept.gov", role="Department_Admin", permissions=["dept:water"])
    
    response = client.post(
        "/feed/posts",
        data={
            "title": "Official Announcement",
            "content": "Clean water project update",
            "category": "Water"
        }
    )
    assert response.status_code == 201
    post_data = response.json()
    assert post_data["title"] == "Official Announcement"
    assert post_data["author_type"] == "authority"
    assert post_data["status"] == PostStatus.APPROVED.value

def test_suggestions_flow(client, db_session):
    global current_mock_user
    current_mock_user = UserData(id=1, username="testcitizen", email="citizen@example.com", role="Citizen")
    
    # 1. Submit suggestion
    response = client.post(
        "/feed/suggestions/",
        json={
            "title": "Expand Parks",
            "description": "More trees and benches in public parks",
            "category": "General"
        }
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Expand Parks"
    
    # 2. Get my suggestions
    response = client.get("/feed/suggestions/me")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Expand Parks"
    
    # 3. Non-authority cannot get all suggestions
    response = client.get("/feed/suggestions/")
    assert response.status_code == 403
    
    # 4. Authority can get all suggestions
    current_mock_user = UserData(id=2, username="admin", email="admin@city.gov", role="Admin")
    response = client.get("/feed/suggestions/")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_feedback_flow(client, db_session):
    global current_mock_user
    current_mock_user = UserData(id=1, username="testcitizen", email="citizen@example.com", role="Citizen")
    
    # Setup: Create a resolved complaint reported by testcitizen (user_id=1)
    complaint = Complaint(
        reported_by=1,
        title="Pothole in Main St",
        description="Huge pothole near signal",
        status=ComplaintStatus.RESOLVED.value,
        location_lat=12.9,
        location_lng=80.2
    )
    db_session.add(complaint)
    db_session.commit()
    db_session.refresh(complaint)
    
    # 1. Submit feedback on resolved complaint
    response = client.post(
        "/complaints/feedback/",
        json={
            "complaint_id": complaint.id,
            "rating": 5,
            "comment": "Pothole filled quickly. Excellent service!"
        }
    )
    assert response.status_code == 201
    assert response.json()["complaint_id"] == complaint.id
    assert response.json()["rating"] == 5
    assert response.json()["comment"] == "Pothole filled quickly. Excellent service!"
    
    # 2. Get my feedback list
    response = client.get("/complaints/feedback/me")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["complaint_id"] == complaint.id
    
    # 3. Get feedback by complaint ID
    response = client.get(f"/complaints/feedback/complaint/{complaint.id}")
    assert response.status_code == 200
    assert response.json()["rating"] == 5
    
    # 4. Non-authority cannot view all feedback
    response = client.get("/complaints/feedback/")
    assert response.status_code == 403
    
    # 5. Authority can view all feedback
    current_mock_user = UserData(id=2, username="admin", email="admin@city.gov", role="Admin")
    response = client.get("/complaints/feedback/")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_comments_and_reactions_on_feed(client, db_session):
    # Setup: Create a post first
    post = Post(
        author_id=2,
        author_name="Water Department",
        author_type="authority",
        title="Official Alert",
        content="Water interruption tomorrow",
        category="Water",
        status=PostStatus.APPROVED.value
    )
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)
    
    # 1. React to post
    global current_mock_user
    current_mock_user = UserData(id=1, username="testcitizen", email="citizen@example.com", role="Citizen")
    response = client.post(f"/feed/posts/{post.id}/react", json={"reaction_type": "LIKE"})
    assert response.status_code == 200
    assert response.json()["action"] == "added"
    assert response.json()["reactions_count"] == 1
    assert response.json()["has_reacted"] is True
    
    # Fetch visible posts and check reactions metadata
    response = client.get("/feed/posts")
    assert response.status_code == 200
    posts = response.json()
    assert len(posts) == 1
    assert posts[0]["reactions_count"] == 1
    assert posts[0]["has_reacted"] is True
    
    # Toggle reaction off
    response = client.post(f"/feed/posts/{post.id}/react", json={"reaction_type": "LIKE"})
    assert response.status_code == 200
    assert response.json()["action"] == "removed"
    assert response.json()["reactions_count"] == 0
    assert response.json()["has_reacted"] is False
    
    # 2. Comment on post
    response = client.post(
        f"/feed/posts/{post.id}/comments",
        json={"content": "Thanks for the early alert."}
    )
    assert response.status_code == 201
    comment_data = response.json()
    assert comment_data["content"] == "Thanks for the early alert."
    assert comment_data["author_name"] == "testcitizen"
    
    # Get comments
    response = client.get(f"/feed/posts/{post.id}/comments")
    assert response.status_code == 200
    comments = response.json()
    assert len(comments) == 1
    assert comments[0]["content"] == "Thanks for the early alert."
    
    # Delete comment (citizen deletes their own comment)
    response = client.delete(f"/feed/posts/comments/{comment_data['id']}")
    assert response.status_code == 204
    
    # Verify comments list is empty
    response = client.get(f"/feed/posts/{post.id}/comments")
    assert response.status_code == 200
    assert len(response.json()) == 0
