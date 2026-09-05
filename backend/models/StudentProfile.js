import mongoose from "mongoose";
import { earnedBadgeSchema } from "./Badge.js";

/**
 * Extended profile for students. Created automatically when a student
 * registers. Authentication fields (email, password, role, tokens) remain
 * exclusively in the User model — this model holds academic/learning identity
 * and statistics that will be populated by server-side learning logic later.
 *
 * Index: user (unique) — one profile per student, fast lookup.
 */
const studentProfileSchema = new mongoose.Schema(
  {
    // One-to-one link to User; a student can only have one profile
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
      unique: true,
      index: true,
    },

    // ── Academic information ──────────────────────────────────────────────────
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, "School name cannot exceed 200 characters."],
      default: null,
    },
    // e.g. "JSS2", "SSS3", "Primary 5"
    classLevel: {
      type: String,
      trim: true,
      maxlength: [50, "Class level cannot exceed 50 characters."],
      default: null,
    },
    // e.g. "Science", "Arts", "Commercial"
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters."],
      default: null,
    },

    // ── Personal ──────────────────────────────────────────────────────────────
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters."],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    learningGoals: {
      type: String,
      trim: true,
      maxlength: [500, "Learning goals cannot exceed 500 characters."],
      default: null,
    },
    // Array of Subject ObjectIds the student is interested in
    favoriteSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    // ── Gamification / Statistics (server-controlled — never updated by student) ─
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    studyStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStudyStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Total study time in minutes
    totalStudyTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Stored as a percentage 0–100
    averageQuizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Streak tracking (server-controlled) ──────────────────────────────────
    // Date of the last day the student completed a study activity.
    // Used server-side to calculate streaks — never trusted from the client.
    lastStudyDate: {
      type: Date,
      default: null,
    },

    // ── Badges ────────────────────────────────────────────────────────────────
    earnedBadges: {
      type: [earnedBadgeSchema],
      default: [],
    },

    // ── Leaderboard / rank cache (refreshed periodically by gamification service) ─
    leaderboardRank: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
