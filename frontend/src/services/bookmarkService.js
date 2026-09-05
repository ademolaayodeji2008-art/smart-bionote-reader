import api from "./api.js";

export const getBookmarks = async () => {
  const response = await api.get("/bookmarks");
  return response.data;
};

export const addBookmark = async (lessonId) => {
  const response = await api.post(`/bookmarks/${lessonId}`);
  return response.data;
};

export const removeBookmark = async (lessonId) => {
  const response = await api.delete(`/bookmarks/${lessonId}`);
  return response.data;
};
