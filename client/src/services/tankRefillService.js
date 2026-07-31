import axiosInstance from "../api/axiosInstance";

export const getRefillHistory = (tankId) => {
  return axiosInstance.get(`/city/water/tanks/${tankId}/refill-history`);
};

export const recordTankRefill = (tankId, data) => {
  return axiosInstance.post(`/city/water/tanks/${tankId}/refill`, data);
};
