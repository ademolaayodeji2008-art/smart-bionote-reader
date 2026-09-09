import api from "./api.js";

/**
 * Creates a new lesson (starts as a draft).
 * @param {Object} data - { title, description, type, subjectId, classId, content, drawingSteps }
 */
export const createLesson = async (data) => {
  const response = await api.post("/lessons", data);
  return response.data;
};

/**
 * Returns the authenticated teacher's lessons with optional filters and pagination.
 * @param {Object} params - { page, limit, status, type, subject, search }
 */
export const getMyLessons = async (params = {}) => {
  const response = await api.get("/lessons/my-lessons", { params });
  return response.data;
};

/**
 * Retrieves a single lesson by ID.
 */
export const getLesson = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};

/**
 * Updates an existing lesson.
 * @param {string} id
 * @param {Object} data - editable fields only
 */
export const updateLesson = async (id, data) => {
  const response = await api.put(`/lessons/${id}`, data);
  return response.data;
};

/**
 * Publishes a draft lesson, making it visible to students.
 */
export const publishLesson = async (id) => {
  const response = await api.post(`/lessons/${id}/publish`);
  return response.data;
};

/**
 * Archives a lesson (soft delete — removes from student discovery).
 */
export const archiveLesson = async (id) => {
  const response = await api.post(`/lessons/${id}/archive`);
  return response.data;
};

/**
 * Permanently deletes a draft lesson.
 */
export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data;
};

/**
 * Uploads a cover image for a lesson.
 * @param {string} id - lesson ID
 * @param {File} file - image file
 * @param {Function} onUploadProgress - optional progress callback
 */
export const uploadCoverImage = async (id, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("coverImage", file);
  const response = await api.post(`/lessons/${id}/cover-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
};

/**
 * Uploads an image for a drawing lesson step.
 * @param {string} lessonId
 * @param {string} stepId - MongoDB subdocument _id
 * @param {File} file
 */
export const uploadStepImage = async (lessonId, stepId, file) => {
  const formData = new FormData();
  formData.append("stepImage", file);
  const response = await api.post(`/lessons/${lessonId}/steps/${stepId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Uploads teacher-recorded audio for a drawing lesson step.
 * ONLY valid for drawing lessons — normal notes use browser SpeechSynthesis.
 * @param {string} lessonId
 * @param {string} stepId
 * @param {File} file
 */
export const uploadStepAudio = async (lessonId, stepId, file) => {
  const formData = new FormData();
  formData.append("stepAudio", file);
  const response = await api.post(`/lessons/${lessonId}/steps/${stepId}/audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Browse published lessons (student discovery).
 * @param {Object} params - { page, limit, search, subject, type, classId }
 */
export const getPublishedLessons = async (params = {}) => {
  const response = await api.get("/lessons", { params });
  return response.data;
};

/**
 * Uploads a Word (.docx) or PDF document for a note lesson.
 * The backend uses mammoth to extract HTML + plain text from .docx.
 * @param {string} lessonId
 * @param {File} file — .docx or .pdf
 * @param {Function} onUploadProgress — optional progress callback
 */
export const uploadLessonDocument = async (lessonId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("document", file);
  const response = await api.post(`/lessons/${lessonId}/document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
};
