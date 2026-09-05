import { Router } from "express";
import {
  createLesson,
  getMyLessons,
  getPublishedLessons,
  getLessonById,
  updateLesson,
  publishLesson,
  archiveLesson,
  deleteLesson,
  uploadCoverImage as uploadCoverImageController,
  uploadStepImage as uploadStepImageController,
  uploadStepAudio as uploadStepAudioController,
} from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  uploadCoverImage,
  uploadStepImage,
  uploadStepAudio,
  handleUploadError,
} from "../middleware/upload.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";
import { createLessonValidator, updateLessonValidator } from "../validators/lessonValidators.js";

const router = Router();
router.use(protect);

// Teacher: create lesson
router.post("/", requireRole("teacher"), createLessonValidator, validateRequest, createLesson);
// Teacher: own lesson list
router.get("/my-lessons", requireRole("teacher"), getMyLessons);
// All authenticated: published lesson discovery
router.get("/", getPublishedLessons);
// Single lesson (access-controlled in service)
router.get("/:id", validateObjectId("id"), getLessonById);
// Teacher CRUD
router.put("/:id", requireRole("teacher"), validateObjectId("id"), updateLessonValidator, validateRequest, updateLesson);
router.post("/:id/publish", requireRole("teacher"), validateObjectId("id"), publishLesson);
router.post("/:id/archive", requireRole("teacher"), validateObjectId("id"), archiveLesson);
router.delete("/:id", requireRole("teacher"), validateObjectId("id"), deleteLesson);

// Media uploads — rate-limited
router.post("/:id/cover-image", requireRole("teacher"), validateObjectId("id"), uploadLimiter, uploadCoverImage, handleUploadError, uploadCoverImageController);
router.post("/:id/steps/:stepId/image", requireRole("teacher"), validateObjectId("id"), uploadLimiter, uploadStepImage, handleUploadError, uploadStepImageController);
// Drawing step audio ONLY — normal notes use browser SpeechSynthesis, no teacher audio upload
router.post("/:id/steps/:stepId/audio", requireRole("teacher"), validateObjectId("id"), uploadLimiter, uploadStepAudio, handleUploadError, uploadStepAudioController);

export default router;
