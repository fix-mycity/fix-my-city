import axiosInstance from "../api/axiosInstance";

export const getInspectionsForPipeline = (pipelineId) => {
  return axiosInstance.get(`/city/water/pipelines/${pipelineId}/inspection`);
};

export const createInspection = (pipelineId, data) => {
  return axiosInstance.post(`/city/water/pipelines/${pipelineId}/inspection`, data);
};

export const updateInspection = (inspectionId, data) => {
  return axiosInstance.put(`/city/water/pipelines/inspection/${inspectionId}`, data);
};

export const deleteInspection = (inspectionId) => {
  return axiosInstance.delete(`/city/water/pipelines/inspection/${inspectionId}`);
};
