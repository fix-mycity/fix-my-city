import axiosInstance from "./axiosInstance";

export const getUserProfileApi = () => {
  return axiosInstance.get("/city/users/me/profile");
};

export const updateUserProfileApi = (data) => {
  return axiosInstance.patch("/city/users/me/profile", data);
};

export const uploadAvatarApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/city/users/me/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getSavedLocationsApi = () => {
  return axiosInstance.get("/city/users/me/locations");
};

export const addSavedLocationApi = (data) => {
  return axiosInstance.post("/city/users/me/locations", data);
};

export const deleteSavedLocationApi = (locationId) => {
  return axiosInstance.delete(`/city/users/me/locations/${locationId}`);
};

export const initDigiLockerApi = (redirectUrl) => {
  return axiosInstance.post("/city/users/me/aadhaar/digilocker/init", { redirect_url: redirectUrl });
};

export const checkDigiLockerStatusApi = (verificationId) => {
  return axiosInstance.post("/city/users/me/aadhaar/digilocker/status", { verification_id: verificationId });
};


