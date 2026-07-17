import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ensure we can import from modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from modules.complaints.model import Complaint, ComplaintDepartment, ComplaintStatus
from modules.traffic_management.model import TrafficWorkerProfile

load_dotenv()

def seed_complaints():
    db = SessionLocal()
    try:
        # Clear existing complaints
        print("Deleting existing complaints...")
        db.query(Complaint).delete()
        db.commit()
        
        print("Adding new dummy complaints...")
        
        incidents = [
            {
                "title": "Massive Pothole on Main Street",
                "description": "There is a very large pothole forming on the right lane of Main St near the crossing.",
                "location_lat": 10.0245,
                "location_lng": 76.3090,
                "department": ComplaintDepartment.TRAFFIC.value,
                "status": ComplaintStatus.PENDING.value,
                "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Traffic_Thevally_Bridge_Kollam_Kerala_Mar22_A7C_01797.jpg?width=800",
                "reported_by": 1
            },
            {
                "title": "Broken Traffic Light",
                "description": "The traffic light at the intersection of 5th and Broadway is stuck on red.",
                "location_lat": 10.0210,
                "location_lng": 76.3110,
                "department": ComplaintDepartment.TRAFFIC.value,
                "status": ComplaintStatus.PENDING.value,
                "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Ponkunnam_Town,_Kottayam,_Kerala,_India.jpg?width=800",
                "reported_by": 1
            },
            {
                "title": "Minor Accident Blocking Lane",
                "description": "Two cars rear-ended each other and are blocking the left lane.",
                "location_lat": 10.0260,
                "location_lng": 76.3150,
                "department": ComplaintDepartment.TRAFFIC.value,
                "status": ComplaintStatus.PENDING.value,
                "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/KSRTC_GARUDA_SANCHARI_VOLVO_BUS_IN_TRAFFIC_BLOCK.jpg?width=800",
                "reported_by": 1
            },
            {
                "title": "Flooded Road Segment",
                "description": "Water logging after heavy rain is making it hard for smaller vehicles to pass.",
                "location_lat": 10.0280,
                "location_lng": 76.3180,
                "department": ComplaintDepartment.TRAFFIC.value,
                "status": ComplaintStatus.PENDING.value,
                "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Omassery_Bus_stand_Traffic.jpg?width=800",
                "reported_by": 1
            },
            {
                "title": "Tree Fallen on Road",
                "description": "A large branch fell over the road blocking traffic completely.",
                "location_lat": 10.0300,
                "location_lng": 76.3050,
                "department": ComplaintDepartment.TRAFFIC.value,
                "status": ComplaintStatus.PENDING.value,
                "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Traffic_in_the_middle_of_the_tea_garden.jpg?width=800",
                "reported_by": 1
            }
        ]
        
        for inc in incidents:
            complaint = Complaint(**inc)
            db.add(complaint)
            
        db.commit()
        print(f"Successfully seeded {len(incidents)} new complaints with proper images.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_complaints()
