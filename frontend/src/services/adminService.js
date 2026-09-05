import api from "./api.js";

export const getPlatformStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Users
export const getUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const activateUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/activate`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/deactivate`);
  return response.data;
};

// Teacher approval
export const getPendingTeachers = async () => {
  const response = await api.get("/admin/teachers/pending");
  return response.data;
};

export const approveTeacher = async (profileId) => {
  const response = await api.patch(`/admin/teachers/${profileId}/approve`);
  return response.data;
};

export const rejectTeacher = async (profileId) => {
  const response = await api.patch(`/admin/teachers/${profileId}/reject`);
  return response.data;
};

// Lessons
export const getAdminLessons = async (params = {}) => {
  const response = await api.get("/admin/lessons", { params });
  return response.data;
};

export const adminArchiveLesson = async (id) => {
  const response = await api.patch(`/admin/lessons/${id}/archive`);
  return response.data;
};

// Subjects
export const adminCreateSubject = async (data) => {
  const response = await api.post("/admin/subjects", data);
  return response.data;
};

export const adminUpdateSubject = async (id, data) => {
  const response = await api.put(`/admin/subjects/${id}`, data);
  return response.data;
};

// Classes
export const getAdminClasses = async (params = {}) => {
  const response = await api.get("/admin/classes", { params });
  return response.data;
};

// Audit logs
export const getAuditLogs = async (params = {}) => {
  const response = await api.get("/admin/audit-logs", { params });
  return response.data;
};
