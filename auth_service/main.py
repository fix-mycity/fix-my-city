from fastapi import FastAPI
from database import Base, engine, SessionLocal  # type: ignore
import models  # type: ignore
from routers.auth_router import router as auth_router
from routers.otp_router import router as otp_router
from routers.password_router import router as password_router
from routers.role_router import router as role_router
from routers.permissions_router import router as permissions_router
from routers.locations_router import router as locations_router
from services.role_service import seed_roles, seed_permissions
from services.location_service import seed_locations
from fastapi.middleware.cors import CORSMiddleware

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fix My City Authentication Service",
    version="1.0.0",
    root_path="/api"

)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(otp_router)
app.include_router(password_router)
app.include_router(role_router)
app.include_router(permissions_router)
app.include_router(locations_router)


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_permissions(db)
        seed_locations(db)
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Fix My City Authentication Service"
    }