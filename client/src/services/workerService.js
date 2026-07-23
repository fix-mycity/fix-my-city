import axiosInstance from "../api/axiosInstance";

// All requests are routed to the central /city/workers API
// The 'department' param is required if the admin has multi-department access

export const getWorkers = (params = {}) => {
  return axiosInstance.get("/city/workers", { params });
};

export const getWorkerById = (id, department = null) => {
  const params = department ? { department } : {};
  return axiosInstance.get(`/city/workers/${id}`, { params });
};

export const createWorker = (data, department = null) => {
  const params = department ? { department } : {};
  return axiosInstance.post("/city/workers", data, { params });
};

export const updateWorker = (id, data, department = null) => {
  const params = department ? { department } : {};
  return axiosInstance.put(`/city/workers/${id}`, data, { params });
};

export const blockWorker = (id, department = null) => {
  const params = department ? { department } : {};
  return axiosInstance.patch(`/city/workers/${id}/block`, {}, { params });
};

export const deleteWorker = (id, department = null) => {
  const params = department ? { department } : {};
  return axiosInstance.delete(`/city/workers/${id}`, { params });
};

// --- Worker self-service endpoints ---

export const getMyProfile = () => {
  return axiosInstance.get("/city/workers/me");
};

export const updateMyProfile = (data) => {
  return axiosInstance.put("/city/workers/me", data);
};

export const uploadWorkerPhoto = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/city/workers/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getMyTasks = () => {
  return axiosInstance.get("/city/workers/me/tasks");
};

export const resolveTask = (taskId, resolution_report, after_image = null) => {
  return axiosInstance.post(`/city/workers/me/tasks/${taskId}/resolve`, { resolution_report, after_image });
};

export const downloadTaskPdfReport = (taskId) => {
  return axiosInstance.get(`/city/workers/tasks/${taskId}/pdf-report`);
};

// --- Leave Requests endpoints ---

export const submitLeaveRequest = (data) => {
  return axiosInstance.post("/city/workers/leave-requests", data);
};

export const getMyLeaveRequests = (params = {}) => {
  return axiosInstance.get("/city/workers/leave-requests/me", { params });
};

export const getDepartmentLeaveRequests = (params = {}) => {
  return axiosInstance.get("/city/workers/leave-requests", { params });
};

export const updateLeaveRequestStatus = (requestId, status, admin_notes = "") => {
  return axiosInstance.patch(`/city/workers/leave-requests/${requestId}/status`, { status, admin_notes });
};
