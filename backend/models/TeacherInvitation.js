import mongoose from "mongoose";

/**
 * Represents a single-use, time-limited invitation for a teacher account.
 *
 * Workflow:
 *   1. Admin creates invitation → token generated, email sent
 *   2. Teacher opens invitation link → presents token
 *   3. Backend verifies token (not expired, not used, not revoked)
 *   4. Teacher sets their password → account created with role = "teacher"
 *   5. Token marked as used — cannot be reused
 *
 * Security properties:
 *   - Token stored as SHA-256 hash (raw token sent only in the email link)
 *   - Expires after 48 hours
 *   - Single-use (usedAt set on first successful acceptance)
 *   - Revocable by admin (status → "revoked")
 *   - Role is set by the backend only — never from the frontend
 *
 * Index: tokenHash (unique) — fast lookup on acceptance
 * Index: email — check for existing pending invitation
 * Index: expiresAt — cleanup of expired records
 */
const teacherInvitationSchema = new mongoose.Schema(
  {
    // Admin who sent the invitation
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Intended teacher's details (supplied by admin)
    fullName: {
      type: String,
      required: [true, "Teacher full name is required."],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Teacher email is required."],
      trim: true,
      lowercase: true,
      index: true,
    },
    // SHA-256 hash of the raw token — raw token only ever exists in the email link
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    // The User account created from this invitation (set after acceptance)
    createdUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

/** Convenience: is this invitation currently valid for acceptance? */
teacherInvitationSchema.methods.isValid = function () {
  return (
    this.status === "pending" &&
    this.usedAt === null &&
    new Date() < this.expiresAt
  );
};

const TeacherInvitation = mongoose.model("TeacherInvitation", teacherInvitationSchema);
export default TeacherInvitation;
