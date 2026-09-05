import api from "./api.js";

export const getTeacherProfile = async () => {
  const response = await api.get("/teachers/profile");
  return response.data;
};

export const updateTeacherProfile = async (data) => {
  const response = await api.put("/teachers/profile", data);
  return response.data;
};
