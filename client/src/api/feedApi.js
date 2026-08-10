import axiosInstance from "./axiosInstance";

// Retrieve all visible feed posts
export const getFeedPostsApi = (categoryOrParams, feedType) => {
  let params = {};
  if (categoryOrParams && typeof categoryOrParams === "object") {
    params = categoryOrParams;
  } else {
    const category = categoryOrParams;
    if (category && category !== "All") params.category = category;
    if (feedType && feedType !== "All") {
      params.feed_type = feedType.toLowerCase();
    }
  }
  return axiosInstance.get("/city/feed/posts", { params });
};

export const getMyPostsApi = () => {
  return axiosInstance.get("/city/feed/my-posts");
};

export const getPendingPostsApi = () => {
  return axiosInstance.get("/city/feed/pending");
};

// Create a new post (announcement)
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

// Delete a feed post
export const deletePostApi = (postId) => {
  return axiosInstance.delete(`/city/feed/posts/${postId}`);
};

export const reactToPostApi = (postId, reactionType = "LIKE") => {
  return axiosInstance.post(`/city/feed/posts/${postId}/react`, { reaction_type: reactionType });
};

export const getPostCommentsApi = (postId) => {
  return axiosInstance.get(`/city/feed/posts/${postId}/comments`);
};

export const createPostCommentApi = (postId, content) => {
  return axiosInstance.post(`/city/feed/posts/${postId}/comments`, { content });
};

export const deletePostCommentApi = (commentId) => {
  return axiosInstance.delete(`/city/feed/posts/comments/${commentId}`);
};
