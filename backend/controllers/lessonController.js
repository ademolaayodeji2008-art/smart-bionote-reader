import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as lessonService from "../services/lessonService.js";
import { discoverLessons } from "../services/lessonDiscoveryService.js";

/**
 * @route   GET /api/lessons
 * @access  Any authenticated user (students see published only)
 * Supports: ?page, ?limit, ?search, ?subject, ?type, ?classId
 */
export const getPublishedLessons = asyncHandler(async (req, res) => {
  const result = await discoverLessons(req.query);
  sendSuccess(res, { message: "Lessons retrieved successfully.", data: result });
});

/**
 * @route   POST /api/lessons
 * @access  Authenticated teacher
 */
export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.createLesson(req.user._id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Lesson created successfully.", data: { lesson } });
});

/**
 * @route   GET /api/lessons/my-lessons
 * @access  Authenticated teacher
 * Supports: ?page, ?limit, ?status, ?type, ?subject, ?search
 */
export const getMyLessons = asyncHandler(async (req, res) => {
  const result = await lessonService.getTeacherLessons(req.user._id, req.query);
  sendSuccess(res, { message: "Lessons retrieved successfully.", data: result });
});

/**
 * @route   GET /api/lessons/:id
 * @access  Teacher (own), Student (published only), Admin
 */
export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getLessonById(req.params.id, req.user);
  sendSuccess(res, { message: "Lesson retrieved successfully.", data: { lesson } });
});

/**
 * @route   PUT /api/lessons/:id
 * @access  Authenticated teacher (must own the lesson)
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(req.params.id, req.user._id, req.body);
  sendSuccess(res, { message: "Lesson updated successfully.", data: { lesson } });
});

/**
 * @route   POST /api/lessons/:id/publish
 * @access  Authenticated teacher (must own the lesson)
 */
export const publishLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.publishLesson(req.params.id, req.user._id);
  sendSuccess(res, { message: "Lesson published successfully.", data: { lesson } });
});

/**
 * @route   POST /api/lessons/:id/archive
 * @access  Authenticated teacher (must own the lesson)
 */
export const archiveLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.archiveLesson(req.params.id, req.user._id);
  sendSuccess(res, { message: "Lesson archived successfully.", data: { lesson } });
});

/**
 * @route   DELETE /api/lessons/:id
 * @access  Authenticated teacher (must own the lesson; draft only)
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  await lessonService.deleteLesson(req.params.id, req.user._id);
  sendSuccess(res, { message: "Lesson deleted successfully." });
});

// ── Media upload controllers ──────────────────────────────────────────────────

/**
 * @route   POST /api/lessons/:id/cover-image
 * @access  Authenticated teacher (must own the lesson)
 */
export const uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error("No file uploaded.");
  const lesson = await lessonService.uploadLessonCoverImage(
    req.params.id,
    req.user._id,
    req.file.buffer,
    req.file.mimetype,
  );
  sendSuccess(res, { message: "Cover image uploaded successfully.", data: { coverImage: lesson.coverImage } });
});

/**
 * @route   POST /api/lessons/:id/steps/:stepId/image
 * @access  Authenticated teacher (must own the drawing lesson)
 */
export const uploadStepImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error("No file uploaded.");
  const lesson = await lessonService.uploadDrawingStepImage(
    req.params.id,
    req.params.stepId,
    req.user._id,
    req.file.buffer,
  );
  const step = lesson.drawingSteps.id(req.params.stepId);
  sendSuccess(res, { message: "Step image uploaded successfully.", data: { image: step?.image } });
});

/**
 * @route   POST /api/lessons/:id/steps/:stepId/audio
 * @access  Authenticated teacher (must own the drawing lesson)
 *
 * IMPORTANT: This endpoint is for drawing lesson steps ONLY.
 * Normal note lessons do not have teacher-uploaded audio.
 * Normal notes will use browser SpeechSynthesis in a future phase.
 */
export const uploadStepAudio = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error("No file uploaded.");
  const lesson = await lessonService.uploadDrawingStepAudio(
    req.params.id,
    req.params.stepId,
    req.user._id,
    req.file.buffer,
  );
  const step = lesson.drawingSteps.id(req.params.stepId);
  sendSuccess(res, { message: "Step audio uploaded successfully.", data: { audio: step?.audio } });
});

/**
 * @route   POST /api/lessons/:id/document
 * @access  Authenticated teacher (must own the lesson, note type only)
 *
 * Accepts a .docx or .pdf file.
 * For .docx: mammoth extracts rich HTML + plain text server-side.
 * For .pdf: stored on Cloudinary; teacher must also provide plain text for voice.
 *
 * contentMode is set to "document" to tell the student reader
 * to render HTML/PDF instead of the plain text editor content.
 */
export const uploadLessonDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No document file uploaded.", 400);

  const { processWordDocument } = await import("../services/documentService.js");
  const { AppError: AE } = await import("../utils/AppError.js");
  const Lesson = (await import("../models/Lesson.js")).default;

  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== req.user._id.toString()) {
    throw new AppError("You do not have permission to upload documents for this lesson.", 403);
  }
  if (lesson.type !== "note") {
    throw new AppError("Document upload is only available for note lessons.", 400);
  }

  const isPdf = req.file.mimetype === "application/pdf";

  if (isPdf) {
    // PDF: upload to Cloudinary, store URL, teacher provides voice text separately
    const cloudinary = (await import("../config/cloudinary.js")).default;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `smart-bionote-reader/lessons/${lesson._id}/documents`,
          resource_type: "raw",
          format: "pdf",
          access_mode: "public",   // ensure the URL is publicly accessible
        },
        (err, res) => err ? reject(new AppError("PDF upload failed.", 500)) : resolve(res),
      );
      stream.end(req.file.buffer);
    });

    // Delete old document if it exists
    if (lesson.document?.publicId) {
      const { deleteDocumentFromCloudinary } = await import("../services/documentService.js");
      await deleteDocumentFromCloudinary(lesson.document.publicId);
    }

    lesson.document = {
      url: result.secure_url,
      publicId: result.public_id,
      type: "pdf",
      html: null,
      plainText: lesson.content || "",
    };
    lesson.contentMode = "document";
    await lesson.save();

    return sendSuccess(res, {
      message: "PDF uploaded. Students will view the PDF directly. Add plain text in the content field for the voice reader.",
      data: { document: lesson.document, contentMode: lesson.contentMode },
    });
  }

  // Word document: extract HTML + plain text with mammoth
  const { cloudinaryUrl, publicId, html, plainText, wordCount } =
    await processWordDocument(req.file.buffer, lesson._id.toString());

  // Delete old document if it exists
  if (lesson.document?.publicId) {
    const { deleteDocumentFromCloudinary } = await import("../services/documentService.js");
    await deleteDocumentFromCloudinary(lesson.document.publicId);
  }

  lesson.document = {
    url: cloudinaryUrl,
    publicId,
    type: "docx",
    html,
    plainText,
  };
  // Switch to document mode — student viewer will render the extracted HTML
  lesson.contentMode = "document";
  // Also store plain text in content field so the voice reader works
  lesson.content = plainText;
  await lesson.save();

  sendSuccess(res, {
    message: `Document processed successfully. ${wordCount} words extracted for the voice reader.`,
    data: { document: lesson.document, contentMode: lesson.contentMode, wordCount },
  });
});
