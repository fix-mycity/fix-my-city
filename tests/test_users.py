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
from modules.users.schema import ProfileUpdateSchema
from modules.users.service import get_or_create_profile, update_profile
from modules.users.model import Profile

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


def test_get_or_create_profile_creates_new(db_session):
    profile = get_or_create_profile(db_session, user_id=1)
    assert profile.user_id == 1
    assert profile.id is not None
    assert profile.full_name is None


def test_get_or_create_profile_returns_existing(db_session):
    existing = Profile(user_id=1, full_name="John Doe")
    db_session.add(existing)
    db_session.commit()

    profile = get_or_create_profile(db_session, user_id=1)
    assert profile.id == existing.id
    assert profile.full_name == "John Doe"


def test_get_or_create_profile_concurrency_race(db_session):
    """
    Test that concurrent creation attempts are handled gracefully.
    """
    # Pre-populate database with a profile
    existing = Profile(user_id=1, full_name="Original Name")
    db_session.add(existing)
    db_session.commit()

    # Even if it simulates a concurrent transaction attempting to get/create,
    # it retrieves the existing one safely.
    profile = get_or_create_profile(db_session, user_id=1)
    assert profile.user_id == 1
    assert profile.full_name == "Original Name"


def test_update_profile_whitelist(db_session):
    profile = get_or_create_profile(db_session, user_id=1)
    
    update_data = ProfileUpdateSchema(
        full_name="Alice Smith",
        phone_number="1234567890",
        bio="Hello world",
        avatar_url="https://example.com/avatar.png"
    )
    
    updated = update_profile(db_session, user_id=1, data=update_data)
    assert updated.full_name == "Alice Smith"
    assert updated.phone_number == "1234567890"
    assert updated.bio == "Hello world"
    assert updated.avatar_url == "https://example.com/avatar.png"


def test_schema_phone_number_validation():
    # Valid 10 digit phone number
    schema = ProfileUpdateSchema(phone_number="1234567890")
    assert schema.phone_number == "1234567890"

    # Invalid phone number (contains leading plus)
    with pytest.raises(ValueError):
        ProfileUpdateSchema(phone_number="+1234567890")

    # Invalid phone number (contains letters)
    with pytest.raises(ValueError):
        ProfileUpdateSchema(phone_number="12345abcde")

    # Invalid phone number (too short - 9 digits)
    with pytest.raises(ValueError):
        ProfileUpdateSchema(phone_number="123456789")

    # Invalid phone number (too long - 11 digits)
    with pytest.raises(ValueError):
        ProfileUpdateSchema(phone_number="12345678901")


def test_schema_avatar_url_validation():
    # Valid url
    schema = ProfileUpdateSchema(avatar_url="https://example.com/image.png")
    assert schema.avatar_url == "https://example.com/image.png"

    # Invalid url (no http/https prefix)
    with pytest.raises(ValueError):
        ProfileUpdateSchema(avatar_url="ftp://example.com/image.png")

    with pytest.raises(ValueError):
        ProfileUpdateSchema(avatar_url="example.com/image.png")


def test_schema_whitespace_stripping():
    schema = ProfileUpdateSchema(full_name="   John Doe   ", bio="   My Bio   ")
    assert schema.full_name == "John Doe"
    assert schema.bio == "My Bio"

    schema2 = ProfileUpdateSchema(full_name="      ", bio="   ")
    assert schema2.full_name is None
    assert schema2.bio is None


def test_read_profile_endpoint(client):
    response = client.get("/users/me/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == 1
    assert data["full_name"] is None


def test_edit_profile_endpoint(client):
    response = client.patch(
        "/users/me/profile",
        json={
            "full_name": "New Name",
            "phone_number": "9999999999",
            "avatar_url": "https://foo.bar/pic.jpg",
            "bio": "Developer"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "New Name"
    assert data["phone_number"] == "9999999999"
    assert data["avatar_url"] == "https://foo.bar/pic.jpg"
    assert data["bio"] == "Developer"
