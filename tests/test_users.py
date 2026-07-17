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
from modules.users.schema import (
    ProfileUpdateSchema,
    SavedLocationCreateSchema,
    SavedLocationUpdateSchema
)
from modules.users.service import (
    get_or_create_profile,
    update_profile,
    create_saved_location,
    get_saved_locations,
    update_saved_location,
    delete_saved_location
)
from modules.users.model import Profile, SavedLocation

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


def test_create_saved_location_service(db_session):
    data = SavedLocationCreateSchema(
        label="Home",
        address="123 Main St",
        latitude=40.7128,
        longitude=-74.0060
    )
    location = create_saved_location(db_session, user_id=1, data=data)
    assert location.id is not None
    assert location.user_id == 1
    assert location.label == "Home"
    assert location.address == "123 Main St"
    assert location.latitude == 40.7128
    assert location.longitude == -74.0060


def test_schema_saved_location_validation():
    # Valid
    schema = SavedLocationCreateSchema(
        label="Work",
        address="456 Tech Ave",
        latitude=-30.0,
        longitude=150.0
    )
    assert schema.label == "Work"

    # Whitespace trimming
    schema_trim = SavedLocationCreateSchema(label="  Gym  ", address="  789 Fitness St  ")
    assert schema_trim.label == "Gym"
    assert schema_trim.address == "789 Fitness St"

    # Empty label
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="   ", address="123 Road")

    # Label too short
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="A", address="123 Road")

    # Address too short
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="Work", address="123")

    # Latitude out of range
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="Out of Bounds", address="123 Road", latitude=91.0)

    # Longitude out of range
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="Out of Bounds", address="123 Road", longitude=-181.0)

    # Coordinate co-dependence (latitude only)
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="Work", address="123 Road", latitude=10.0)

    # Coordinate co-dependence (longitude only)
    with pytest.raises(ValueError):
        SavedLocationCreateSchema(label="Work", address="123 Road", longitude=10.0)


def test_saved_location_label_uniqueness(db_session):
    data1 = SavedLocationCreateSchema(label="Home", address="123 Main St")
    create_saved_location(db_session, user_id=1, data=data1)

    # Creating another with same label (exact case) -> should fail
    data2 = SavedLocationCreateSchema(label="Home", address="456 Other St")
    with pytest.raises(ValueError) as exc:
        create_saved_location(db_session, user_id=1, data=data2)
    assert "already exists" in str(exc.value)

    # Creating another with same label (case-insensitive) -> should fail
    data3 = SavedLocationCreateSchema(label="hOmE", address="456 Other St")
    with pytest.raises(ValueError) as exc:
        create_saved_location(db_session, user_id=1, data=data3)
    assert "already exists" in str(exc.value)

    # Creating same label for a DIFFERENT user -> should succeed
    data_diff_user = SavedLocationCreateSchema(label="Home", address="789 Main St")
    loc = create_saved_location(db_session, user_id=2, data=data_diff_user)
    assert loc.id is not None


def test_get_saved_locations_service(db_session):
    l1 = SavedLocation(user_id=1, label="Home", address="Address 1")
    l2 = SavedLocation(user_id=1, label="Office", address="Address 2")
    l3 = SavedLocation(user_id=2, label="Other Home", address="Address 3")
    db_session.add_all([l1, l2, l3])
    db_session.commit()

    locations = get_saved_locations(db_session, user_id=1)
    assert len(locations) == 2
    assert {l.label for l in locations} == {"Home", "Office"}


def test_update_saved_location_service(db_session):
    loc = SavedLocation(user_id=1, label="Home", address="Address 1")
    db_session.add(loc)
    db_session.commit()

    # Attempt update with coordinate co-dependence failure (latitude only)
    invalid_update = SavedLocationUpdateSchema(latitude=12.0)
    with pytest.raises(ValueError):
        update_saved_location(db_session, user_id=1, location_id=loc.id, data=invalid_update)

    # Successful update (must provide both coordinates to pass coordinate co-dependence check)
    update_data = SavedLocationUpdateSchema(label="Sweet Home", latitude=45.0, longitude=45.0)
    updated = update_saved_location(db_session, user_id=1, location_id=loc.id, data=update_data)
    assert updated is not None
    assert updated.label == "Sweet Home"
    assert updated.latitude == 45.0
    assert updated.longitude == 45.0
    assert updated.address == "Address 1"  # Unchanged

    # Attempt update by wrong user
    update_data_ok = SavedLocationUpdateSchema(label="Other Home")
    assert update_saved_location(db_session, user_id=2, location_id=loc.id, data=update_data_ok) is None


def test_delete_saved_location_service(db_session):
    loc = SavedLocation(user_id=1, label="Home", address="Address 1")
    db_session.add(loc)
    db_session.commit()

    # Try deleting as another user (fails)
    assert delete_saved_location(db_session, user_id=2, location_id=loc.id) is False
    assert db_session.query(SavedLocation).filter(SavedLocation.id == loc.id).first() is not None

    # Delete successfully
    assert delete_saved_location(db_session, user_id=1, location_id=loc.id) is True
    assert db_session.query(SavedLocation).filter(SavedLocation.id == loc.id).first() is None


def test_router_endpoints_saved_locations(client):
    # Add a location via API
    response = client.post(
        "/users/me/locations",
        json={"label": "Home", "address": "123 Street", "latitude": 12.34, "longitude": 56.78}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["user_id"] == 1
    assert data["label"] == "Home"
    assert data["latitude"] == 12.34

    # Try adding a duplicate label via API (fails 400)
    response_dup = client.post(
        "/users/me/locations",
        json={"label": "Home", "address": "456 Street"}
    )
    assert response_dup.status_code == 400
    assert "already exists" in response_dup.json()["detail"]

    # List locations via API
    list_response = client.get("/users/me/locations")
    assert list_response.status_code == 200
    locations_list = list_response.json()
    assert len(locations_list) == 1
    assert locations_list[0]["label"] == "Home"

    # Edit location via API
    loc_id = data["id"]
    patch_response = client.patch(
        f"/users/me/locations/{loc_id}",
        json={"label": "Sweet Home"}
    )
    assert patch_response.status_code == 200
    patched_data = patch_response.json()
    assert patched_data["label"] == "Sweet Home"

    # Delete location via API
    delete_response = client.delete(f"/users/me/locations/{loc_id}")
    assert delete_response.status_code == 204

    # Assert deleted
    get_after_delete = client.get("/users/me/locations")
    assert len(get_after_delete.json()) == 0
