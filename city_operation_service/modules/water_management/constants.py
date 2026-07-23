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

class AssignmentStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    TRAVELLING = "TRAVELLING"
    ARRIVED = "ARRIVED"
    WORK_STARTED = "WORK_STARTED"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"
    REOPENED = "REOPENED"

VALID_ASSIGNMENT_TRANSITIONS = {
    AssignmentStatus.ASSIGNED: {AssignmentStatus.ACCEPTED, AssignmentStatus.REJECTED},
    AssignmentStatus.ACCEPTED: {AssignmentStatus.TRAVELLING, AssignmentStatus.REJECTED},
    AssignmentStatus.REJECTED: {AssignmentStatus.ASSIGNED},
    AssignmentStatus.TRAVELLING: {AssignmentStatus.ARRIVED},
    AssignmentStatus.ARRIVED: {AssignmentStatus.WORK_STARTED},
    AssignmentStatus.WORK_STARTED: {AssignmentStatus.ON_HOLD, AssignmentStatus.COMPLETED},
    AssignmentStatus.ON_HOLD: {AssignmentStatus.WORK_STARTED, AssignmentStatus.COMPLETED},
    AssignmentStatus.COMPLETED: {AssignmentStatus.VERIFIED, AssignmentStatus.REOPENED},
    AssignmentStatus.REOPENED: {AssignmentStatus.ASSIGNED, AssignmentStatus.ACCEPTED},
    AssignmentStatus.VERIFIED: set()
}

class WaterSupplyType(str, Enum):
    REGULAR = "REGULAR"
    SPECIAL = "SPECIAL"
    EMERGENCY = "EMERGENCY"

class WaterSupplyStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

VALID_SUPPLY_STATUS_TRANSITIONS = {
    WaterSupplyStatus.SCHEDULED: {WaterSupplyStatus.ACTIVE, WaterSupplyStatus.CANCELLED},
    WaterSupplyStatus.ACTIVE: {WaterSupplyStatus.PAUSED, WaterSupplyStatus.COMPLETED, WaterSupplyStatus.CANCELLED},
    WaterSupplyStatus.PAUSED: {WaterSupplyStatus.ACTIVE, WaterSupplyStatus.COMPLETED, WaterSupplyStatus.CANCELLED},
    WaterSupplyStatus.COMPLETED: set(),
    WaterSupplyStatus.CANCELLED: set()
}

class PipelineType(str, Enum):
    MAIN_LINE = "MAIN_LINE"
    SUB_LINE = "SUB_LINE"
    SERVICE_LINE = "SERVICE_LINE"
    DISTRIBUTION_LINE = "DISTRIBUTION_LINE"

class PipelineMaterial(str, Enum):
    PVC = "PVC"
    HDPE = "HDPE"
    DI = "DI"
    STEEL = "STEEL"
    CI = "CI"
    OTHER = "OTHER"

class PipelineCondition(str, Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"
    CRITICAL = "CRITICAL"

class PipelineStatus(str, Enum):
    ACTIVE = "ACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    DAMAGED = "DAMAGED"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"
    REPLACED = "REPLACED"

VALID_PIPELINE_STATUS_TRANSITIONS = {
    PipelineStatus.ACTIVE: {PipelineStatus.UNDER_MAINTENANCE, PipelineStatus.DAMAGED, PipelineStatus.OUT_OF_SERVICE},
    PipelineStatus.UNDER_MAINTENANCE: {PipelineStatus.ACTIVE, PipelineStatus.DAMAGED, PipelineStatus.OUT_OF_SERVICE},
    PipelineStatus.DAMAGED: {PipelineStatus.UNDER_MAINTENANCE, PipelineStatus.OUT_OF_SERVICE, PipelineStatus.REPLACED, PipelineStatus.ACTIVE},
    PipelineStatus.OUT_OF_SERVICE: {PipelineStatus.ACTIVE, PipelineStatus.UNDER_MAINTENANCE, PipelineStatus.REPLACED},
    PipelineStatus.REPLACED: set()
}

class TankType(str, Enum):
    OVERHEAD_TANK = "OVERHEAD_TANK"
    UNDERGROUND_TANK = "UNDERGROUND_TANK"
    RESERVOIR = "RESERVOIR"
    TANKER = "TANKER"

class TankStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    EMPTY = "EMPTY"
    FULL = "FULL"
    LOW_LEVEL = "LOW_LEVEL"

class WaterQualitySampleType(str, Enum):
    PIPELINE = "PIPELINE"
    OVERHEAD_TANK = "OVERHEAD_TANK"
    UNDERGROUND_TANK = "UNDERGROUND_TANK"
    PUBLIC_TAP = "PUBLIC_TAP"
    RESERVOIR = "RESERVOIR"

class WaterQualityOverallStatus(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    UNSAFE = "UNSAFE"
    UNDER_REVIEW = "UNDER_REVIEW"

class WaterQualityAlertType(str, Enum):
    HIGH_TDS = "HIGH_TDS"
    LOW_CHLORINE = "LOW_CHLORINE"
    LOW_PH = "LOW_PH"
    HIGH_PH = "HIGH_PH"
    BACTERIA_FOUND = "BACTERIA_FOUND"
    HIGH_TURBIDITY = "HIGH_TURBIDITY"
    CHEMICAL_CONTAMINATION = "CHEMICAL_CONTAMINATION"

class WaterQualityAlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class QualityInspectionStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class MaintenanceType(str, Enum):
    PIPELINE_REPAIR = "PIPELINE_REPAIR"
    TANK_CLEANING = "TANK_CLEANING"
    TANK_REPAIR = "TANK_REPAIR"
    VALVE_REPLACEMENT = "VALVE_REPLACEMENT"
    PUMP_REPAIR = "PUMP_REPAIR"
    LEAK_REPAIR = "LEAK_REPAIR"
    QUALITY_INSPECTION = "QUALITY_INSPECTION"
    EMERGENCY_REPAIR = "EMERGENCY_REPAIR"
    GENERAL_MAINTENANCE = "GENERAL_MAINTENANCE"

class MaintenanceSourceType(str, Enum):
    COMPLAINT = "COMPLAINT"
    PIPELINE = "PIPELINE"
    TANK = "TANK"
    QUALITY = "QUALITY"
    EMERGENCY = "EMERGENCY"
    MANUAL = "MANUAL"

class MaintenancePriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class MaintenanceStatus(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_PARTS = "WAITING_PARTS"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"
    CANCELLED = "CANCELLED"

class MaintenancePhotoType(str, Enum):
    BEFORE = "BEFORE"
    DURING = "DURING"
    AFTER = "AFTER"

VALID_MAINTENANCE_STATUS_TRANSITIONS = {
    MaintenanceStatus.PENDING: {MaintenanceStatus.SCHEDULED, MaintenanceStatus.CANCELLED},
    MaintenanceStatus.SCHEDULED: {MaintenanceStatus.ASSIGNED, MaintenanceStatus.CANCELLED, MaintenanceStatus.PENDING},
    MaintenanceStatus.ASSIGNED: {MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.SCHEDULED, MaintenanceStatus.CANCELLED},
    MaintenanceStatus.IN_PROGRESS: {MaintenanceStatus.WAITING_PARTS, MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED},
    MaintenanceStatus.WAITING_PARTS: {MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED, MaintenanceStatus.COMPLETED},
    MaintenanceStatus.COMPLETED: {MaintenanceStatus.VERIFIED},
    MaintenanceStatus.VERIFIED: set(),
    MaintenanceStatus.CANCELLED: set()
}

class EmergencyType(str, Enum):
    PIPELINE_BURST = "PIPELINE_BURST"
    MAJOR_LEAK = "MAJOR_LEAK"
    CONTAMINATION = "CONTAMINATION"
    PUMP_FAILURE = "PUMP_FAILURE"
    POWER_FAILURE = "POWER_FAILURE"
    TANK_DAMAGE = "TANK_DAMAGE"
    VALVE_FAILURE = "VALVE_FAILURE"
    FLOOD = "FLOOD"
    MAINTENANCE = "MAINTENANCE"
    OTHER = "OTHER"

class EmergencyPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EmergencyStatus(str, Enum):
    DECLARED = "DECLARED"
    IN_PROGRESS = "IN_PROGRESS"
    SUPPLY_STOPPED = "SUPPLY_STOPPED"
    REPAIRING = "REPAIRING"
    TESTING = "TESTING"
    RESTORED = "RESTORED"
    CLOSED = "CLOSED"

VALID_EMERGENCY_STATUS_TRANSITIONS = {
    EmergencyStatus.DECLARED: {EmergencyStatus.IN_PROGRESS, EmergencyStatus.SUPPLY_STOPPED, EmergencyStatus.CLOSED},
    EmergencyStatus.IN_PROGRESS: {EmergencyStatus.SUPPLY_STOPPED, EmergencyStatus.REPAIRING, EmergencyStatus.CLOSED},
    EmergencyStatus.SUPPLY_STOPPED: {EmergencyStatus.REPAIRING, EmergencyStatus.CLOSED},
    EmergencyStatus.REPAIRING: {EmergencyStatus.TESTING, EmergencyStatus.CLOSED},
    EmergencyStatus.TESTING: {EmergencyStatus.RESTORED, EmergencyStatus.REPAIRING, EmergencyStatus.CLOSED},
    EmergencyStatus.RESTORED: {EmergencyStatus.CLOSED},
    EmergencyStatus.CLOSED: set()
}

class NotificationType(str, Enum):
    GENERAL = "GENERAL"
    COMPLAINT = "COMPLAINT"
    WORK_ASSIGNMENT = "WORK_ASSIGNMENT"
    SUPPLY = "SUPPLY"
    PIPELINE = "PIPELINE"
    TANK = "TANK"
    QUALITY = "QUALITY"
    MAINTENANCE = "MAINTENANCE"
    EMERGENCY = "EMERGENCY"
    SYSTEM = "SYSTEM"

class NotificationPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RecipientType(str, Enum):
    ALL_CITIZENS = "ALL_CITIZENS"
    SPECIFIC_WARD = "SPECIFIC_WARD"
    SPECIFIC_AREA = "SPECIFIC_AREA"
    FIELD_WORKERS = "FIELD_WORKERS"
    AUTHORITY = "AUTHORITY"
    SPECIFIC_USER = "SPECIFIC_USER"

class DeliveryChannel(str, Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"
    SMS = "SMS"
    PUSH = "PUSH"

class NotificationStatus(str, Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    SENDING = "SENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    ARCHIVED = "ARCHIVED"

VALID_NOTIFICATION_STATUS_TRANSITIONS = {
    NotificationStatus.DRAFT: {NotificationStatus.SCHEDULED, NotificationStatus.SENDING, NotificationStatus.SENT, NotificationStatus.FAILED, NotificationStatus.ARCHIVED},
    NotificationStatus.SCHEDULED: {NotificationStatus.SENDING, NotificationStatus.SENT, NotificationStatus.FAILED, NotificationStatus.ARCHIVED},
    NotificationStatus.SENDING: {NotificationStatus.SENT, NotificationStatus.FAILED},
    NotificationStatus.SENT: {NotificationStatus.ARCHIVED},
    NotificationStatus.FAILED: {NotificationStatus.SENDING, NotificationStatus.SENT, NotificationStatus.ARCHIVED},
    NotificationStatus.ARCHIVED: set()
}







