import axiosInstance from "../api/axiosInstance";

export const getQualityAlerts = (params = {}) => {
  return axiosInstance.get("/city/water/quality/alerts", { params });
};

export const resolveQualityAlert = (alertId) => {
  return axiosInstance.patch(`/city/water/quality/alerts/resolve/${alertId}`);
};
