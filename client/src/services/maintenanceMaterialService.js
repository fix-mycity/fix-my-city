import axiosInstance from "../api/axiosInstance";

export const getMaintenanceMaterials = (id) => {
  return axiosInstance.get(`/city/water/maintenance/${id}/materials`);
};

export const addMaintenanceMaterial = (id, data) => {
  return axiosInstance.post(`/city/water/maintenance/${id}/materials`, data);
};
