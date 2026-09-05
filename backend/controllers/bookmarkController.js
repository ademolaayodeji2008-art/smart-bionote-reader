import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as bookmarkService from "../services/bookmarkService.js";

/** POST /api/bookmarks/:lessonId */
export const addBookmark = asyncHandler(async (req, res) => {
  await bookmarkService.addBookmark(req.user._id, req.params.lessonId);
  sendSuccess(res, { statusCode: 201, message: "Lesson bookmarked." });
});

/** DELETE /api/bookmarks/:lessonId */
export const removeBookmark = asyncHandler(async (req, res) => {
  await bookmarkService.removeBookmark(req.user._id, req.params.lessonId);
  sendSuccess(res, { message: "Bookmark removed." });
});

/** GET /api/bookmarks */
export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await bookmarkService.getBookmarks(req.user._id);
  sendSuccess(res, { message: "Bookmarks retrieved.", data: { bookmarks } });
});
