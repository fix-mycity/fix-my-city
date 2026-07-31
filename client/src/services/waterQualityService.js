import axiosInstance from "../api/axiosInstance";

export const getQualityReports = (params = {}) => {
  return axiosInstance.get("/city/water/quality", { params });
};

export const getQualityDashboard = () => {
  return axiosInstance.get("/city/water/quality/dashboard");
};

export const getQualityReportById = (id) => {
  return axiosInstance.get(`/city/water/quality/${id}`);
};

export const createQualityReport = (data) => {
  return axiosInstance.post("/city/water/quality", data);
};

export const updateQualityReport = (id, data) => {
  return axiosInstance.put(`/city/water/quality/${id}`, data);
};

export const deleteQualityReport = (id) => {
  return axiosInstance.delete(`/city/water/quality/${id}`);
};
