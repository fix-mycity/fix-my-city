import axiosInstance from "../api/axiosInstance";

export const createAssignment = (data) => {
  return axiosInstance.post("/city/water/assignments", data);
};

export const getAssignments = (params = {}) => {
  const queryParams = { ...params };
  if (queryParams.status) {
    queryParams.status_val = queryParams.status;
    delete queryParams.status;
  }
  return axiosInstance.get("/city/water/assignments", { params: queryParams });
};

export const getAssignmentById = (id) => {
  return axiosInstance.get(`/city/water/assignments/${id}`);
};

export const updateAssignment = (id, data) => {
  return axiosInstance.put(`/city/water/assignments/${id}`, data);
};

export const updateAssignmentStatus = (id, status, remarks = "") => {
  return axiosInstance.patch(`/city/water/assignments/${id}/status`, { status, remarks });
};

export const verifyAssignment = (id, status, remarks = "") => {
  return axiosInstance.patch(`/city/water/assignments/${id}/verify`, { verification_status: status, remarks });
};

export const deleteAssignment = (id) => {
  return axiosInstance.delete(`/city/water/assignments/${id}`);
};
