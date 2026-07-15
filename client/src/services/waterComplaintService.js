import axiosInstance from "../api/axiosInstance";

export const getComplaints = (params = {}) => {
  return axiosInstance.get("/city/water/complaints", { params });
};

export const getComplaintById = (id) => {
  return axiosInstance.get(`/city/water/complaints/${id}`);
};

export const createComplaint = (data) => {
  return axiosInstance.post("/city/water/complaints", data);
};

export const updateComplaint = (id, data) => {
  return axiosInstance.put(`/city/water/complaints/${id}`, data);
};

export const updateComplaintStatus = (id, status, notes = "") => {
  return axiosInstance.patch(`/city/water/complaints/${id}/status`, { status, notes });
};

export const assignWorker = (id, workerId, notes = "") => {
  return axiosInstance.patch(`/city/water/complaints/${id}/assign-worker`, {
    assigned_worker_id: parseInt(workerId),
    notes
  });
};

export const deleteComplaint = (id) => {
  return axiosInstance.delete(`/city/water/complaints/${id}`);
};

export const getDashboardSummary = () => {
  return axiosInstance.get("/city/water/complaints/dashboard-summary");
};
