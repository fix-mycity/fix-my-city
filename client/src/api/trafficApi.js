import axiosInstance from "./axiosInstance";

// Dashboard Summary
export const getTrafficDashboardSummaryApi = () => {
  return axiosInstance.get("/city/traffic/dashboard/summary");
};

// Incidents / Complaints
export const getTrafficDashboardComplaintsApi = () => {
  return axiosInstance.get("/city/traffic/dashboard/complaints");
};

export const listTrafficIncidentsApi = (params) => {
  return axiosInstance.get("/city/traffic/incidents", { params });
};

export const getIncidentByIdApi = (id) => {
  return axiosInstance.get(`/city/traffic/incidents/${id}`);
};

export const assignTrafficIncidentApi = (incidentId, data) => {
  return axiosInstance.post(`/city/traffic/incidents/${incidentId}/assign`, data);
};

export const resolveTrafficIncidentApi = (incidentId, data) => {
  return axiosInstance.post(`/city/traffic/incidents/${incidentId}/resolve`, data);
};

export const closeTrafficIncidentApi = (incidentId) => {
  return axiosInstance.post(`/city/traffic/incidents/${incidentId}/close`);
};

export const updateTrafficIncidentStatusApi = (incidentId, data) => {
  return axiosInstance.patch(`/city/traffic/incidents/${incidentId}/status`, data);
};

// Workers
export const listTrafficWorkersApi = (params) => {
  return axiosInstance.get("/city/traffic/workers", { params });
};

export const createTrafficWorkerApi = (data) => {
  return axiosInstance.post("/city/traffic/workers", data);
};

export const updateTrafficWorkerApi = (workerId, data) => {
  return axiosInstance.put(`/city/traffic/workers/${workerId}`, data);
};

export const deleteTrafficWorkerApi = (workerId) => {
  return axiosInstance.delete(`/city/traffic/workers/${workerId}`);
};

export const blockTrafficWorkerApi = (workerId) => {
  return axiosInstance.patch(`/city/traffic/workers/${workerId}/block`);
};
