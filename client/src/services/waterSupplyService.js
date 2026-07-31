import axiosInstance from "../api/axiosInstance";

export const getSupplySchedules = (params = {}) => {
  return axiosInstance.get("/city/water/supply", { params });
};

export const getSupplyScheduleById = (id) => {
  return axiosInstance.get(`/city/water/supply/${id}`);
};

export const createSupplySchedule = (data) => {
  return axiosInstance.post("/city/water/supply", data);
};

export const updateSupplySchedule = (id, data) => {
  return axiosInstance.put(`/city/water/supply/${id}`, data);
};

export const pauseSupplySchedule = (id, remarks = "") => {
  return axiosInstance.patch(`/city/water/supply/${id}/pause`, { status: "PAUSED", remarks });
};

export const resumeSupplySchedule = (id, remarks = "") => {
  return axiosInstance.patch(`/city/water/supply/${id}/resume`, { status: "ACTIVE", remarks });
};

export const deleteSupplySchedule = (id) => {
  return axiosInstance.delete(`/city/water/supply/${id}`);
};

export const getTodaySupplySchedules = () => {
  return axiosInstance.get("/city/water/supply/today");
};

export const getUpcomingSupplySchedules = () => {
  return axiosInstance.get("/city/water/supply/upcoming");
};

export const searchSupplySchedules = (query, params = {}) => {
  return axiosInstance.get("/city/water/supply/search", { params: { q: query, ...params } });
};

export const filterSupplySchedules = (filters = {}, params = {}) => {
  return axiosInstance.get("/city/water/supply/filter", { params: { ...filters, ...params } });
};
