from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# ----------------------------
# 1. Waste Complaints Schemas
# ----------------------------
class WasteComplaintBase(BaseModel):
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"

class WasteComplaintCreate(WasteComplaintBase):
    citizen_id: Optional[int] = None
    before_image: Optional[str] = None

class WasteComplaintUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    assigned_worker_id: Optional[int] = None
    authority_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None

class WasteComplaintStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    after_image: Optional[str] = None

class WasteComplaintAssignWorker(BaseModel):
    assigned_worker_id: int
    notes: Optional[str] = None

class WasteComplaintHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_id: int
    action: str
    notes: Optional[str] = None
    performed_by: Optional[str] = None
    created_at: Optional[datetime] = None

class WasteComplaintResponse(WasteComplaintBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_number: str
    citizen_id: Optional[int] = None
    status: str
    assigned_worker_id: Optional[int] = None
    assigned_worker_name: Optional[str] = None
    assigned_worker_phone: Optional[str] = None
    authority_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    history: Optional[List[WasteComplaintHistoryResponse]] = []

class WasteComplaintList(BaseModel):
    items: List[WasteComplaintResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 2. Waste Bins Schemas
# ----------------------------
class WasteBinBase(BaseModel):
    bin_code: Optional[str] = None
    location: str
    ward: Optional[str] = None
    area: Optional[str] = None
    waste_type: Optional[str] = "General"
    capacity_liters: Optional[int] = 1100
    fill_level_percentage: Optional[float] = 0.0
    status: Optional[str] = "Empty"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    installation_date: Optional[date] = None
    qr_code_data: Optional[str] = None
    assigned_route_id: Optional[int] = None

class WasteBinCreate(WasteBinBase):
    location: str

class WasteBinUpdate(BaseModel):
    bin_code: Optional[str] = None
    location: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    waste_type: Optional[str] = None
    capacity_liters: Optional[int] = None
    fill_level_percentage: Optional[float] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    installation_date: Optional[date] = None
    assigned_route_id: Optional[int] = None

class WasteBinFillLevelUpdate(BaseModel):
    fill_level_percentage: float
    status: Optional[str] = None

class WasteBinRouteAssign(BaseModel):
    assigned_route_id: int
    route_name: Optional[str] = None

class WasteBinResponse(WasteBinBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bin_code: str
    assigned_route_name: Optional[str] = None
    last_emptied_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WasteBinList(BaseModel):
    items: List[WasteBinResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 3. Waste Vehicles Schemas
# ----------------------------
class WasteVehicleBase(BaseModel):
    vehicle_number: str
    vehicle_type: Optional[str] = "Compactor"
    capacity_tons: Optional[float] = 5.0
    status: Optional[str] = "Available"
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    assigned_route_id: Optional[int] = None
    fuel_type: Optional[str] = "Diesel"
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WasteVehicleCreate(WasteVehicleBase):
    vehicle_number: str

class WasteVehicleUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    capacity_tons: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    assigned_route_id: Optional[int] = None
    fuel_type: Optional[str] = None
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WasteVehicleAssignDriverRoute(BaseModel):
    driver_id: Optional[int] = None
    assigned_route_id: Optional[int] = None

class WasteVehicleStatusUpdate(BaseModel):
    status: str
    current_location: Optional[str] = None

class WasteVehicleResponse(WasteVehicleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    assigned_route_name: Optional[str] = None
    last_serviced_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WasteVehicleList(BaseModel):
    items: List[WasteVehicleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 4. Waste Workers Schemas
# ----------------------------
class WasteWorkerBase(BaseModel):
    worker_id_number: Optional[str] = None
    name: str
    email: Optional[str] = None
    phone: str
    role: Optional[str] = "Cleaner"
    ward: Optional[str] = None
    area: Optional[str] = None
    status: Optional[str] = "Active"
    shift: Optional[str] = "Morning"
    performance_rating: Optional[float] = 4.8
    assigned_vehicle_id: Optional[int] = None

class WasteWorkerCreate(WasteWorkerBase):
    name: str
    phone: str

class WasteWorkerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    status: Optional[str] = None
    shift: Optional[str] = None
    performance_rating: Optional[float] = None
    assigned_vehicle_id: Optional[int] = None

class WasteWorkerAttendanceRecord(BaseModel):
    status: str
    date: Optional[date] = None
    check_in_time: Optional[str] = "08:00 AM"

class WasteWorkerAttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    worker_id: int
    date: date
    status: str
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    created_at: Optional[datetime] = None

class WasteWorkerResponse(WasteWorkerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    worker_id_number: str
    assigned_vehicle_number: Optional[str] = None
    assigned_complaints_count: Optional[int] = 0
    attendance_percentage: Optional[float] = 95.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WasteWorkerList(BaseModel):
    items: List[WasteWorkerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 5. Collection Schedules Schemas
# ----------------------------
class WasteCollectionScheduleBase(BaseModel):
    route_name: str
    ward: Optional[str] = None
    area: Optional[str] = None
    start_point: Optional[str] = "Central Depot Base"
    end_point: Optional[str] = "Waste Processing Landfill"
    distance_km: Optional[float] = 12.5
    estimated_minutes: Optional[int] = 45
    vehicle_id: Optional[int] = None
    driver_worker_id: Optional[int] = None
    assigned_worker_ids: Optional[str] = None
    scheduled_date: date
    scheduled_time: Optional[str] = "07:00 AM"
    waste_type: Optional[str] = "General Waste"
    total_bins_count: Optional[int] = 0

class WasteCollectionScheduleCreate(WasteCollectionScheduleBase):
    route_name: str
    scheduled_date: date

class WasteCollectionScheduleUpdate(BaseModel):
    route_name: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None
    distance_km: Optional[float] = None
    estimated_minutes: Optional[int] = None
    vehicle_id: Optional[int] = None
    driver_worker_id: Optional[int] = None
    assigned_worker_ids: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    waste_type: Optional[str] = None
    total_bins_count: Optional[int] = None
    collected_bins_count: Optional[int] = None
    collected_weight_tons: Optional[float] = None
    status: Optional[str] = None

class WasteCollectionScheduleAssignWorkers(BaseModel):
    vehicle_id: Optional[int] = None
    driver_worker_id: Optional[int] = None
    assigned_worker_ids: Optional[str] = None

class WasteCollectionScheduleStatusUpdate(BaseModel):
    status: str
    collected_bins_count: Optional[int] = None
    collected_weight_tons: Optional[float] = None

class WasteCollectionScheduleResponse(WasteCollectionScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    schedule_code: str
    collected_bins_count: int
    collected_weight_tons: float
    status: str
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    assigned_workers_list: Optional[List[Dict[str, Any]]] = []
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WasteCollectionScheduleList(BaseModel):
    items: List[WasteCollectionScheduleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 6. Worker Assignments Schemas
# ----------------------------
class WasteWorkerAssignmentCreate(BaseModel):
    worker_id: int
    schedule_id: Optional[int] = None
    complaint_id: Optional[int] = None
    task_description: str
    priority: Optional[str] = "MEDIUM"

class WasteWorkerAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    assignment_code: str
    worker_id: int
    schedule_id: Optional[int] = None
    complaint_id: Optional[int] = None
    task_description: str
    priority: str
    status: str
    assigned_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# ----------------------------
# 7. Asset Maintenance Schemas
# ----------------------------
class WasteMaintenanceTaskBase(BaseModel):
    asset_type: str = "Vehicle"
    asset_id: Optional[int] = None
    asset_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    assigned_worker_id: Optional[int] = None
    assigned_worker_name: Optional[str] = None
    estimated_cost: Optional[float] = 0.0
    actual_cost: Optional[float] = 0.0
    scheduled_date: Optional[date] = None

class WasteMaintenanceTaskCreate(WasteMaintenanceTaskBase):
    title: str

class WasteMaintenanceTaskUpdate(BaseModel):
    asset_type: Optional[str] = None
    asset_id: Optional[int] = None
    asset_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_worker_id: Optional[int] = None
    assigned_worker_name: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    scheduled_date: Optional[date] = None
    resolution_notes: Optional[str] = None

class WasteMaintenanceTaskStatusUpdate(BaseModel):
    status: str
    actual_cost: Optional[float] = None
    resolution_notes: Optional[str] = None

class WasteMaintenanceTaskResponse(WasteMaintenanceTaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    work_order_number: str
    completed_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WasteMaintenanceTaskList(BaseModel):
    items: List[WasteMaintenanceTaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 8. Notifications Schemas
# ----------------------------
class WasteNotificationBase(BaseModel):
    notification_type: str = "Worker Assignment"
    title: str
    message: str
    status: Optional[str] = "Unread"
    target_role: Optional[str] = None
    recipient_id: Optional[int] = None

class WasteNotificationCreate(WasteNotificationBase):
    title: str
    message: str

class WasteNotificationUpdate(BaseModel):
    status: Optional[str] = None

class WasteNotificationResponse(WasteNotificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None

class WasteNotificationList(BaseModel):
    items: List[WasteNotificationResponse]
    unread_count: int
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------------------
# 9. Reports & Analytics Schemas
# ----------------------------
class WasteAnalyticsResponse(BaseModel):
    timeframe: str  # Daily, Weekly, Monthly, Yearly
    complaint_analytics: List[Dict[str, Any]]
    collection_analytics: List[Dict[str, Any]]
    worker_performance: List[Dict[str, Any]]
    vehicle_usage: List[Dict[str, Any]]
    bin_status: List[Dict[str, Any]]
    collection_efficiency: Dict[str, Any]
    summary_kpis: Dict[str, Any]

# ----------------------------
# 10. Dashboard Summary Schema
# ----------------------------
class DashboardCardItem(BaseModel):
    total_complaints: int
    pending_complaints: int
    completed_collections: int
    total_waste_bins: int
    total_vehicles: int
    total_workers: int
    todays_collections: int

class StatusDistributionItem(BaseModel):
    name: str
    count: int
    percent: int
    color: str

class DailyCollectionItem(BaseModel):
    date: str
    count: int
    weight_tons: float

class WasteCategoryItem(BaseModel):
    category: str
    count: int
    percent: int

class WorkerAssignmentItem(BaseModel):
    id: int
    assignment_code: str
    worker_name: str
    task: str
    status: str
    assigned_at: str

class VehicleUpdateItem(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: str
    status: str
    driver_name: str
    last_location: str

class WasteDashboardSummaryResponse(BaseModel):
    cards: DashboardCardItem
    complaint_status: List[StatusDistributionItem]
    daily_collection: List[DailyCollectionItem]
    vehicle_status: List[StatusDistributionItem]
    waste_categories: List[WasteCategoryItem]
    recent_complaints: List[WasteComplaintResponse]
    worker_assignments: List[WorkerAssignmentItem]
    vehicle_updates: List[VehicleUpdateItem]
