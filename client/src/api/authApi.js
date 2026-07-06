import axiosInstance from "./axiosInstance";

export const registerApi = (data) => {
  return axiosInstance.post("/auth/register", data);
};

export const verifyOtpApi = (data) => {
  return axiosInstance.post("/otp/verify", data);
};

export const sendOtpApi = (data) => {
  return axiosInstance.post("/otp/send", data);
};

export const loginApi = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const getMeApi = () => {
  return axiosInstance.get("/auth/me");
};

export const refreshApi = () => {
  return axiosInstance.post("/auth/refresh");
};

export const forgotPasswordApi = (data) => {
  return axiosInstance.post("/password/forgot",data);
};

export const resetPasswordApi = (data) => {
  return axiosInstance.post("/password/reset",data);
};


export const logoutApi = () => {
  return axiosInstance.post("/auth/logout");
};