import axiosInstance from "./axiosInstance";

export const getFeedPostsApi = (category, feedType) => {
  const params = {};
  if (category && category !== "All") params.category = category;
  if (feedType && feedType !== "All") {
    params.feed_type = feedType.toLowerCase();
  }
  return axiosInstance.get("/city/feed/posts", { params });
};

export const getMyPostsApi = () => {
  return axiosInstance.get("/city/feed/my-posts");
};

export const getPendingPostsApi = () => {
  return axiosInstance.get("/city/feed/pending");
};

export const createPostApi = (formData) => {
  return axiosInstance.post("/city/feed/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const approvePostApi = (postId) => {
  return axiosInstance.patch(`/city/feed/posts/${postId}/approve`);
};

export const rejectPostApi = (postId, reason) => {
  return axiosInstance.patch(`/city/feed/posts/${postId}/reject`, { reason });
};

export const deletePostApi = (postId) => {
  return axiosInstance.delete(`/city/feed/posts/${postId}`);
};
