import axiosInstance from "../api/axiosInstance";

export const getDepartmentProfile = () => {
  return axiosInstance.get("/city/water/settings/profile");
};

export const updateDepartmentProfile = (data) => {
  return axiosInstance.put("/city/water/settings/profile", data);
};
