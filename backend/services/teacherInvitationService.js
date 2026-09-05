import crypto from "node:crypto";
import TeacherInvitation from "../models/TeacherInvitation.js";
import User from "../models/User.js";
import TeacherProfile from "../models/TeacherProfile.js";
import { AppError } from "../utils/AppError.js";
import { sendInvitationEmail } from "./emailService.js";

const INVITATION_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

/** Generates a raw token and its SHA-256 hash. Raw token goes in the email; hash stored in DB. */
const generateInvitationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

/**
 * Admin creates a teacher invitation.
 * If a pending (non-expired, non-revoked) invitation already exists for this
 * email, the old one is revoked before creating a new one.
 */
export const createInvitation = async (adminId, { fullName, email }) => {
  // Check if email already has an active account
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  // Revoke any existing pending invitations for this email
  await TeacherInvitation.updateMany(
    { email: email.toLowerCase().trim(), status: "pending" },
    { $set: { status: "revoked" } },
  );

  const { rawToken, tokenHash } = generateInvitationToken();
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  const invitation = await TeacherInvitation.create({
    invitedBy: adminId,
    fullName,
    email: email.toLowerCase().trim(),
    tokenHash,
    expiresAt,
    status: "pending",
  });

  // Send invitation email (uses existing emailService)
  await sendInvitationEmail({ fullName, email }, rawToken);

  return invitation;
};

/**
 * Looks up an invitation by the raw token (hashes it first).
 * Returns public invitation info (no tokenHash) for the frontend to display.
 */
export const getInvitationByToken = async (rawToken) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const invitation = await TeacherInvitation.findOne({ tokenHash }).select("+tokenHash").lean();
  if (!invitation) throw new AppError("This invitation link is invalid.", 404);

  if (invitation.status === "revoked") throw new AppError("This invitation has been revoked.", 410);
  if (invitation.status === "accepted") throw new AppError("This invitation has already been used.", 410);
  if (new Date() > invitation.expiresAt) throw new AppError("This invitation has expired. Please ask the admin to send a new one.", 410);

  return {
    fullName: invitation.fullName,
    email: invitation.email,
    expiresAt: invitation.expiresAt,
  };
};

/**
 * Accepts a teacher invitation: validates the token, creates the User account
 * with role = "teacher" (hardcoded — never from client), creates a TeacherProfile,
 * and marks the invitation as used.
 *
 * Role is set by this service only. The frontend cannot influence it.
 */
export const acceptInvitation = async (rawToken, password) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const invitation = await TeacherInvitation.findOne({ tokenHash }).select("+tokenHash");
  if (!invitation) throw new AppError("This invitation link is invalid.", 404);
  if (!invitation.isValid()) {
    if (invitation.status === "revoked") throw new AppError("This invitation has been revoked.", 410);
    if (invitation.status === "accepted") throw new AppError("This invitation has already been used.", 410);
    throw new AppError("This invitation has expired.", 410);
  }

  // Check once more that email doesn't already have an account (race condition guard)
  const existingUser = await User.findOne({ email: invitation.email }).lean();
  if (existingUser) throw new AppError("An account with this email already exists.", 409);

  // Create teacher account — role is ALWAYS "teacher", hardcoded here
  const user = await User.create({
    fullName: invitation.fullName,
    email: invitation.email,
    password,
    role: "teacher",          // ← hardcoded by the server, never from the client
    isEmailVerified: true,    // invitation email already validates ownership
    isActive: true,
  });

  // Create teacher profile
  try {
    await TeacherProfile.create({ user: user._id });
  } catch (err) {
    console.error("[teacherInvitationService] TeacherProfile creation failed:", err.message);
  }

  // Mark invitation as used — cannot be reused
  invitation.status = "accepted";
  invitation.usedAt = new Date();
  invitation.createdUser = user._id;
  await invitation.save();

  return user;
};

/**
 * Admin revokes a pending invitation by its MongoDB _id.
 */
export const revokeInvitation = async (adminId, invitationId) => {
  const invitation = await TeacherInvitation.findById(invitationId);
  if (!invitation) throw new AppError("Invitation not found.", 404);
  if (invitation.status !== "pending") {
    throw new AppError(`Cannot revoke an invitation with status '${invitation.status}'.`, 400);
  }
  invitation.status = "revoked";
  await invitation.save();
  return invitation;
};

/**
 * Returns all invitations (for admin view), newest first.
 */
export const listInvitations = async () => {
  // Mark expired pending ones as expired before returning
  await TeacherInvitation.updateMany(
    { status: "pending", expiresAt: { $lt: new Date() } },
    { $set: { status: "expired" } },
  );

  return TeacherInvitation.find()
    .populate("invitedBy", "fullName email")
    .populate("createdUser", "fullName email")
    .sort({ createdAt: -1 })
    .lean();
};
