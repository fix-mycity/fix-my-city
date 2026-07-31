import axiosInstance from '../api/axiosInstance';

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
