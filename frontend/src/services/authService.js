import api from "./api.js";

/** Extracts a safe, user-facing message from an Axios error. */
export const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

/** Extracts the machine-readable error code (e.g. "TOKEN_EXPIRED"), if any. */
export const getErrorCode = (error) => error.response?.data?.code;

export const registerRequest = async ({ fullName, email, password, confirmPassword, role }) => {
  const response = await api.post("/auth/register", { fullName, email, password, confirmPassword, role });
  return response.data;
};

export const loginRequest = async ({ email, password, rememberMe }) => {
  const response = await api.post("/auth/login", { email, password, rememberMe });
  return response.data;
};

export const logoutRequest = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUserRequest = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const verifyEmailRequest = async (token) => {
  const response = await api.get("/auth/verify-email", { params: { token } });
  return response.data;
};

export const forgotPasswordRequest = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordRequest = async ({ token, newPassword, confirmPassword }) => {
  const response = await api.post("/auth/reset-password", { token, newPassword, confirmPassword });
  return response.data;
};

export const googleAuthRequest = async (idToken) => {
  const response = await api.post("/auth/google", { idToken });
  return response.data;
};
