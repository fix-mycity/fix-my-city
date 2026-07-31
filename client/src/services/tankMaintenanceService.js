import axiosInstance from "../api/axiosInstance";

export const getTankMaintenances = (tankId) => {
  return axiosInstance.get(`/city/water/tanks/${tankId}/maintenance`);
};

export const createTankMaintenance = (tankId, data) => {
  return axiosInstance.post(`/city/water/tanks/${tankId}/maintenance`, data);
};

export const updateTankMaintenance = (maintenanceId, data) => {
  return axiosInstance.put(`/city/water/tanks/maintenance/${maintenanceId}`, data);
};

export const deleteTankMaintenance = (maintenanceId) => {
  return axiosInstance.delete(`/city/water/tanks/maintenance/${maintenanceId}`);
};
