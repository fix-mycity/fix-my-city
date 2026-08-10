import axiosInstance from "./axiosInstance";

export const createSuggestionApi = (data) => {
  return axiosInstance.post("/city/feed/suggestions/", data);
};

export const getMySuggestionsApi = () => {
  return axiosInstance.get("/city/feed/suggestions/me");
};

// Retrieve all citizen suggestions (restricted to administrators/authorities)
export const getAllSuggestionsApi = () => {
  return axiosInstance.get("/city/feed/suggestions/");
};
