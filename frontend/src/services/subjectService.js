import api from "./api.js";

export const getSubjects = async () => {
  const response = await api.get("/subjects");
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
};
