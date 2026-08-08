import axiosInstance from "../api/axiosInstance";

// Water Emergency endpoints (HEAD)
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

// General/Traffic Emergency endpoints (Phase-2-Traffic-Module)
export const getActiveEmergencies = async () => {
  return await axiosInstance.get('/city/emergency/active');
};

export const triggerSOS = async (sosData) => {
  return await axiosInstance.post('/city/emergency/sos', sosData);
};

export const getNearbyWorkers = async (lat, lng) => {
  return await axiosInstance.get(`/city/emergency/nearby-workers?lat=${lat}&lng=${lng}`);
};

export const dispatchTaskforce = async (emergencyId, dispatchData) => {
  return await axiosInstance.post(`/city/emergency/${emergencyId}/dispatch`, dispatchData);
};

export const issueBroadcast = async (broadcastData) => {
  return await axiosInstance.post('/city/emergency/broadcast', broadcastData);
};

export const getActiveBroadcasts = async () => {
  return await axiosInstance.get('/city/emergency/broadcasts');
};

export const resolveEmergency = async (emergencyId) => {
  return await axiosInstance.put(`/city/emergency/${emergencyId}/resolve`);
};
