import multer from "multer";
import { AppError } from "../utils/AppError.js";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/wave", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/x-aac",
]);

const ALLOWED_DOC_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword",  // .doc (legacy)
  "application/pdf",     // .pdf
]);

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;   // 5 MB
const AUDIO_SIZE_LIMIT = 20 * 1024 * 1024;  // 20 MB
const DOC_SIZE_LIMIT   = 20 * 1024 * 1024;  // 20 MB

const buildUploader = (allowedTypes, sizeLimit, fieldLabel) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: sizeLimit },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.has(file.mimetype)) cb(null, true);
      else cb(new AppError(`Invalid file type for ${fieldLabel}. Allowed: ${[...allowedTypes].join(", ")}.`, 400));
    },
  });

/** Lesson cover image — any lesson type. Field: "coverImage" */
export const uploadCoverImage = buildUploader(ALLOWED_IMAGE_TYPES, IMAGE_SIZE_LIMIT, "cover image").single("coverImage");

/** Drawing step image — drawing lessons only. Field: "stepImage" */
export const uploadStepImage = buildUploader(ALLOWED_IMAGE_TYPES, IMAGE_SIZE_LIMIT, "step image").single("stepImage");

/**
 * Teacher-recorded step audio — drawing lessons ONLY.
 * Normal Biology notes use browser SpeechSynthesis — no teacher audio upload.
 * Field: "stepAudio"
 */
export const uploadStepAudio = buildUploader(ALLOWED_AUDIO_TYPES, AUDIO_SIZE_LIMIT, "step audio").single("stepAudio");

/**
 * Word document (.docx) or PDF upload for note lessons.
 * Teachers may choose to upload a formatted document instead of typing directly.
 * mammoth extracts HTML + plain text from .docx server-side.
 * Field: "document"
 */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DOC_SIZE_LIMIT },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_DOC_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new AppError("Only Word documents (.docx) and PDF files are allowed.", 400));
  },
}).single("document");

/** Error handler for multer errors — register after any upload middleware. */
export const handleUploadError = (err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return next(new AppError("File is too large. Maximum allowed size is 20 MB.", 400));
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return next(new AppError("Unexpected file field in this request.", 400));
  }
  if (err?.isOperational) return next(err);
  next(err);
};
