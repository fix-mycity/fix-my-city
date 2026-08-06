import axiosInstance from "./axiosInstance";

export const getFeedPostsApi = (category) => {
  return axiosInstance.get("/city/feed/posts", {
    params: { category }
  });
};

export const createPostApi = (data) => {
  return axiosInstance.post("/city/feed/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deletePostApi = (postId) => {
  return axiosInstance.delete(`/city/feed/posts/${postId}`);
};
