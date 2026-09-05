import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as progressService from "../services/progressService.js";

/** PUT /api/progress/:lessonId — upsert progress for a lesson */
export const updateProgress = asyncHandler(async (req, res) => {
  const { progressPercentage, lastPosition } = req.body;
  const progress = await progressService.upsertProgress(
    req.user._id,
    req.params.lessonId,
    { progressPercentage, lastPosition },
  );
  sendSuccess(res, { message: "Progress updated.", data: { progress } });
});

/** GET /api/progress/:lessonId */
export const getProgressForLesson = asyncHandler(async (req, res) => {
  const progress = await progressService.getProgressForLesson(
    req.user._id,
    req.params.lessonId,
  );
  sendSuccess(res, { message: "Progress retrieved.", data: { progress } });
});

/** GET /api/progress */
export const getAllProgress = asyncHandler(async (req, res) => {
  const progress = await progressService.getAllProgress(req.user._id);
  sendSuccess(res, { message: "Progress retrieved.", data: { progress } });
});
