import axiosInstance from "./axiosInstance";

// Retrieve all citizen suggestions (restricted to administrators/authorities)
export const getAllSuggestionsApi = () => {
  return axiosInstance.get("/city/feed/suggestions/");
};
