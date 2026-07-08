import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://fixmycity:fixmycity_pass@postgres:5432/fixmycity_db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ENV = os.getenv("ENV", "development")

settings = Settings()
