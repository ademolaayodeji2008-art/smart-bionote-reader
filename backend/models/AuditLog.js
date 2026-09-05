import mongoose from "mongoose";

/**
 * Records important administrative actions for accountability.
 * Never stores passwords, JWT secrets, or other sensitive credentials.
 *
 * Index: admin — find all actions by an admin quickly.
 * Index: createdAt — time-range queries.
 */
const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin reference is required."],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required."],
      trim: true,
      // e.g. APPROVE_TEACHER, DEACTIVATE_USER, ARCHIVE_LESSON, CREATE_SUBJECT
      maxlength: 100,
    },
    targetType: {
      type: String,
      required: [true, "Target type is required."],
      enum: ["User", "TeacherProfile", "Lesson", "Subject", "Class", "Subscription", "Transaction"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target ID is required."],
    },
    // Safe metadata — never passwords, secrets, or tokens
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
