import axiosInstance from "./axiosInstance";

export const getAllSuggestionsApi = () => {
  return axiosInstance.get("/city/feed/suggestions/");
};

export const getMySuggestionsApi = () => {
  return axiosInstance.get("/city/feed/suggestions/me");
};

export const submitSuggestionApi = (data) => {
  return axiosInstance.post("/city/feed/suggestions/", data);
};
