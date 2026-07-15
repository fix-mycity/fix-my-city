from enum import Enum

class ComplaintCategory(str, Enum):
    NO_WATER = "NO_WATER"
    LOW_PRESSURE = "LOW_PRESSURE"
    PIPE_LEAK = "PIPE_LEAK"
    DIRTY_WATER = "DIRTY_WATER"
    BROKEN_PIPE = "BROKEN_PIPE"
    OVERFLOW = "OVERFLOW"
    OTHER = "OTHER"

class ComplaintPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplaintStatus(str, Enum):
    NEW = "NEW"
    ACCEPTED = "ACCEPTED"
    WORKER_ASSIGNED = "WORKER_ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"

# Transition mapping rules: Status -> Set of allowed statuses to change to
VALID_STATUS_TRANSITIONS = {
    ComplaintStatus.NEW: {ComplaintStatus.ACCEPTED, ComplaintStatus.REJECTED, ComplaintStatus.CLOSED},
    ComplaintStatus.ACCEPTED: {ComplaintStatus.WORKER_ASSIGNED, ComplaintStatus.REJECTED, ComplaintStatus.CLOSED},
    ComplaintStatus.WORKER_ASSIGNED: {ComplaintStatus.IN_PROGRESS, ComplaintStatus.CLOSED},
    ComplaintStatus.IN_PROGRESS: {ComplaintStatus.COMPLETED, ComplaintStatus.CLOSED},
    ComplaintStatus.COMPLETED: {ComplaintStatus.VERIFIED, ComplaintStatus.CLOSED},
    ComplaintStatus.VERIFIED: {ComplaintStatus.CLOSED},
    ComplaintStatus.REJECTED: {ComplaintStatus.CLOSED},
    ComplaintStatus.CLOSED: set()
}

class WorkerAvailability(str, Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    ON_LEAVE = "ON_LEAVE"
    OFFLINE = "OFFLINE"

class WorkerEmploymentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    RETIRED = "RETIRED"

class WorkerSkill(str, Enum):
    LEAK_REPAIR = "Leak Repair"
    PIPELINE_REPAIR = "Pipeline Repair"
    VALVE_OPERATION = "Valve Operation"
    TANK_MAINTENANCE = "Water Tank Maintenance"
    QUALITY_TESTING = "Quality Testing"
    GENERAL_MAINTENANCE = "General Maintenance"

