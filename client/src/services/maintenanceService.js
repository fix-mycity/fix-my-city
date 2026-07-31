import axiosInstance from "../api/axiosInstance";

export const getMaintenances = (params = {}) => {
  return axiosInstance.get("/city/water/maintenance", { params });
};

export const getMaintenanceDashboard = () => {
  return axiosInstance.get("/city/water/maintenance/dashboard");
};

export const getMaintenance = (id) => {
  return axiosInstance.get(`/city/water/maintenance/${id}`);
};

export const createMaintenance = (data) => {
  return axiosInstance.post("/city/water/maintenance", data);
};

export const updateMaintenance = (id, data) => {
  return axiosInstance.put(`/city/water/maintenance/${id}`, data);
};

export const deleteMaintenance = (id) => {
  return axiosInstance.delete(`/city/water/maintenance/${id}`);
};

export const uploadMaintenancePhoto = (id, data) => {
  return axiosInstance.post(`/city/water/maintenance/${id}/photos`, data);
};

export const getMaintenancePhotos = (id) => {
  return axiosInstance.get(`/city/water/maintenance/${id}/photos`);
};

export const getMaintenanceHistory = (id) => {
  return axiosInstance.get(`/city/water/maintenance/${id}/history`);
};

export const getMaintenancesForPipeline = (pipelineId) => {
  return getMaintenances({ source_type: 'PIPELINE', source_reference_id: pipelineId });
};

export const uploadPhoto = uploadMaintenancePhoto;

