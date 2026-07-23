import axiosInstance from "../api/axiosInstance";

export const getNotifications = (params = {}) => {
  return axiosInstance.get("/city/water/notifications", { params });
};

export const getNotificationById = (id) => {
  return axiosInstance.get(`/city/water/notifications/${id}`);
};

export const createNotification = (data) => {
  return axiosInstance.post("/city/water/notifications", data);
};

export const updateNotification = (id, data) => {
  return axiosInstance.put(`/city/water/notifications/${id}`, data);
};

export const deleteNotification = (id) => {
  return axiosInstance.delete(`/city/water/notifications/${id}`);
};

export const getNotificationDashboard = () => {
  return axiosInstance.get("/city/water/notifications/dashboard");
};

export const getNotificationTemplates = () => {
  return axiosInstance.get("/city/water/notifications/templates");
};

export const createNotificationTemplate = (data) => {
  return axiosInstance.post("/city/water/notifications/templates", data);
};

export const updateNotificationTemplate = (id, data) => {
  return axiosInstance.put(`/city/water/notifications/templates/${id}`, data);
};

export const deleteNotificationTemplate = (id) => {
  return axiosInstance.delete(`/city/water/notifications/templates/${id}`);
};

export const getNotificationHistory = (id) => {
  return axiosInstance.get(`/city/water/notifications/${id}/history`);
};
