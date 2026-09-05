import api from "./api.js";

export const getStudentProfile = async () => {
  const response = await api.get("/students/profile");
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await api.put("/students/profile", data);
  return response.data;
};
