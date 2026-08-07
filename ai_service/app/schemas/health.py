from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    env: str
    gemini_configured: bool
