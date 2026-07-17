import axiosInstance from "./axiosInstance";

export const getMyComplaintsApi = () => {
  return axiosInstance.get("/city/complaints/me");
};

export const getAllComplaintsApi = () => {
  return axiosInstance.get("/city/complaints/");
};

export const getComplaintByIdApi = (complaintId) => {
  return axiosInstance.get(`/city/complaints/${complaintId}`);
};

export const createComplaintApi = (data) => {
  return axiosInstance.post("/city/complaints/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadComplaintImageApi = (complaintId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`/city/complaints/${complaintId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
