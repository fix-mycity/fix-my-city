from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional, List
from datetime import date

from .schema import (
    WasteComplaintCreate, WasteComplaintUpdate, WasteComplaintStatusUpdate, WasteComplaintAssignWorker,
    WasteComplaintResponse, WasteComplaintList, WasteComplaintHistoryResponse,
    WasteBinCreate, WasteBinUpdate, WasteBinFillLevelUpdate, WasteBinRouteAssign,
    WasteBinResponse, WasteBinList,
    WasteVehicleCreate, WasteVehicleUpdate, WasteVehicleAssignDriverRoute, WasteVehicleStatusUpdate,
    WasteVehicleResponse, WasteVehicleList,
    WasteWorkerCreate, WasteWorkerUpdate, WasteWorkerAttendanceRecord, WasteWorkerAttendanceResponse,
    WasteWorkerResponse, WasteWorkerList,
    WasteCollectionScheduleCreate, WasteCollectionScheduleUpdate, WasteCollectionScheduleAssignWorkers, WasteCollectionScheduleStatusUpdate,
    WasteCollectionScheduleResponse, WasteCollectionScheduleList,
    WasteMaintenanceTaskCreate, WasteMaintenanceTaskUpdate, WasteMaintenanceTaskStatusUpdate,
    WasteMaintenanceTaskResponse, WasteMaintenanceTaskList,
    WasteNotificationCreate, WasteNotificationUpdate, WasteNotificationResponse, WasteNotificationList,
    WasteAnalyticsResponse,
    WasteDashboardSummaryResponse
)
from .service import (
    WasteDashboardService,
    WasteComplaintService,
    WasteBinService,
    WasteVehicleService,
    WasteWorkerService,
    WasteScheduleService,
    WasteMaintenanceService,
    WasteNotificationService,
    WasteAnalyticsService
)

router = APIRouter(prefix="/waste", tags=["Waste Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------------------------------
# 1. Dashboard Statistics & Overview Endpoint
# ----------------------------------------------------
@router.get("/dashboard/summary", response_model=WasteDashboardSummaryResponse)
def get_waste_dashboard_summary(db: Session = Depends(get_db)):
    """Fetch complete Waste Management Dashboard statistics, charts, and activity feeds."""
    return WasteDashboardService.get_dashboard_summary(db)

# ----------------------------------------------------
# 2. Waste Complaints Endpoints
# ----------------------------------------------------
@router.get("/complaints/dashboard-summary")
def get_waste_complaints_dashboard_summary(db: Session = Depends(get_db)):
    """Fetch complaint status metrics matching Water Authority API structure."""
    return WasteComplaintService.get_complaints_dashboard_summary(db)

@router.get("/complaints", response_model=WasteComplaintList)
def get_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated, searchable, filterable, and sorted waste complaints."""
    return WasteComplaintService.get_complaints(
        db, page, page_size, status, priority, category, ward, area, search, sort_by
    )

@router.post("/complaints", response_model=WasteComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    schema: WasteComplaintCreate,
    db: Session = Depends(get_db)
):
    """Create a new waste management complaint."""
    return WasteComplaintService.create_complaint(db, schema)

@router.get("/complaints/{id}", response_model=WasteComplaintResponse)
def get_complaint_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve single waste complaint details including history timeline."""
    complaint = WasteComplaintService.get_complaint_by_id(db, id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.put("/complaints/{id}", response_model=WasteComplaintResponse)
def update_complaint(id: int, schema: WasteComplaintUpdate, db: Session = Depends(get_db)):
    """Update complaint details."""
    updated = WasteComplaintService.update_complaint(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return updated

@router.delete("/complaints/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(id: int, db: Session = Depends(get_db)):
    """Delete complaint record."""
    success = WasteComplaintService.delete_complaint(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return None

@router.patch("/complaints/{id}/status", response_model=WasteComplaintResponse)
def update_complaint_status(id: int, schema: WasteComplaintStatusUpdate, db: Session = Depends(get_db)):
    """Update complaint status (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, REJECTED)."""
    updated = WasteComplaintService.update_status(
        db, id, schema.status, schema.notes, schema.resolution_notes, schema.after_image
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return updated

@router.patch("/complaints/{id}/assign-worker", response_model=WasteComplaintResponse)
def assign_worker(id: int, schema: WasteComplaintAssignWorker, db: Session = Depends(get_db)):
    """Assign field sanitation worker to complaint."""
    updated = WasteComplaintService.assign_worker(db, id, schema.assigned_worker_id, schema.notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return updated

@router.get("/complaints/{id}/history", response_model=List[WasteComplaintHistoryResponse])
def get_complaint_history(id: int, db: Session = Depends(get_db)):
    """Retrieve complaint history timeline audit log."""
    return WasteComplaintService.get_complaint_history(db, id)

# ----------------------------------------------------
# 3. Smart Waste Bins Endpoints
# ----------------------------------------------------
@router.get("/bins", response_model=WasteBinList)
def get_bins(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    waste_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated, searchable, and filterable smart waste bins list."""
    return WasteBinService.get_bins(db, page, page_size, waste_type, status, ward, area, search)

@router.post("/bins", response_model=WasteBinResponse, status_code=status.HTTP_201_CREATED)
def create_bin(schema: WasteBinCreate, db: Session = Depends(get_db)):
    """Add a new smart waste bin."""
    return WasteBinService.create_bin(db, schema)

@router.get("/bins/{id}", response_model=WasteBinResponse)
def get_bin_by_id(id: int, db: Session = Depends(get_db)):
    """Get single waste bin details."""
    waste_bin = WasteBinService.get_bin_by_id(db, id)
    if not waste_bin:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return waste_bin

@router.put("/bins/{id}", response_model=WasteBinResponse)
def update_bin(id: int, schema: WasteBinUpdate, db: Session = Depends(get_db)):
    """Update smart waste bin details."""
    updated = WasteBinService.update_bin(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return updated

@router.delete("/bins/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bin(id: int, db: Session = Depends(get_db)):
    """Delete a smart waste bin."""
    success = WasteBinService.delete_bin(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return None

@router.patch("/bins/{id}/fill-level", response_model=WasteBinResponse)
def update_bin_fill_level(id: int, schema: WasteBinFillLevelUpdate, db: Session = Depends(get_db)):
    """Update smart bin sensor fill level percentage and auto-adjust status."""
    updated = WasteBinService.update_fill_level(db, id, schema.fill_level_percentage, schema.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return updated

@router.patch("/bins/{id}/assign-route", response_model=WasteBinResponse)
def assign_bin_route(id: int, schema: WasteBinRouteAssign, db: Session = Depends(get_db)):
    """Assign smart bin to a collection schedule route."""
    updated = WasteBinService.assign_route(db, id, schema.assigned_route_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return updated

@router.get("/bins/{id}/qr")
def get_bin_qr(id: int, db: Session = Depends(get_db)):
    """Generate and return QR payload data for smart bin."""
    waste_bin = WasteBinService.get_bin_by_id(db, id)
    if not waste_bin:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return {
        "bin_id": waste_bin["id"],
        "bin_code": waste_bin["bin_code"],
        "qr_code_data": waste_bin["qr_code_data"],
        "location": waste_bin["location"],
        "waste_type": waste_bin["waste_type"]
    }

# ----------------------------------------------------
# 4. Collection Schedules & Routes Endpoints
# ----------------------------------------------------
@router.get("/schedules", response_model=WasteCollectionScheduleList)
def get_schedules(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    waste_type: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    scheduled_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated, filterable, and searchable collection route schedules."""
    return WasteScheduleService.get_schedules(
        db, page, page_size, status, waste_type, ward, area, scheduled_date, search
    )

@router.post("/schedules", response_model=WasteCollectionScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(schema: WasteCollectionScheduleCreate, db: Session = Depends(get_db)):
    """Create a new waste collection route schedule."""
    return WasteScheduleService.create_schedule(db, schema)

@router.get("/schedules/today", response_model=List[WasteCollectionScheduleResponse])
def get_today_schedules(db: Session = Depends(get_db)):
    """Retrieve collection routes scheduled for today's date."""
    return WasteScheduleService.get_today_schedules(db)

@router.get("/schedules/calendar", response_model=List[WasteCollectionScheduleResponse])
def get_calendar_schedules(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve collection routes for weekly/monthly calendar feed."""
    return WasteScheduleService.get_calendar_schedules(db, start_date, end_date)

@router.get("/schedules/{id}", response_model=WasteCollectionScheduleResponse)
def get_schedule_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve single collection schedule details."""
    sched = WasteScheduleService.get_schedule_by_id(db, id)
    if not sched:
        raise HTTPException(status_code=404, detail="Collection schedule not found")
    return sched

@router.put("/schedules/{id}", response_model=WasteCollectionScheduleResponse)
def update_schedule(id: int, schema: WasteCollectionScheduleUpdate, db: Session = Depends(get_db)):
    """Update collection route schedule details."""
    updated = WasteScheduleService.update_schedule(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Collection schedule not found")
    return updated

@router.delete("/schedules/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(id: int, db: Session = Depends(get_db)):
    """Delete collection route schedule."""
    success = WasteScheduleService.delete_schedule(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Collection schedule not found")
    return None

@router.patch("/schedules/{id}/assign", response_model=WasteCollectionScheduleResponse)
def assign_schedule_workers(id: int, schema: WasteCollectionScheduleAssignWorkers, db: Session = Depends(get_db)):
    """Assign vehicle, driver, and sanitation workers team to route."""
    updated = WasteScheduleService.assign_workers_and_vehicle(
        db, id, schema.vehicle_id, schema.driver_worker_id, schema.assigned_worker_ids
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Collection schedule not found")
    return updated

@router.patch("/schedules/{id}/status", response_model=WasteCollectionScheduleResponse)
def update_schedule_status(id: int, schema: WasteCollectionScheduleStatusUpdate, db: Session = Depends(get_db)):
    """Update route status (Planned, Active, Completed, Cancelled) and record collected weight."""
    updated = WasteScheduleService.update_schedule_status(
        db, id, schema.status, schema.collected_bins_count, schema.collected_weight_tons
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Collection schedule not found")
    return updated

# ----------------------------------------------------
# 5. Waste Vehicles Endpoints
# ----------------------------------------------------
@router.get("/vehicles", response_model=WasteVehicleList)
def get_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    fuel_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve collection vehicles fleet with search and filters."""
    return WasteVehicleService.get_vehicles(db, page, page_size, status, vehicle_type, fuel_type, search)

@router.post("/vehicles", response_model=WasteVehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(schema: WasteVehicleCreate, db: Session = Depends(get_db)):
    """Add a new waste collection vehicle."""
    return WasteVehicleService.create_vehicle(db, schema)

@router.get("/vehicles/{id}", response_model=WasteVehicleResponse)
def get_vehicle_by_id(id: int, db: Session = Depends(get_db)):
    """Get vehicle details by ID."""
    veh = WasteVehicleService.get_vehicle_by_id(db, id)
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return veh

@router.put("/vehicles/{id}", response_model=WasteVehicleResponse)
def update_vehicle(id: int, schema: WasteVehicleUpdate, db: Session = Depends(get_db)):
    """Update vehicle record."""
    updated = WasteVehicleService.update_vehicle(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return updated

@router.delete("/vehicles/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(id: int, db: Session = Depends(get_db)):
    """Delete vehicle record."""
    success = WasteVehicleService.delete_vehicle(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return None

@router.patch("/vehicles/{id}/assign", response_model=WasteVehicleResponse)
def assign_vehicle_driver_route(id: int, schema: WasteVehicleAssignDriverRoute, db: Session = Depends(get_db)):
    """Assign driver worker and collection schedule route to vehicle."""
    updated = WasteVehicleService.assign_driver_and_route(db, id, schema.driver_id, schema.assigned_route_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return updated

@router.patch("/vehicles/{id}/status", response_model=WasteVehicleResponse)
def update_vehicle_status(id: int, schema: WasteVehicleStatusUpdate, db: Session = Depends(get_db)):
    """Update vehicle operational status (Available, On Route, Maintenance, Breakdown)."""
    updated = WasteVehicleService.update_status(db, id, schema.status, schema.current_location)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return updated

# ----------------------------------------------------
# 6. Waste Workers Endpoints
# ----------------------------------------------------
@router.get("/workers", response_model=WasteWorkerList)
def get_workers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    shift: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve list of waste management field workers."""
    return WasteWorkerService.get_workers(db, page, page_size, role, status, shift, ward, search)

@router.post("/workers", response_model=WasteWorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(schema: WasteWorkerCreate, db: Session = Depends(get_db)):
    """Register a new waste worker."""
    return WasteWorkerService.create_worker(db, schema)

@router.get("/workers/{id}", response_model=WasteWorkerResponse)
def get_worker_by_id(id: int, db: Session = Depends(get_db)):
    """Get worker profile details by ID."""
    wrk = WasteWorkerService.get_worker_by_id(db, id)
    if not wrk:
        raise HTTPException(status_code=404, detail="Worker not found")
    return wrk

@router.put("/workers/{id}", response_model=WasteWorkerResponse)
def update_worker(id: int, schema: WasteWorkerUpdate, db: Session = Depends(get_db)):
    """Update worker profile details."""
    updated = WasteWorkerService.update_worker(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Worker not found")
    return updated

@router.delete("/workers/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worker(id: int, db: Session = Depends(get_db)):
    """Delete worker record."""
    success = WasteWorkerService.delete_worker(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Worker not found")
    return None

@router.post("/workers/{id}/attendance", response_model=WasteWorkerAttendanceResponse)
def record_worker_attendance(id: int, schema: WasteWorkerAttendanceRecord, db: Session = Depends(get_db)):
    """Record daily attendance status (Present, Absent, On Leave) for worker."""
    att = WasteWorkerService.record_attendance(db, id, schema)
    if not att:
        raise HTTPException(status_code=404, detail="Worker not found")
    return att

@router.get("/workers/{id}/attendance", response_model=List[WasteWorkerAttendanceResponse])
def get_worker_attendance(id: int, db: Session = Depends(get_db)):
    """Retrieve attendance history logs for worker."""
    return WasteWorkerService.get_worker_attendance(db, id)

# ----------------------------------------------------
# 7. Waste Maintenance Work Orders Endpoints
# ----------------------------------------------------
@router.get("/maintenance", response_model=WasteMaintenanceTaskList)
def get_maintenance_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    asset_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated, filterable, and searchable maintenance work orders."""
    return WasteMaintenanceService.get_maintenance_tasks(
        db, page, page_size, asset_type, priority, status, search
    )

@router.post("/maintenance", response_model=WasteMaintenanceTaskResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_task(schema: WasteMaintenanceTaskCreate, db: Session = Depends(get_db)):
    """Create a new waste asset maintenance work order."""
    return WasteMaintenanceService.create_maintenance_task(db, schema)

@router.get("/maintenance/{id}", response_model=WasteMaintenanceTaskResponse)
def get_maintenance_task_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve single maintenance work order details."""
    task = WasteMaintenanceService.get_maintenance_task_by_id(db, id)
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance work order not found")
    return task

@router.put("/maintenance/{id}", response_model=WasteMaintenanceTaskResponse)
def update_maintenance_task(id: int, schema: WasteMaintenanceTaskUpdate, db: Session = Depends(get_db)):
    """Update maintenance work order details."""
    updated = WasteMaintenanceService.update_maintenance_task(db, id, schema)
    if not updated:
        raise HTTPException(status_code=404, detail="Maintenance work order not found")
    return updated

@router.delete("/maintenance/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_task(id: int, db: Session = Depends(get_db)):
    """Delete maintenance work order."""
    success = WasteMaintenanceService.delete_maintenance_task(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Maintenance work order not found")
    return None

@router.patch("/maintenance/{id}/status", response_model=WasteMaintenanceTaskResponse)
def update_maintenance_task_status(id: int, schema: WasteMaintenanceTaskStatusUpdate, db: Session = Depends(get_db)):
    """Update work order status (Pending, Assigned, In Progress, Completed) and record actual repair cost."""
    updated = WasteMaintenanceService.update_status(db, id, schema.status, schema.actual_cost, schema.resolution_notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Maintenance work order not found")
    return updated

# ----------------------------------------------------
# 8. Waste Notifications Endpoints
# ----------------------------------------------------
@router.get("/notifications", response_model=WasteNotificationList)
def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    notification_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated, filterable, and searchable notifications center feed."""
    return WasteNotificationService.get_notifications(db, page, page_size, notification_type, status, search)

@router.post("/notifications", response_model=WasteNotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(schema: WasteNotificationCreate, db: Session = Depends(get_db)):
    """Create a new waste management notification item."""
    return WasteNotificationService.create_notification(db, schema)

@router.patch("/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    """Mark all unread waste notifications as read."""
    WasteNotificationService.mark_all_read(db)
    return {"message": "All notifications marked as read"}

@router.patch("/notifications/{id}/read", response_model=WasteNotificationResponse)
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    """Mark single waste notification as read."""
    notif = WasteNotificationService.mark_as_read(db, id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.patch("/notifications/{id}/archive", response_model=WasteNotificationResponse)
def archive_notification(id: int, db: Session = Depends(get_db)):
    """Archive a waste notification."""
    notif = WasteNotificationService.archive_notification(db, id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.delete("/notifications/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(id: int, db: Session = Depends(get_db)):
    """Delete notification record."""
    success = WasteNotificationService.delete_notification(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None

# ----------------------------------------------------
# 9. Reports & Analytics Endpoints
# ----------------------------------------------------
@router.get("/reports/analytics", response_model=WasteAnalyticsResponse)
def get_waste_analytics(
    timeframe: Optional[str] = Query("Monthly"),
    ward: Optional[str] = Query(None),
    vehicle_id: Optional[int] = Query(None),
    worker_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive Waste Management Department Analytics and visual chart data."""
    return WasteAnalyticsService.get_analytics(db, timeframe, ward, vehicle_id, worker_id, status)

@router.get("/reports/export")
def export_waste_report(
    export_format: Optional[str] = Query("csv"),
    timeframe: Optional[str] = Query("Monthly"),
    ward: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export Department Reports data as CSV file download stream."""
    csv_data = WasteAnalyticsService.export_report_data(db, export_format, timeframe, ward)
    filename = f"waste_management_report_{date.today().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
