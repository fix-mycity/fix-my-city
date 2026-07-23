import axiosInstance from "../api/axiosInstance";

export const getSettings = () => {
  return axiosInstance.get("/city/water/settings");
};

export const updateSettings = (data) => {
  return axiosInstance.put("/city/water/settings", data);
};
