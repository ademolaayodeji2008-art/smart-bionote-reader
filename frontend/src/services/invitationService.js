import api from "./api.js";

// Admin: send an invitation
export const createInvitation = async ({ fullName, email }) => {
  const response = await api.post("/admin/invitations", { fullName, email });
  return response.data;
};

// Admin: list all invitations
export const listInvitations = async () => {
  const response = await api.get("/admin/invitations");
  return response.data;
};

// Admin: revoke an invitation
export const revokeInvitation = async (id) => {
  const response = await api.patch(`/admin/invitations/${id}/revoke`);
  return response.data;
};

// Public: verify a token before showing the accept form
export const verifyInvitationToken = async (token) => {
  const response = await api.get(`/invitations/verify?token=${token}`);
  return response.data;
};

// Public: accept invitation and create password
export const acceptInvitation = async ({ token, password, confirmPassword }) => {
  const response = await api.post("/invitations/accept", { token, password, confirmPassword });
  return response.data;
};
