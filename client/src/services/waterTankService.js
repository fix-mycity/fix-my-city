import axiosInstance from "../api/axiosInstance";

export const getTanks = (params = {}) => {
  return axiosInstance.get("/city/water/tanks", { params });
};

export const getTankDashboard = () => {
  return axiosInstance.get("/city/water/tanks/dashboard");
};

export const getTankById = (id) => {
  return axiosInstance.get(`/city/water/tanks/${id}`);
};

export const createTank = (data) => {
  return axiosInstance.post("/city/water/tanks", data);
};

export const updateTank = (id, data) => {
  return axiosInstance.put(`/city/water/tanks/${id}`, data);
};

export const deleteTank = (id) => {
  return axiosInstance.delete(`/city/water/tanks/${id}`);
};

export const updateWaterLevel = (id, water_level) => {
  return axiosInstance.patch(`/city/water/tanks/${id}/water-level`, { water_level });
};
