import mongoose from "mongoose";

/**
 * Stores a student's bookmarked lessons.
 * Compound unique index prevents duplicate bookmarks for the same lesson.
 * Index: user — fetch all bookmarks for a student quickly.
 */
const bookmarkSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

// Prevent duplicate bookmarks for the same user+lesson pair
bookmarkSchema.index({ user: 1, lesson: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
