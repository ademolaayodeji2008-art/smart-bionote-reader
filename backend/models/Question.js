import mongoose from "mongoose";

/**
 * Standalone Question document linked to a Lesson.
 * Keeping questions as a separate collection (not embedded in Lesson)
 * allows independent CRUD, ordering, and future reuse across lessons.
 *
 * Index: lesson — fetch all questions for a lesson quickly.
 * Index: lesson + order — fetch sorted questions efficiently.
 *
 * SECURITY: correctAnswer is excluded from default .select() so it is
 * never returned to students before quiz submission.
 */
const questionSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson reference is required."],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required."],
      trim: true,
      maxlength: [2000, "Question text cannot exceed 2000 characters."],
    },
    type: {
      type: String,
      enum: {
        values: ["multiple-choice", "true-false", "short-answer"],
        message: "Question type must be multiple-choice, true-false, or short-answer.",
      },
      required: [true, "Question type is required."],
    },
    // Array of option strings for multiple-choice and true-false
    options: {
      type: [String],
      default: [],
    },
    // The correct answer — hidden from students before submission
    correctAnswer: {
      type: String,
      trim: true,
      required: [true, "Correct answer is required."],
      select: false,   // never returned unless explicitly requested
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [1000, "Explanation cannot exceed 1000 characters."],
      default: null,
    },
    marks: {
      type: Number,
      default: 1,
      min: [0, "Marks cannot be negative."],
      max: [100, "Marks cannot exceed 100."],
    },
    // Display order within the lesson
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

questionSchema.index({ lesson: 1, order: 1 });

const Question = mongoose.model("Question", questionSchema);
export default Question;
