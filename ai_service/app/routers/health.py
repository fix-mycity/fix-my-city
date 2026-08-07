from fastapi import APIRouter
from app.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "env": settings.ENV,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
