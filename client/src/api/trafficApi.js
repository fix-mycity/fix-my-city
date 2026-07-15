import axiosInstance from "./axiosInstance";

export const getTrafficDashboardComplaintsApi = () => {
  return axiosInstance.get("/city/traffic/dashboard/complaints");
};

export const createTrafficWorkerApi = (data) => {
  return axiosInstance.post("/city/traffic/workers", data);
};
