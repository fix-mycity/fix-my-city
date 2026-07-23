import axiosInstance from "../api/axiosInstance";

export const getWorkerTasks = (params = {}) => {
  const queryParams = { ...params };
  if (queryParams.status) {
    queryParams.status_val = queryParams.status;
    delete queryParams.status;
  }
  return axiosInstance.get("/city/water/worker/tasks", { params: queryParams });
};

export const getWorkerTaskById = (id) => {
  return axiosInstance.get(`/city/water/worker/tasks/${id}`);
};

export const acceptWorkerTask = (id, remarks = "") => {
  return axiosInstance.patch(`/city/water/worker/tasks/${id}/accept`, null, { params: remarks ? { remarks } : {} });
};

export const rejectWorkerTask = (id, remarks) => {
  return axiosInstance.patch(`/city/water/worker/tasks/${id}/reject`, null, { params: { remarks } });
};

export const startWorkerTask = (id, remarks = "") => {
  return axiosInstance.patch(`/city/water/worker/tasks/${id}/start`, null, { params: remarks ? { remarks } : {} });
};

export const updateWorkerTaskProgress = (id, data) => {
  return axiosInstance.patch(`/city/water/worker/tasks/${id}/progress`, data);
};

export const completeWorkerTask = (id, data) => {
  return axiosInstance.patch(`/city/water/worker/tasks/${id}/complete`, data);
};
