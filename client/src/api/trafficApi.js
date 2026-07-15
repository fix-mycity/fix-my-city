import axiosInstance from "./axiosInstance";

export const getTrafficDashboardComplaintsApi = () => {
  return axiosInstance.get("/city/traffic/dashboard/complaints");
};

export const createTrafficWorkerApi = (data) => {
  return axiosInstance.post("/city/traffic/workers", data);
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
