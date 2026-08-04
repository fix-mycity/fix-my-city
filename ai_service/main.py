from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

# Create DB tables if models are added in the future
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fix My City - AI Service",
    version="1.0.0",
    root_path="/api/ai"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Fix My City - AI Service is running."
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai_service"
    }
