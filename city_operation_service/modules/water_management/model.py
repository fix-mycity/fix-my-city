from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Date, Time, Boolean

# Rest of imports and classes...
# We keep lines 2 to 115 intact, and modify the imports at line 1, and insert the class at line 115.

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base, engine

class WaterComplaint(Base):
    __tablename__ = "water_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    central_complaint_id = Column(Integer, nullable=True, index=True)
    
    # User reference without foreign key constraint (since tables are split across service DB boundaries)
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
    status = Column(String(50), default="NEW", nullable=False, index=True)
    
    assigned_worker_id = Column(Integer, nullable=True, index=True)
    authority_notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    before_image = Column(String(500), nullable=True)
    after_image = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class WaterFieldWorker(Base):
    __tablename__ = "water_field_workers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    photo = Column(Text, nullable=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    address = Column(Text, nullable=True)
    place = Column(String(100), nullable=True)
    pin_code = Column(String(20), nullable=True)
    designation = Column(String(100), nullable=True)
    skill = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    joining_date = Column(DateTime(timezone=True), nullable=True)
    availability = Column(String(30), default="AVAILABLE", nullable=False)
    employment_status = Column(String(30), default="ACTIVE", nullable=False)
    emergency_contact_phone = Column(String(30), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class WorkerAssignment(Base):
    __tablename__ = "worker_assignments"

    id = Column(Integer, primary_key=True, index=True)
    assignment_number = Column(String(50), unique=True, index=True, nullable=False)
    complaint_id = Column(Integer, ForeignKey("water_complaints.id"), nullable=False, index=True)
    worker_id = Column(Integer, ForeignKey("water_field_workers.id"), nullable=False, index=True)
    assigned_by = Column(Integer, nullable=True)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)
    priority = Column(String(30), default="MEDIUM", nullable=False, index=True)
    remarks = Column(Text, nullable=True)
    status = Column(String(50), default="ASSIGNED", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    complaint = relationship("WaterComplaint", backref="assignments")
    worker = relationship("WaterFieldWorker", backref="assignments")

class WorkerTaskUpdate(Base):
    __tablename__ = "worker_task_updates"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("worker_assignments.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    before_image = Column(Text, nullable=True)
    after_image = Column(Text, nullable=True)
    materials_used = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignment = relationship("WorkerAssignment", backref="task_updates")

class AuthorityVerification(Base):
    __tablename__ = "authority_verifications"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("worker_assignments.id"), nullable=False, index=True)
    verified_by = Column(Integer, nullable=True)
    verification_status = Column(String(50), nullable=False) # APPROVED, REJECTED
    remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

    assignment = relationship("WorkerAssignment", backref="verifications")

class WaterSupplySchedule(Base):
    __tablename__ = "water_supply_schedules"

    id = Column(Integer, primary_key=True, index=True)
    schedule_number = Column(String(50), unique=True, index=True, nullable=False)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    street = Column(String(200), nullable=True)
    supply_type = Column(String(50), nullable=False) # REGULAR, SPECIAL, EMERGENCY
    supply_date = Column(Date, nullable=False)
    morning_start_time = Column(Time, nullable=True)
    morning_end_time = Column(Time, nullable=True)
    evening_start_time = Column(Time, nullable=True)
    evening_end_time = Column(Time, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    water_source = Column(String(100), nullable=True)
    tank_name = Column(String(100), nullable=True)
    pipeline_name = Column(String(100), nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False) # SCHEDULED, ACTIVE, PAUSED, COMPLETED, CANCELLED
    remarks = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class WaterPipeline(Base):
    __tablename__ = "water_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_number = Column(String(50), unique=True, index=True, nullable=False)
    pipeline_name = Column(String(150), nullable=True)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    street = Column(String(200), nullable=True)
    pipeline_type = Column(String(50), nullable=False) # MAIN_LINE, SUB_LINE, SERVICE_LINE, DISTRIBUTION_LINE
    diameter = Column(Float, nullable=True)
    length = Column(Float, nullable=True)
    material = Column(String(50), nullable=False) # PVC, HDPE, DI, STEEL, CI, OTHER
    installation_date = Column(Date, nullable=True)
    expected_life = Column(Integer, nullable=True) # years
    water_source = Column(String(150), nullable=True)
    start_location = Column(String(250), nullable=True)
    end_location = Column(String(250), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    condition = Column(String(50), default="EXCELLENT", nullable=False) # EXCELLENT, GOOD, FAIR, POOR, CRITICAL
    pressure_level = Column(Float, nullable=True)
    current_status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, UNDER_MAINTENANCE, DAMAGED, OUT_OF_SERVICE, REPLACED
    last_inspection = Column(Date, nullable=True)
    next_inspection = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inspections = relationship("PipelineInspection", back_populates="pipeline", cascade="all, delete-orphan")
    maintenances = relationship("PipelineMaintenance", back_populates="pipeline", cascade="all, delete-orphan")

class PipelineInspection(Base):
    __tablename__ = "pipeline_inspections"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("water_pipelines.id", ondelete="CASCADE"), nullable=False, index=True)
    inspection_date = Column(Date, nullable=False)
    inspector_name = Column(String(150), nullable=False)
    condition = Column(String(50), nullable=False)
    pressure_level = Column(Float, nullable=True)
    leak_detected = Column(Boolean, default=False, nullable=False)
    remarks = Column(Text, nullable=True)
    next_inspection = Column(Date, nullable=True)

    pipeline = relationship("WaterPipeline", back_populates="inspections")

class PipelineMaintenance(Base):
    __tablename__ = "pipeline_maintenances"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("water_pipelines.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(100), nullable=False)
    reason = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False) # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_worker = Column(String(150), nullable=True)
    remarks = Column(Text, nullable=True)

    pipeline = relationship("WaterPipeline", back_populates="maintenances")

class WaterTank(Base):
    __tablename__ = "water_tanks"

    id = Column(Integer, primary_key=True, index=True)
    tank_number = Column(String(50), unique=True, index=True, nullable=False)
    tank_name = Column(String(150), nullable=True)
    tank_type = Column(String(50), nullable=False) # OVERHEAD_TANK, UNDERGROUND_TANK, RESERVOIR, TANKER
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    capacity_liters = Column(Float, nullable=False)
    current_level_liters = Column(Float, default=0.0, nullable=False)
    minimum_level = Column(Float, nullable=True)
    maximum_level = Column(Float, nullable=True)
    water_source = Column(String(150), nullable=True)
    pipeline_id = Column(Integer, ForeignKey("water_pipelines.id", ondelete="SET NULL"), nullable=True)
    installation_date = Column(Date, nullable=True)
    last_cleaned_date = Column(Date, nullable=True)
    next_cleaning_date = Column(Date, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, INACTIVE, UNDER_MAINTENANCE, EMPTY, FULL, LOW_LEVEL
    remarks = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    pipeline = relationship("WaterPipeline")
    refills = relationship("TankRefillHistory", back_populates="tank", cascade="all, delete-orphan")
    maintenances = relationship("TankMaintenanceHistory", back_populates="tank", cascade="all, delete-orphan")

class TankRefillHistory(Base):
    __tablename__ = "tank_refill_history"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    refill_date = Column(Date, nullable=False)
    previous_level = Column(Float, nullable=False)
    refilled_amount = Column(Float, nullable=False)
    current_level = Column(Float, nullable=False)
    water_source = Column(String(150), nullable=True)
    operator_name = Column(String(150), nullable=True)
    remarks = Column(Text, nullable=True)

    tank = relationship("WaterTank", back_populates="refills")

class TankMaintenanceHistory(Base):
    __tablename__ = "tank_maintenance_history"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(100), nullable=False) # CLEANING, REPAIR, INSPECTION, REPLACEMENT
    reason = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    assigned_worker = Column(String(150), nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False) # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    remarks = Column(Text, nullable=True)

    tank = relationship("WaterTank", back_populates="maintenances")

class WaterQuality(Base):
    __tablename__ = "water_quality"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, index=True, nullable=False)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=False, index=True)
    area = Column(String(150), nullable=False, index=True)
    pipeline_id = Column(Integer, ForeignKey("water_pipelines.id", ondelete="SET NULL"), nullable=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id", ondelete="SET NULL"), nullable=True)
    sample_location = Column(String(200), nullable=True)
    sample_type = Column(String(50), nullable=False) # PIPELINE, OVERHEAD_TANK, UNDERGROUND_TANK, PUBLIC_TAP, RESERVOIR
    sample_date = Column(Date, nullable=False)
    tested_by = Column(String(150), nullable=True)
    laboratory_name = Column(String(150), nullable=True)
    ph_level = Column(Float, nullable=False)
    tds = Column(Float, nullable=False)
    turbidity = Column(Float, nullable=False)
    chlorine_level = Column(Float, nullable=False)
    hardness = Column(Float, nullable=True)
    iron = Column(Float, nullable=True)
    fluoride = Column(Float, nullable=True)
    nitrate = Column(Float, nullable=True)
    bacteria_present = Column(Boolean, default=False, nullable=False)
    temperature = Column(Float, nullable=True)
    odor = Column(String(100), nullable=True)
    color = Column(String(100), nullable=True)
    taste = Column(String(100), nullable=True)
    overall_status = Column(String(50), default="UNDER_REVIEW", nullable=False) # SAFE, WARNING, UNSAFE, UNDER_REVIEW
    remarks = Column(Text, nullable=True)
    next_test_date = Column(Date, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    pipeline = relationship("WaterPipeline")
    tank = relationship("WaterTank")
    alerts = relationship("QualityAlert", back_populates="quality_report", cascade="all, delete-orphan")

class QualityInspectionSchedule(Base):
    __tablename__ = "quality_inspection_schedules"

    id = Column(Integer, primary_key=True, index=True)
    inspection_number = Column(String(50), unique=True, index=True, nullable=False)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=False, index=True)
    area = Column(String(150), nullable=False, index=True)
    sample_location = Column(String(200), nullable=True)
    inspection_date = Column(Date, nullable=False)
    assigned_inspector = Column(String(150), nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False) # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class QualityAlert(Base):
    __tablename__ = "quality_alerts"

    id = Column(Integer, primary_key=True, index=True)
    quality_report_id = Column(Integer, ForeignKey("water_quality.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(100), nullable=False) # HIGH_TDS, LOW_CHLORINE, LOW_PH, HIGH_PH, BACTERIA_FOUND, HIGH_TURBIDITY, CHEMICAL_CONTAMINATION
    severity = Column(String(50), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, RESOLVED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quality_report = relationship("WaterQuality", back_populates="alerts")

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    maintenance_number = Column(String(50), unique=True, index=True, nullable=False)
    maintenance_type = Column(String(50), nullable=False, index=True) # PIPELINE_REPAIR, TANK_CLEANING, etc.
    source_type = Column(String(50), nullable=False, index=True) # COMPLAINT, PIPELINE, TANK, QUALITY, EMERGENCY, MANUAL
    source_reference_id = Column(Integer, nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=False, index=True)
    area = Column(String(150), nullable=False, index=True)
    priority = Column(String(30), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, SCHEDULED, ASSIGNED, etc.
    scheduled_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    expected_completion = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    assigned_supervisor = Column(String(150), nullable=True)
    assigned_team = Column(String(150), nullable=True)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    actual_cost = Column(Float, default=0.0, nullable=False)
    remarks = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tasks = relationship("MaintenanceTask", back_populates="maintenance", cascade="all, delete-orphan")
    materials = relationship("MaintenanceMaterial", back_populates="maintenance", cascade="all, delete-orphan")
    photos = relationship("MaintenancePhoto", back_populates="maintenance", cascade="all, delete-orphan")
    histories = relationship("MaintenanceHistory", back_populates="maintenance", cascade="all, delete-orphan")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    maintenance_id = Column(Integer, ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(Integer, nullable=True, index=True)
    task_name = Column(String(150), nullable=False)
    task_description = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    remarks = Column(Text, nullable=True)

    maintenance = relationship("MaintenanceRequest", back_populates="tasks")

class MaintenanceMaterial(Base):
    __tablename__ = "maintenance_materials"

    id = Column(Integer, primary_key=True, index=True)
    maintenance_id = Column(Integer, ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    material_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    cost = Column(Float, default=0.0, nullable=False)
    supplier = Column(String(150), nullable=True)

    maintenance = relationship("MaintenanceRequest", back_populates="materials")

class MaintenancePhoto(Base):
    __tablename__ = "maintenance_photos"

    id = Column(Integer, primary_key=True, index=True)
    maintenance_id = Column(Integer, ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_type = Column(String(50), nullable=False, index=True) # BEFORE, DURING, AFTER
    image_url = Column(Text, nullable=False)
    uploaded_by = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    maintenance = relationship("MaintenanceRequest", back_populates="photos")

class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id = Column(Integer, primary_key=True, index=True)
    maintenance_id = Column(Integer, ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(150), nullable=False)
    performed_by = Column(String(150), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    maintenance = relationship("MaintenanceRequest", back_populates="histories")

class EmergencyShutdown(Base):
    __tablename__ = "emergency_shutdowns"

    id = Column(Integer, primary_key=True, index=True)
    shutdown_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    emergency_type = Column(String(50), nullable=False, index=True) # PIPELINE_BURST, MAJOR_LEAK, CONTAMINATION, PUMP_FAILURE, POWER_FAILURE, TANK_DAMAGE, VALVE_FAILURE, FLOOD, MAINTENANCE, OTHER
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="DECLARED", nullable=False, index=True) # DECLARED, IN_PROGRESS, SUPPLY_STOPPED, REPAIRING, TESTING, RESTORED, CLOSED
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=False, index=True)
    area = Column(String(150), nullable=False, index=True)
    affected_pipeline_id = Column(Integer, ForeignKey("water_pipelines.id", ondelete="SET NULL"), nullable=True, index=True)
    affected_tank_id = Column(Integer, ForeignKey("water_tanks.id", ondelete="SET NULL"), nullable=True, index=True)
    affected_schedule_id = Column(Integer, ForeignKey("water_supply_schedules.id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(Text, nullable=True)
    shutdown_start = Column(DateTime(timezone=True), nullable=False)
    expected_restore_time = Column(DateTime(timezone=True), nullable=True)
    actual_restore_time = Column(DateTime(timezone=True), nullable=True)
    assigned_supervisor = Column(String(150), nullable=True)
    assigned_team = Column(String(150), nullable=True)
    citizen_notification_sent = Column(Boolean, default=False, nullable=False)
    remarks = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    pipeline = relationship("WaterPipeline")
    tank = relationship("WaterTank")
    schedule = relationship("WaterSupplySchedule")
    affected_areas = relationship("EmergencyAffectedArea", back_populates="shutdown", cascade="all, delete-orphan")
    teams = relationship("EmergencyResponseTeam", back_populates="shutdown", cascade="all, delete-orphan")
    timelines = relationship("EmergencyTimeline", back_populates="shutdown", cascade="all, delete-orphan")
    notifications = relationship("EmergencyNotification", back_populates="shutdown", cascade="all, delete-orphan")

class EmergencyAffectedArea(Base):
    __tablename__ = "emergency_affected_areas"

    id = Column(Integer, primary_key=True, index=True)
    shutdown_id = Column(Integer, ForeignKey("emergency_shutdowns.id", ondelete="CASCADE"), nullable=False, index=True)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=False, index=True)
    area = Column(String(150), nullable=False, index=True)
    population = Column(Integer, default=0, nullable=False)

    shutdown = relationship("EmergencyShutdown", back_populates="affected_areas")

class EmergencyResponseTeam(Base):
    __tablename__ = "emergency_response_teams"

    id = Column(Integer, primary_key=True, index=True)
    shutdown_id = Column(Integer, ForeignKey("emergency_shutdowns.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(Integer, ForeignKey("water_field_workers.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(100), nullable=False)
    status = Column(String(50), default="ASSIGNED", nullable=False) # ASSIGNED, ACTIVE, COMPLETED, RELEASED
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    shutdown = relationship("EmergencyShutdown", back_populates="teams")
    worker = relationship("WaterFieldWorker")

class EmergencyTimeline(Base):
    __tablename__ = "emergency_timelines"

    id = Column(Integer, primary_key=True, index=True)
    shutdown_id = Column(Integer, ForeignKey("emergency_shutdowns.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(150), nullable=False)
    performed_by = Column(String(150), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shutdown = relationship("EmergencyShutdown", back_populates="timelines")

class EmergencyNotification(Base):
    __tablename__ = "emergency_notifications"

    id = Column(Integer, primary_key=True, index=True)
    shutdown_id = Column(Integer, ForeignKey("emergency_shutdowns.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_title = Column(String(200), nullable=False)
    notification_message = Column(Text, nullable=False)
    notification_status = Column(String(50), default="PENDING", nullable=False) # PENDING, SENT, FAILED
    sent_at = Column(DateTime(timezone=True), nullable=True)

    shutdown = relationship("EmergencyShutdown", back_populates="notifications")


class WaterNotification(Base):
    __tablename__ = "water_notifications"

    id = Column(Integer, primary_key=True, index=True)
    notification_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, index=True) # GENERAL, COMPLAINT, WORK_ASSIGNMENT, SUPPLY, PIPELINE, TANK, QUALITY, MAINTENANCE, EMERGENCY, SYSTEM
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    target_type = Column(String(50), nullable=True) # COMPLAINT, PIPELINE, TANK, EMERGENCY, etc.
    target_reference_id = Column(Integer, nullable=True, index=True)
    zone = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    recipient_type = Column(String(100), nullable=False, index=True) # ALL_CITIZENS, SPECIFIC_WARD, SPECIFIC_AREA, FIELD_WORKERS, AUTHORITY, SPECIFIC_USER
    recipient_count = Column(Integer, default=0, nullable=False)
    delivery_channel = Column(String(50), nullable=False, index=True) # IN_APP, EMAIL, SMS, PUSH
    status = Column(String(50), default="DRAFT", nullable=False, index=True) # DRAFT, SCHEDULED, SENDING, SENT, FAILED, ARCHIVED
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    sent_time = Column(DateTime(timezone=True), nullable=True)
    read_count = Column(Integer, default=0, nullable=False)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    recipients = relationship("NotificationRecipient", back_populates="notification", cascade="all, delete-orphan")
    histories = relationship("NotificationHistory", back_populates="notification", cascade="all, delete-orphan")

class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("water_notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(Integer, nullable=True, index=True) # e.g. citizen/worker ID
    recipient_name = Column(String(150), nullable=True)
    delivery_status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, DELIVERED, FAILED
    read_status = Column(String(50), default="UNREAD", nullable=False, index=True) # UNREAD, READ
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    notification = relationship("WaterNotification", back_populates="recipients")

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(100), unique=True, index=True, nullable=False)
    template_type = Column(String(50), nullable=False, index=True)
    subject = Column(String(200), nullable=True)
    body = Column(Text, nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True) # ACTIVE, INACTIVE

class NotificationHistory(Base):
    __tablename__ = "notification_histories"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("water_notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(150), nullable=False)
    performed_by = Column(String(150), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    notification = relationship("WaterNotification", back_populates="histories")


class WaterCitizenAccess(Base):
    __tablename__ = "water_citizen_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False, index=True)
    service_status = Column(String(50), default="ENABLED", nullable=False, index=True) # ENABLED, DISABLED
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WaterDepartmentSettings(Base):
    __tablename__ = "water_department_settings"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(200), nullable=False)
    department_code = Column(String(50), nullable=False, unique=True)
    office_name = Column(String(200), nullable=False)
    office_email = Column(String(150), nullable=False)
    office_phone = Column(String(30), nullable=False)
    office_address = Column(Text, nullable=False)
    working_days = Column(String(200), nullable=False) # e.g. Mon-Fri
    working_hours = Column(String(100), nullable=False) # e.g. 09:00-17:00
    emergency_contact_name = Column(String(150), nullable=False)
    emergency_contact_phone = Column(String(30), nullable=False)
    default_supply_start = Column(String(30), nullable=True) # e.g. 06:00
    default_supply_end = Column(String(30), nullable=True) # e.g. 09:00
    notification_email = Column(Boolean, default=True, nullable=False)
    notification_sms = Column(Boolean, default=True, nullable=False)
    notification_push = Column(Boolean, default=True, nullable=False)
    dashboard_refresh_interval = Column(Integer, default=30, nullable=False) # seconds
    report_default_format = Column(String(10), default="PDF", nullable=False) # PDF, EXCEL, CSV
    timezone = Column(String(100), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DepartmentProfile(Base):
    __tablename__ = "water_department_profiles"

    id = Column(Integer, primary_key=True, index=True)
    department_logo = Column(String(500), nullable=True)
    department_banner = Column(String(500), nullable=True)
    department_description = Column(Text, nullable=True)
    website = Column(String(250), nullable=True)
    social_links = Column(Text, nullable=True) # JSON or Comma-separated links
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# Create tables in Database automatically
Base.metadata.create_all(bind=engine)



