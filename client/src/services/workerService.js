import axiosInstance from "../api/axiosInstance";

export const getWorkers = (params = {}) => {
  return axiosInstance.get("/city/water/workers", { params });
};

export const getWorkerById = (id) => {
  return axiosInstance.get(`/city/water/workers/${id}`);
};

export const createWorker = (data) => {
  return axiosInstance.post("/city/water/workers", data);
};

export const updateWorker = (id, data) => {
  return axiosInstance.put(`/city/water/workers/${id}`, data);
};

export const updateWorkerAvailability = (id, availability) => {
  return axiosInstance.patch(`/city/water/workers/${id}/availability`, { availability });
};

export const updateWorkerStatus = (id, employmentStatus) => {
  return axiosInstance.patch(`/city/water/workers/${id}/status`, {
    employment_status: employmentStatus
  });
};

export const deleteWorker = (id) => {
  return axiosInstance.delete(`/city/water/workers/${id}`);
};

export const searchWorkers = (query, params = {}) => {
  return axiosInstance.get("/city/water/workers/search", {
    params: { q: query, ...params }
  });
};

export const filterWorkers = (filters = {}, params = {}) => {
  return axiosInstance.get("/city/water/workers/filter", {
    params: { ...filters, ...params }
  });
};
