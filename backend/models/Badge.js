import mongoose from "mongoose";

/**
 * Defines the badge catalogue — what badges exist and how they are earned.
 * Badge requirements are stored here so logic stays configurable without
 * touching application code.
 *
 * EarnedBadge is an embedded sub-document on StudentProfile storing which
 * badges a specific student has unlocked.
 */

export const earnedBadgeSchema = new mongoose.Schema(
  {
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const badgeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Badge key is required."],
      unique: true,
      trim: true,
      uppercase: true,
      // e.g. FIRST_LESSON, PERFECT_SCORE, STREAK_7
    },
    name: {
      type: String,
      required: [true, "Badge name is required."],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    icon: {
      type: String,
      default: "Award",     // Lucide icon name used on the frontend
    },
    // Configurable requirement fields — the gamification service reads these
    // to decide whether to award the badge. Keeps thresholds out of code.
    requirementType: {
      type: String,
      enum: ["lessons_completed", "quizzes_completed", "streak_days", "perfect_score", "xp_reached", "manual"],
      required: true,
    },
    requirementValue: {
      type: Number,
      default: 1,
      min: 0,
    },
    xpReward: {
      type: Number,
      default: 50,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
