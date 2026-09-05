import multer from "multer";
import { AppError } from "../utils/AppError.js";

/**
 * Allowed MIME types by upload category.
 * Validates by MIME, not file extension, to prevent spoofing.
 */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",       // .mp3
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",        // .m4a
  "audio/x-m4a",
  "audio/aac",
  "audio/x-aac",
]);

// Size limits
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;  // 5 MB
const AUDIO_SIZE_LIMIT = 20 * 1024 * 1024; // 20 MB

/**
 * Creates a multer instance that validates MIME type and stores to memory.
 * Cloudinary upload happens in the controller/service after validation.
 */
const buildUploader = (allowedTypes, sizeLimit, fieldLabel) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: sizeLimit },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            `Invalid file type for ${fieldLabel}. Allowed: ${[...allowedTypes].join(", ")}.`,
            400,
          ),
        );
      }
    },
  });

/**
 * Middleware for uploading a single lesson cover image.
 * Field name: "coverImage"
 */
export const uploadCoverImage = buildUploader(ALLOWED_IMAGE_TYPES, IMAGE_SIZE_LIMIT, "cover image")
  .single("coverImage");

/**
 * Middleware for uploading a single drawing step image.
 * Field name: "stepImage"
 */
export const uploadStepImage = buildUploader(ALLOWED_IMAGE_TYPES, IMAGE_SIZE_LIMIT, "step image")
  .single("stepImage");

/**
 * Middleware for uploading a teacher-recorded drawing step audio.
 * ONLY valid for drawing lesson steps — normal note lessons have no teacher audio.
 * Field name: "stepAudio"
 */
export const uploadStepAudio = buildUploader(ALLOWED_AUDIO_TYPES, AUDIO_SIZE_LIMIT, "step audio")
  .single("stepAudio");

/**
 * Express error handler for multer-specific errors (file too large, etc.).
 * Register this directly after a multer middleware in the route chain.
 */
export const handleUploadError = (err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return next(new AppError("File is too large. Check the size limit for this upload.", 400));
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return next(new AppError("Unexpected file field in this request.", 400));
  }
  // Re-throw AppErrors produced by the fileFilter
  if (err?.isOperational) return next(err);
  next(err);
};
