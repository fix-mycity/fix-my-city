import axiosInstance from "../api/axiosInstance";

export const getPipelines = (params = {}) => {
  return axiosInstance.get("/city/water/pipelines", { params });
};

export const getPipelineById = (id) => {
  return axiosInstance.get(`/city/water/pipelines/${id}`);
};

export const createPipeline = (data) => {
  return axiosInstance.post("/city/water/pipelines", data);
};

export const updatePipeline = (id, data) => {
  return axiosInstance.put(`/city/water/pipelines/${id}`, data);
};

export const deletePipeline = (id) => {
  return axiosInstance.delete(`/city/water/pipelines/${id}`);
};
