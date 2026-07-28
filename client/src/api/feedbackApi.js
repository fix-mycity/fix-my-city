import axiosInstance from "./axiosInstance";

export const createFeedbackApi = (data) => {
  return axiosInstance.post("/city/complaints/feedback/", data);
};

export const getMyFeedbackApi = () => {
  return axiosInstance.get("/city/complaints/feedback/me");
};

export const getFeedbackForComplaintApi = (complaintId) => {
  return axiosInstance.get(`/city/complaints/feedback/complaint/${complaintId}`);
};

export const getAllFeedbackApi = () => {
  return axiosInstance.get("/city/complaints/feedback/");
};
