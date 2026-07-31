import axiosInstance from "../api/axiosInstance";

export const getEmergencyTeam = (id) => {
  return axiosInstance.get(`/city/water/emergency/${id}/team`);
};

export const assignEmergencyTeam = (id, data) => {
  return axiosInstance.post(`/city/water/emergency/${id}/team`, data);
};
