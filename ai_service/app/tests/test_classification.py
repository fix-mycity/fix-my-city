from unittest.mock import AsyncMock, patch
from app.core.gemini import GeminiClassificationOutput

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["gemini_configured"] is True  # Fake key in conftest makes this True

def test_classification_auth_missing(client):
    payload = {
        "complaint_id": 1,
        "title": "trash",
        "description": "trash pile",
        "image_url": "http://example.com/image.jpg"
    }
    response = client.post("/v1/classify-complaint", json=payload)
    assert response.status_code == 401
    assert "Missing internal API key header" in response.json()["detail"]

def test_classification_auth_invalid(client):
    payload = {
        "complaint_id": 1,
        "title": "trash",
        "description": "trash pile",
        "image_url": "http://example.com/image.jpg"
    }
    headers = {"X-Internal-API-Key": "wrong_key"}
    response = client.post("/v1/classify-complaint", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Invalid internal API key" in response.json()["detail"]

@patch("app.routers.classification.analyze_complaint", new_callable=AsyncMock)
@patch("httpx.AsyncClient.get")
def test_classify_complaint_success(mock_http_get, mock_analyze_complaint, client):
    # 1. Mock S3 download
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.content = b"fake_image_bytes"
    mock_response.raise_for_status = lambda: None
    mock_http_get.return_value = mock_response

    # 2. Mock Gemini analyzer
    mock_analyze_complaint.return_value = GeminiClassificationOutput(
        issue_type="garbage_accumulation",
        confidence_score=0.92,
        reasoning="Visual evidence shows black garbage bags piled up.",
        primary_focal_point="garbage bags",
        image_text_agreement="SUPPORTIVE"
    )

    # 3. Call endpoint
    payload = {
        "complaint_id": 12,
        "title": "Litter on road",
        "description": "Lots of trash bags on the sidewalk.",
        "image_url": "http://example.com/image.jpg"
    }
    headers = {"X-Internal-API-Key": "test_internal_key"}
    response = client.post("/v1/classify-complaint", json=payload, headers=headers)

    # 4. Verify results
    assert response.status_code == 200
    data = response.json()
    assert data["complaint_id"] == 12
    assert data["issue_type"] == "garbage_accumulation"
    assert data["confidence_score"] == 0.92
    assert data["reasoning"] == "Visual evidence shows black garbage bags piled up."
    assert data["primary_focal_point"] == "garbage bags"
    assert data["image_text_agreement"] == "SUPPORTIVE"

    # Verify correct S3 mock call
    mock_http_get.assert_called_once_with("http://example.com/image.jpg")
    mock_analyze_complaint.assert_called_once()
