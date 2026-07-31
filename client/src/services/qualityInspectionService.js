import axiosInstance from "../api/axiosInstance";

export const getQualityInspections = (params = {}) => {
  return axiosInstance.get("/city/water/quality/inspection", { params });
};

export const createQualityInspection = (data) => {
  return axiosInstance.post("/city/water/quality/inspection", data);
};

export const updateQualityInspection = (id, data) => {
  return axiosInstance.put(`/city/water/quality/inspection/${id}`, data);
};

export const deleteQualityInspection = (id) => {
  return axiosInstance.delete(`/city/water/quality/inspection/${id}`);
};
