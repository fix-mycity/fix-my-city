from database import SessionLocal
from modules.water_management.service import WaterFieldWorkerService

db = SessionLocal()
items, total = WaterFieldWorkerService.list_workers(db, page=1, page_size=1000)
print("Total items:", total)
for i in items:
    print(f"ID: {i.id}, Name: {i.first_name} {i.last_name}, Status: {i.employment_status}, Avail: {i.availability}")
