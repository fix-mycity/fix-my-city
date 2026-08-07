import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

@pytest.fixture(autouse=True)
def test_settings():
    """Ensure consistent settings for tests."""
    settings.ENV = "testing"
    settings.GEMINI_API_KEY = "fake_key_for_testing"
    settings.INTERNAL_API_KEY = "test_internal_key"
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
