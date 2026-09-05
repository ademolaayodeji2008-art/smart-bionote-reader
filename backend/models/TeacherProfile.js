import mongoose from "mongoose";

/**
 * Extended profile for teachers. Created automatically when a teacher
 * registers. Authentication fields remain exclusively in the User model.
 * isApproved is admin-controlled and never writable by the teacher themselves.
 *
 * Index: user (unique) — one profile per teacher, fast lookup.
 */
const teacherProfileSchema = new mongoose.Schema(
  {
    // One-to-one link to User; a teacher can only have one profile
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
      unique: true,
      index: true,
    },

    // ── Academic / professional information ──────────────────────────────────
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, "School name cannot exceed 200 characters."],
      default: null,
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: [200, "Qualification cannot exceed 200 characters."],
      default: null,
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: [200, "Specialization cannot exceed 200 characters."],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters."],
      default: null,
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative."],
      max: [60, "Years of experience cannot exceed 60."],
      default: null,
    },
    // Subjects the teacher specializes in — array of Subject ObjectIds
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    // ── Administrative ────────────────────────────────────────────────────────
    // Admin-controlled: teachers cannot set this themselves
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);

export default TeacherProfile;
