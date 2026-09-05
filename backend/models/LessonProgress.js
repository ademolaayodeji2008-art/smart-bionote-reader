import mongoose from "mongoose";

/**
 * Tracks a student's reading/viewing progress through a lesson.
 * One document per student+lesson pair — upserted on each progress update.
 *
 * Compound unique index: [user, lesson] — one progress record per student per lesson.
 * Index: user — fetch all progress records for a student quickly.
 */
const lessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson reference is required."],
      index: true,
    },
    // 0–100 percentage of lesson consumed
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // For notes: character/word offset into the content string
    // For drawing lessons: the current step number (1-based)
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
export default LessonProgress;
