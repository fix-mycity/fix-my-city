import axiosInstance from "../api/axiosInstance";

export const getMaintenanceTasks = (id) => {
  return axiosInstance.get(`/city/water/maintenance/${id}/tasks`);
};

export const createMaintenanceTask = (id, data) => {
  return axiosInstance.post(`/city/water/maintenance/${id}/tasks`, data);
};

export const updateMaintenanceTask = (taskId, data) => {
  return axiosInstance.patch(`/city/water/maintenance/tasks/${taskId}`, data);
};
