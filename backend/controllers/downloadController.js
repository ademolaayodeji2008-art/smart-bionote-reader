import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";
import Lesson from "../models/Lesson.js";

/**
 * POST /api/downloads/:lessonId
 * Authorizes a student to download a lesson for offline use.
 * The server verifies: authenticated, lesson published, student authorized.
 * Returns the full lesson data (including drawing steps and audio URLs)
 * so the frontend can store it in IndexedDB.
 *
 * Note: binary media is NOT sent — only Cloudinary URLs are returned.
 * The frontend fetches images/audio separately and caches them.
 */
export const authorizeDownload = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId)
    .populate("subject", "name slug icon")
    .populate("teacher", "fullName");

  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.status !== "published") throw new AppError("Only published lessons can be downloaded.", 400);

  // Future: check subscription entitlement for premium lessons here
  // For now all published lessons are downloadable by authenticated students

  // Return the full lesson payload for offline storage
  sendSuccess(res, {
    message: "Download authorized.",
    data: {
      lesson,
      downloadedAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/downloads
 * Returns metadata about what lessons the student has downloaded.
 * Actual download records are stored client-side in IndexedDB;
 * this endpoint just confirms which lessons the student is still authorized to access.
 */
export const getDownloadable = asyncHandler(async (req, res) => {
  // The list of downloaded lesson IDs is sent by the client
  const { lessonIds } = req.query;
  if (!lessonIds) return sendSuccess(res, { message: "No lesson IDs provided.", data: { authorized: [] } });

  const ids = lessonIds.split(",").filter(Boolean);
  const lessons = await Lesson.find({ _id: { $in: ids }, status: "published" })
    .select("_id title status")
    .lean();

  const authorized = lessons.map((l) => l._id.toString());
  sendSuccess(res, { message: "Authorization check complete.", data: { authorized } });
});
