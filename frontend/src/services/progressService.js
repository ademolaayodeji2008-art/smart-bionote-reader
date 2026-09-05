import api from "./api.js";

export const getAllProgress = async () => {
  const response = await api.get("/progress");
  return response.data;
};

export const getProgressForLesson = async (lessonId) => {
  const response = await api.get(`/progress/${lessonId}`);
  return response.data;
};

/**
 * Throttled — call this from a debounced handler, not on every word.
 */
export const updateProgress = async (lessonId, { progressPercentage, lastPosition }) => {
  const response = await api.put(`/progress/${lessonId}`, { progressPercentage, lastPosition });
  return response.data;
};
