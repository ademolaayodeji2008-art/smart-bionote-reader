import api from "./api.js";

export const getGlobalLeaderboard = async (params = {}) => {
  const response = await api.get("/leaderboard", { params });
  return response.data;
};

export const getClassLeaderboard = async (classId, params = {}) => {
  const response = await api.get(`/leaderboard/class/${classId}`, { params });
  return response.data;
};

export const getMyRank = async () => {
  const response = await api.get("/leaderboard/me");
  return response.data;
};
