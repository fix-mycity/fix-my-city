from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Date, Time, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class WasteComplaint(Base):
    __tablename__ = "waste_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    
    citizen_id = Column(Integer, nullable=True, index=True)
    citizen_name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    category = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(30), default="MEDIUM", nullable=False, index=True)
    status = Column(String(50), default="PENDING", nullable=False, index=True)
    
    assigned_worker_id = Column(Integer, nullable=True, index=True)
    authority_notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    before_image = Column(String(500), nullable=True)
    after_image = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class WasteComplaintHistory(Base):
    __tablename__ = "waste_complaint_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, nullable=False, index=True)
    action = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    performed_by = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WasteBin(Base):
    __tablename__ = "waste_bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(50), unique=True, index=True, nullable=False)
    location = Column(String(200), nullable=False)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    
    waste_type = Column(String(50), default="General", nullable=False, index=True)
    capacity_liters = Column(Integer, default=1100, nullable=False)
    fill_level_percentage = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="Empty", nullable=False, index=True)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    installation_date = Column(Date, nullable=True)
    qr_code_data = Column(String(500), nullable=True)
    assigned_route_id = Column(Integer, nullable=True, index=True)
    
    last_emptied_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WasteVehicle(Base):
    __tablename__ = "waste_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), default="Compactor", nullable=False)
    capacity_tons = Column(Float, default=5.0, nullable=False)
    status = Column(String(50), default="Available", nullable=False, index=True)
    
    driver_id = Column(Integer, nullable=True, index=True)
    driver_name = Column(String(150), nullable=True)
    assigned_route_id = Column(Integer, nullable=True, index=True)
    fuel_type = Column(String(30), default="Diesel", nullable=True)
    current_location = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_serviced_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WasteWorker(Base):
    __tablename__ = "waste_workers"

    id = Column(Integer, primary_key=True, index=True)
    worker_id_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    phone = Column(String(30), nullable=False)
    role = Column(String(50), default="Cleaner", nullable=False)
    
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True)
    status = Column(String(50), default="Active", nullable=False, index=True)
    shift = Column(String(30), default="Morning", nullable=False)
    
    performance_rating = Column(Float, default=4.8, nullable=False)
    assigned_vehicle_id = Column(Integer, nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WasteWorkerAttendance(Base):
    __tablename__ = "waste_worker_attendance"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, nullable=False, index=True)
    date = Column(Date, nullable=False)
    status = Column(String(30), default="Present", nullable=False)
    check_in_time = Column(String(30), nullable=True)
    check_out_time = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WasteCollectionSchedule(Base):
    __tablename__ = "waste_collection_schedules"

    id = Column(Integer, primary_key=True, index=True)
    schedule_code = Column(String(50), unique=True, index=True, nullable=False)
    route_name = Column(String(150), nullable=False)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    
    start_point = Column(String(200), default="Central Depot Base", nullable=True)
    end_point = Column(String(200), default="Waste Processing Landfill", nullable=True)
    distance_km = Column(Float, default=12.5, nullable=False)
    estimated_minutes = Column(Integer, default=45, nullable=False)
    
    vehicle_id = Column(Integer, nullable=True, index=True)
    driver_worker_id = Column(Integer, nullable=True, index=True)
    assigned_worker_ids = Column(String(200), nullable=True)
    
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(String(30), nullable=True)
    
    waste_type = Column(String(50), default="General Waste", nullable=False)
    total_bins_count = Column(Integer, default=0, nullable=False)
    collected_bins_count = Column(Integer, default=0, nullable=False)
    collected_weight_tons = Column(Float, default=0.0, nullable=False)
    
    status = Column(String(50), default="Planned", nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WasteWorkerAssignment(Base):
    __tablename__ = "waste_worker_assignments"

    id = Column(Integer, primary_key=True, index=True)
    assignment_code = Column(String(50), unique=True, index=True, nullable=False)
    worker_id = Column(Integer, nullable=False, index=True)
    schedule_id = Column(Integer, nullable=True, index=True)
    complaint_id = Column(Integer, nullable=True, index=True)
    
    task_description = Column(Text, nullable=False)
    priority = Column(String(30), default="MEDIUM", nullable=False)
    status = Column(String(50), default="ASSIGNED", nullable=False, index=True)
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class WasteMaintenanceTask(Base):
    __tablename__ = "waste_maintenance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    work_order_number = Column(String(50), unique=True, index=True, nullable=False)
    asset_type = Column(String(50), default="Vehicle", nullable=False, index=True)
    asset_id = Column(Integer, nullable=True, index=True)
    asset_name = Column(String(150), nullable=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(30), default="Medium", nullable=False, index=True)
    status = Column(String(50), default="Pending", nullable=False, index=True)
    
    assigned_worker_id = Column(Integer, nullable=True, index=True)
    assigned_worker_name = Column(String(150), nullable=True)
    
    estimated_cost = Column(Float, default=0.0, nullable=False)
    actual_cost = Column(Float, default=0.0, nullable=False)
    
    scheduled_date = Column(Date, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WasteNotification(Base):
    __tablename__ = "waste_notifications"

    id = Column(Integer, primary_key=True, index=True)
    notification_type = Column(String(50), default="Worker Assignment", nullable=False, index=True)  # Worker Assignment, Collection Reminder, Bin Full Alert, Vehicle Maintenance, Emergency Alert
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="Unread", nullable=False, index=True)  # Unread, Read, Archived
    
    target_role = Column(String(50), nullable=True)
    recipient_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
