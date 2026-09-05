import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";
import * as invitationService from "../services/teacherInvitationService.js";
import { signAccessToken } from "../utils/tokenUtils.js";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "../utils/cookieOptions.js";

/** POST /api/admin/invitations — Admin creates a teacher invitation */
export const createInvitation = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName?.trim()) throw new AppError("Teacher full name is required.", 400);
  if (!email?.trim()) throw new AppError("Teacher email is required.", 400);

  const invitation = await invitationService.createInvitation(req.user._id, { fullName, email });
  sendSuccess(res, {
    statusCode: 201,
    message: "Invitation sent successfully.",
    data: { invitation: { _id: invitation._id, fullName: invitation.fullName, email: invitation.email, expiresAt: invitation.expiresAt } },
  });
});

/** GET /api/admin/invitations — Admin lists all invitations */
export const listInvitations = asyncHandler(async (req, res) => {
  const invitations = await invitationService.listInvitations();
  sendSuccess(res, { message: "Invitations retrieved.", data: { invitations } });
});

/** PATCH /api/admin/invitations/:id/revoke — Admin revokes a pending invitation */
export const revokeInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.revokeInvitation(req.user._id, req.params.id);
  sendSuccess(res, { message: "Invitation revoked.", data: { invitation } });
});

/** GET /api/invitations/verify?token=... — Teacher verifies their token (public) */
export const verifyInvitation = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new AppError("Invitation token is required.", 400);

  const info = await invitationService.getInvitationByToken(token);
  sendSuccess(res, { message: "Invitation is valid.", data: { invitation: info } });
});

/** POST /api/invitations/accept — Teacher sets password and activates account (public) */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token) throw new AppError("Invitation token is required.", 400);
  if (!password) throw new AppError("Password is required.", 400);

  const user = await invitationService.acceptInvitation(token, password);

  // Sign the user in immediately after accepting
  const jwtToken = signAccessToken(user, "7d");
  res.cookie(AUTH_COOKIE_NAME, jwtToken, getAuthCookieOptions(false));

  sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully. Welcome to Smart Bionote Reader!",
    data: { user },
  });
});
