import axiosInstance from "../api/axiosInstance";

export const createEmergencyNotification = (id, data) => {
  return axiosInstance.post(`/city/water/emergency/${id}/notify`, data);
};
