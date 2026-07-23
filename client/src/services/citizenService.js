import axiosInstance from "../api/axiosInstance";

export const getCitizens = (params = {}) => {
  return axiosInstance.get("/city/water/citizens", { params });
};

export const getCitizenById = (id) => {
  return axiosInstance.get(`/city/water/citizens/${id}`);
};

export const getCitizenComplaints = (id) => {
  return axiosInstance.get(`/city/water/citizens/${id}/complaints`);
};

export const getCitizenNotifications = (id) => {
  return axiosInstance.get(`/city/water/citizens/${id}/notifications`);
};

export const updateCitizenServiceStatus = (id, data) => {
  return axiosInstance.patch(`/city/water/citizens/${id}/service-status`, data);
};

export const getCitizenExportUrl = () => {
  const token = localStorage.getItem("token") || "";
  return `/api/city/water/citizens/export?token=${token}`;
};
