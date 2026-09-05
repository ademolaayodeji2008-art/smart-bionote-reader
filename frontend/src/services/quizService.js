import api from "./api.js";

export const getQuestions = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/questions`);
  return response.data;
};

export const getQuestionsWithAnswers = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/questions/with-answers`);
  return response.data;
};

export const createQuestion = async (lessonId, data) => {
  const response = await api.post(`/lessons/${lessonId}/questions`, data);
  return response.data;
};

export const updateQuestion = async (lessonId, questionId, data) => {
  const response = await api.put(`/lessons/${lessonId}/questions/${questionId}`, data);
  return response.data;
};

export const deleteQuestion = async (lessonId, questionId) => {
  const response = await api.delete(`/lessons/${lessonId}/questions/${questionId}`);
  return response.data;
};

export const reorderQuestions = async (lessonId, ordering) => {
  const response = await api.put(`/lessons/${lessonId}/questions/reorder`, { ordering });
  return response.data;
};

export const submitQuiz = async (lessonId, answers) => {
  const response = await api.post(`/lessons/${lessonId}/quiz/submit`, { answers });
  return response.data;
};

export const getMyQuizResults = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/quiz/my-results`);
  return response.data;
};

export const getQuizAnalytics = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/quiz/analytics`);
  return response.data;
};
