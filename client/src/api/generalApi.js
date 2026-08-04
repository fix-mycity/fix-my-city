import axiosInstance from "./axiosInstance";

// Complaints Endpoints
export const listGeneralComplaintsApi = (params) => {
  return axiosInstance.get("/city/general/complaints", { params });
};

export const getGeneralComplaintByIdApi = (id) => {
  return axiosInstance.get(`/city/general/complaints/${id}`);
};

export const updateGeneralComplaintApi = (id, data) => {
  return axiosInstance.put(`/city/general/complaints/${id}`, data);
};

export const updateGeneralComplaintStatusApi = (id, data) => {
  return axiosInstance.patch(`/city/general/complaints/${id}/status`, data);
};

export const assignGeneralWorkerApi = (id, data) => {
  return axiosInstance.patch(`/city/general/complaints/${id}/assign-worker`, data);
};

// Workers Endpoints
export const listGeneralWorkersApi = (params) => {
  return axiosInstance.get("/city/general/workers", { params });
};

export const createGeneralWorkerApi = (data) => {
  return axiosInstance.post("/city/general/workers", data);
};

export const updateGeneralWorkerApi = (id, data) => {
  return axiosInstance.put(`/city/general/workers/${id}`, data);
};

export const deleteGeneralWorkerApi = (id) => {
  return axiosInstance.delete(`/city/general/workers/${id}`);
};

export const updateGeneralWorkerStatusApi = (id, data) => {
  return axiosInstance.patch(`/city/general/workers/${id}/status`, data);
};

export const updateGeneralWorkerAvailabilityApi = (id, data) => {
  return axiosInstance.patch(`/city/general/workers/${id}/availability`, data);
};
