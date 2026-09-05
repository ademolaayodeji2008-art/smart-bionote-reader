import Bookmark from "../models/Bookmark.js";
import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";

/**
 * Adds a bookmark. Verifies the lesson exists and is published before
 * creating it. Duplicate bookmarks are silently ignored (idempotent).
 */
export const addBookmark = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.status !== "published")
    throw new AppError("You can only bookmark published lessons.", 400);

  try {
    const bookmark = await Bookmark.create({ user: userId, lesson: lessonId });
    return bookmark;
  } catch (err) {
    if (err.code === 11000) return null; // already bookmarked — treat as success
    throw err;
  }
};

/** Removes a bookmark. Returns true if deleted, false if it didn't exist. */
export const removeBookmark = async (userId, lessonId) => {
  const result = await Bookmark.findOneAndDelete({ user: userId, lesson: lessonId });
  return Boolean(result);
};

/** Returns all bookmarked lessons for the authenticated student, newest first. */
export const getBookmarks = async (userId) => {
  return Bookmark.find({ user: userId })
    .populate({
      path: "lesson",
      select: "title description type subject coverImage publishedAt",
      populate: { path: "subject", select: "name slug icon" },
    })
    .sort({ createdAt: -1 })
    .lean();
};

/** Returns a Set of lesson IDs the user has bookmarked (for frontend state). */
export const getBookmarkedLessonIds = async (userId) => {
  const bookmarks = await Bookmark.find({ user: userId }).select("lesson").lean();
  return new Set(bookmarks.map((b) => b.lesson.toString()));
};
