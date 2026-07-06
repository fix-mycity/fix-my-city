import axiosInstance from "./axiosInstance";

export const getStatesApi = () => {
  return axiosInstance.get("/locations/states");
};

export const getDistrictsApi = (stateId) => {
  return axiosInstance.get(`/locations/states/${stateId}/districts`);
};

export const lookupPincodeApi = (pincode) => {
  return axiosInstance.get(`/locations/pincode/${pincode}`);
};
