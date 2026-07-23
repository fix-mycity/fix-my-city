import axiosInstance from "../api/axiosInstance";

export const getComplaintsReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/complaints", { params });
};

export const getWorkersReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/workers", { params });
};

export const getSupplyReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/supply", { params });
};

export const getPipelinesReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/pipelines", { params });
};

export const getTanksReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/tanks", { params });
};

export const getQualityReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/quality", { params });
};

export const getMaintenanceReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/maintenance", { params });
};

export const getEmergencyReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/emergency", { params });
};

export const getNotificationsReport = (params = {}) => {
  return axiosInstance.get("/city/water/reports/notifications", { params });
};
