import axiosInstance from "../api/axiosInstance";

export const getEmergencies = (params = {}) => {
  return axiosInstance.get("/city/water/emergency", { params });
};

export const getEmergencyDashboard = () => {
  return axiosInstance.get("/city/water/emergency/dashboard");
};

export const getEmergency = (id) => {
  return axiosInstance.get(`/city/water/emergency/${id}`);
};

export const createEmergency = (data) => {
  return axiosInstance.post("/city/water/emergency", data);
};

export const updateEmergency = (id, data) => {
  return axiosInstance.put(`/city/water/emergency/${id}`, data);
};

export const deleteEmergency = (id) => {
  return axiosInstance.delete(`/city/water/emergency/${id}`);
};

export const updateEmergencyStatus = (id, status) => {
  return axiosInstance.patch(`/city/water/emergency/${id}/status`, null, {
    params: { status }
  });
};

export const getEmergencyTimeline = (id) => {
  return axiosInstance.get(`/city/water/emergency/${id}/timeline`);
};
