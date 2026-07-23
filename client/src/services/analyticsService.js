import axiosInstance from "../api/axiosInstance";

export const getDashboardAnalytics = (params = {}) => {
  return axiosInstance.get("/city/water/reports/dashboard", { params });
};

export const getExportUrl = (reportType, format, params = {}) => {
  const token = localStorage.getItem("token") || ""; // Add token authorization prefix if needed
  const query = new URLSearchParams({
    report_type: reportType,
    ...params,
    token: token // query parameter fallback for token validation in downloads
  }).toString();
  
  // Use relative path or base URL prefix
  const base = "/api/v1"; // standard backend prefix for main API gateway
  return `${base}/city/water/reports/export/${format}?${query}`;
};
