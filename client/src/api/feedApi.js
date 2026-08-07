import axiosInstance from "./axiosInstance";

// Retrieve all visible feed posts
export const getFeedPostsApi = (params) => {
  return axiosInstance.get("/city/feed/posts", { params });
};

// Create a new post (announcement)
export const createPostApi = (formData) => {
  return axiosInstance.post("/city/feed/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a feed post
export const deletePostApi = (postId) => {
  return axiosInstance.delete(`/city/feed/posts/${postId}`);
};
