from fastapi import FastAPI
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from modules.users.router import router as users_router
from modules.complaints.router import router as complaints_router
from modules.waste_management.router import router as waste_router
from modules.traffic_management.router import router as traffic_router
from modules.water_management.router import router as water_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fix My City - City Operation Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(complaints_router)
app.include_router(waste_router)
app.include_router(traffic_router)
app.include_router(water_router)

@app.get("/")
def home():
    return {"message": "City Operation Service is running."}
