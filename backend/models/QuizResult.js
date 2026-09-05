import mongoose from "mongoose";

/**
 * Stores one quiz attempt per student per lesson.
 * Grading always happens on the backend — scores are never trusted from the client.
 *
 * Index: user — all attempts by a student.
 * Index: lesson — all attempts on a lesson (teacher analytics).
 * Compound: [user, lesson] — fast lookup of a student's attempts on a specific lesson.
 */
const quizResultSchema = new mongoose.Schema(
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
    // Raw score (sum of marks for correct answers)
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    // 0–100 percentage
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    // Which attempt number this is for this user on this lesson (1, 2, 3…)
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

quizResultSchema.index({ user: 1, lesson: 1 });

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
export default QuizResult;
