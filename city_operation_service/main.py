from fastapi import FastAPI
from database import Base, engine
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from modules.users.router import router as users_router
from modules.complaints.router import router as complaints_router
from modules.waste_management.router import router as waste_router
from modules.traffic_management.router import router as traffic_router
from modules.water_management.router import router as water_router
from modules.workers.router import router as workers_router
from modules.super_admin.router import router as super_admin_router
from modules.feed.router import router as feed_router
from modules.general.router import root_router as general_router
from modules.emergency.router import router as emergency_router

# Ensure worker models including leave_requests and worker_profiles exist in database
import modules.workers.model
import modules.complaints.model
import modules.waste_management.model
import modules.feed.model
import modules.general.model
import modules.emergency.model

Base.metadata.create_all(bind=engine)

# Auto-migrate schema columns for complaints & waste management if tables existed previously
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolution_image VARCHAR(500);"))
        conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;"))
        conn.execute(text("ALTER TABLE water_complaints ADD COLUMN IF NOT EXISTS central_complaint_id INTEGER;"))
        # Waste management schema migrations
        conn.execute(text("ALTER TABLE waste_collection_schedules ADD COLUMN IF NOT EXISTS start_point VARCHAR(200);"))
        conn.execute(text("ALTER TABLE waste_collection_schedules ADD COLUMN IF NOT EXISTS end_point VARCHAR(200);"))
        conn.execute(text("ALTER TABLE waste_collection_schedules ADD COLUMN IF NOT EXISTS distance_km FLOAT DEFAULT 12.5;"))
        conn.execute(text("ALTER TABLE waste_collection_schedules ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 45;"))
        conn.execute(text("ALTER TABLE waste_collection_schedules ADD COLUMN IF NOT EXISTS assigned_worker_ids VARCHAR(200);"))
        
        conn.execute(text("ALTER TABLE waste_vehicles ADD COLUMN IF NOT EXISTS assigned_route_id INTEGER;"))
        conn.execute(text("ALTER TABLE waste_vehicles ADD COLUMN IF NOT EXISTS latitude FLOAT;"))
        conn.execute(text("ALTER TABLE waste_vehicles ADD COLUMN IF NOT EXISTS longitude FLOAT;"))
        conn.execute(text("ALTER TABLE waste_vehicles ADD COLUMN IF NOT EXISTS last_serviced_at TIMESTAMP WITH TIME ZONE;"))
        
        conn.execute(text("ALTER TABLE waste_workers ADD COLUMN IF NOT EXISTS assigned_vehicle_id INTEGER;"))
        conn.execute(text("ALTER TABLE waste_workers ADD COLUMN IF NOT EXISTS performance_rating FLOAT DEFAULT 4.8;"))
        
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS area VARCHAR(100);"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS latitude FLOAT;"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS longitude FLOAT;"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS assigned_route_id INTEGER;"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS installation_date DATE;"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS qr_code_data VARCHAR(255);"))
        conn.execute(text("ALTER TABLE waste_bins ADD COLUMN IF NOT EXISTS last_emptied_at TIMESTAMP WITH TIME ZONE;"))
        conn.commit()
except Exception as _e:
    print(f"Migration check notice: {_e}")

app = FastAPI(
    title="Fix My City - City Operation Service",
    version="1.0.0",
    root_path="/api/city"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(complaints_router)
app.include_router(waste_router)
app.include_router(traffic_router)
app.include_router(water_router)
app.include_router(workers_router)
app.include_router(super_admin_router)
app.include_router(feed_router)
app.include_router(general_router)
app.include_router(emergency_router)

@app.get("/")
def home():
    return {"message": "City Operation Service is running."}
