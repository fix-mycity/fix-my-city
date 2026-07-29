import axiosInstance from "../api/axiosInstance";

export const getWasteDashboardSummary = () => {
  return axiosInstance.get("/city/waste/dashboard/summary");
};

export const getWasteComplaintsDashboardSummary = () => {
  return axiosInstance.get("/city/waste/complaints/dashboard-summary");
};

// Waste Complaints API Methods
export const getWasteComplaints = (params = {}) => {
  return axiosInstance.get("/city/waste/complaints", { params });
};

export const getWasteComplaintById = (id) => {
  return axiosInstance.get(`/city/waste/complaints/${id}`);
};

export const createWasteComplaint = (data) => {
  return axiosInstance.post("/city/waste/complaints", data);
};

export const updateWasteComplaint = (id, data) => {
  return axiosInstance.put(`/city/waste/complaints/${id}`, data);
};

export const deleteWasteComplaint = (id) => {
  return axiosInstance.delete(`/city/waste/complaints/${id}`);
};

export const updateWasteComplaintStatus = (id, statusOrData, notes = "") => {
  const payload = typeof statusOrData === "object" ? statusOrData : { status: statusOrData, notes };
  return axiosInstance.patch(`/city/waste/complaints/${id}/status`, payload);
};

export const assignWasteComplaintWorker = (id, workerIdOrData, notes = "") => {
  const payload = typeof workerIdOrData === "object" 
    ? workerIdOrData 
    : { assigned_worker_id: parseInt(workerIdOrData), notes };
  return axiosInstance.patch(`/city/waste/complaints/${id}/assign-worker`, payload);
};

export const getWasteComplaintHistory = (id) => {
  return axiosInstance.get(`/city/waste/complaints/${id}/history`);
};

// Smart Waste Bins API Methods
export const getWasteBins = (params = {}) => {
  return axiosInstance.get("/city/waste/bins", { params });
};

export const getWasteBinById = (id) => {
  return axiosInstance.get(`/city/waste/bins/${id}`);
};

export const createWasteBin = (data) => {
  return axiosInstance.post("/city/waste/bins", data);
};

export const updateWasteBin = (id, data) => {
  return axiosInstance.put(`/city/waste/bins/${id}`, data);
};

export const deleteWasteBin = (id) => {
  return axiosInstance.delete(`/city/waste/bins/${id}`);
};

export const updateWasteBinFillLevel = (id, data) => {
  return axiosInstance.patch(`/city/waste/bins/${id}/fill-level`, data);
};

export const assignWasteBinRoute = (id, data) => {
  return axiosInstance.patch(`/city/waste/bins/${id}/assign-route`, data);
};

export const getWasteBinQr = (id) => {
  return axiosInstance.get(`/city/waste/bins/${id}/qr`);
};

// Waste Vehicles API Methods
export const getWasteVehicles = (params = {}) => {
  return axiosInstance.get("/city/waste/vehicles", { params });
};

export const getWasteVehicleById = (id) => {
  return axiosInstance.get(`/city/waste/vehicles/${id}`);
};

export const createWasteVehicle = (data) => {
  return axiosInstance.post("/city/waste/vehicles", data);
};

export const updateWasteVehicle = (id, data) => {
  return axiosInstance.put(`/city/waste/vehicles/${id}`, data);
};

export const deleteWasteVehicle = (id) => {
  return axiosInstance.delete(`/city/waste/vehicles/${id}`);
};

export const assignWasteVehicleDriverRoute = (id, data) => {
  return axiosInstance.patch(`/city/waste/vehicles/${id}/assign`, data);
};

export const updateWasteVehicleStatus = (id, data) => {
  return axiosInstance.patch(`/city/waste/vehicles/${id}/status`, data);
};

// Waste Workers API Methods
export const getWasteWorkers = (params = {}) => {
  return axiosInstance.get("/city/waste/workers", { params });
};

export const getWasteWorkerById = (id) => {
  return axiosInstance.get(`/city/waste/workers/${id}`);
};

export const createWasteWorker = (data) => {
  return axiosInstance.post("/city/waste/workers", data);
};

export const updateWasteWorker = (id, data) => {
  return axiosInstance.put(`/city/waste/workers/${id}`, data);
};

export const deleteWasteWorker = (id) => {
  return axiosInstance.delete(`/city/waste/workers/${id}`);
};

export const recordWasteWorkerAttendance = (id, data) => {
  return axiosInstance.post(`/city/waste/workers/${id}/attendance`, data);
};

export const getWasteWorkerAttendance = (id) => {
  return axiosInstance.get(`/city/waste/workers/${id}/attendance`);
};

// Collection Schedules & Routes API Methods
export const getWasteSchedules = (params = {}) => {
  return axiosInstance.get("/city/waste/schedules", { params });
};

export const getWasteScheduleById = (id) => {
  return axiosInstance.get(`/city/waste/schedules/${id}`);
};

export const createWasteSchedule = (data) => {
  return axiosInstance.post("/city/waste/schedules", data);
};

export const updateWasteSchedule = (id, data) => {
  return axiosInstance.put(`/city/waste/schedules/${id}`, data);
};

export const deleteWasteSchedule = (id) => {
  return axiosInstance.delete(`/city/waste/schedules/${id}`);
};

export const assignWasteScheduleWorkers = (id, data) => {
  return axiosInstance.patch(`/city/waste/schedules/${id}/assign`, data);
};

export const updateWasteScheduleStatus = (id, data) => {
  return axiosInstance.patch(`/city/waste/schedules/${id}/status`, data);
};

export const getTodayWasteSchedules = () => {
  return axiosInstance.get("/city/waste/schedules/today");
};

export const getWasteScheduleCalendar = (params = {}) => {
  return axiosInstance.get("/city/waste/schedules/calendar", { params });
};

// Asset Maintenance Work Orders API Methods
export const getWasteMaintenances = (params = {}) => {
  return axiosInstance.get("/city/waste/maintenance", { params });
};

export const getWasteMaintenanceById = (id) => {
  return axiosInstance.get(`/city/waste/maintenance/${id}`);
};

export const createWasteMaintenance = (data) => {
  return axiosInstance.post("/city/waste/maintenance", data);
};

export const updateWasteMaintenance = (id, data) => {
  return axiosInstance.put(`/city/waste/maintenance/${id}`, data);
};

export const deleteWasteMaintenance = (id) => {
  return axiosInstance.delete(`/city/waste/maintenance/${id}`);
};

export const updateWasteMaintenanceStatus = (id, data) => {
  return axiosInstance.patch(`/city/waste/maintenance/${id}/status`, data);
};

// Notifications Center API Methods
export const getWasteNotifications = (params = {}) => {
  return axiosInstance.get("/city/waste/notifications", { params });
};

export const markWasteNotificationRead = (id) => {
  return axiosInstance.patch(`/city/waste/notifications/${id}/read`);
};

export const markAllWasteNotificationsRead = () => {
  return axiosInstance.patch("/city/waste/notifications/read-all");
};

export const archiveWasteNotification = (id) => {
  return axiosInstance.patch(`/city/waste/notifications/${id}/archive`);
};

export const deleteWasteNotification = (id) => {
  return axiosInstance.delete(`/city/waste/notifications/${id}`);
};

// Reports & Analytics API Methods
export const getWasteAnalytics = (params = {}) => {
  return axiosInstance.get("/city/waste/reports/analytics", { params });
};

export const exportWasteReport = (params = {}) => {
  return axiosInstance.get("/city/waste/reports/export", {
    params,
    responseType: "blob"
  });
};
