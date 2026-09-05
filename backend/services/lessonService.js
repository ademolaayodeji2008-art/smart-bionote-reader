import slugify from "slugify";
import crypto from "node:crypto";
import Lesson from "../models/Lesson.js";
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

// ── Slug generation ───────────────────────────────────────────────────────────

/**
 * Generates a unique, URL-safe slug from a title.
 * Appends a short random suffix to avoid collisions between lessons
 * with identical names.
 */
const generateSlug = (title) => {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = crypto.randomBytes(3).toString("hex"); // 6 hex chars
  return `${base}-${suffix}`;
};

// ── Subject / Class validation helpers ───────────────────────────────────────

/**
 * Validates that a Subject exists and is active.
 * Throws if not found or inactive.
 */
const validateSubject = async (subjectId) => {
  const subject = await Subject.findById(subjectId).lean();
  if (!subject) throw new AppError("Subject not found.", 404);
  if (!subject.isActive) throw new AppError("The selected subject is not active.", 400);
  return subject;
};

/**
 * Validates that a Class exists and belongs to the given teacher.
 * Only checked when a classId is provided.
 */
const validateClassOwnership = async (classId, teacherId) => {
  const cls = await Class.findById(classId).lean();
  if (!cls) throw new AppError("Class not found.", 404);
  if (cls.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to attach a lesson to this class.", 403);
  }
  if (!cls.isActive) throw new AppError("The selected class is not active.", 400);
  return cls;
};

// ── Cloudinary upload helpers ─────────────────────────────────────────────────

/**
 * Uploads a buffer to Cloudinary and returns the metadata object
 * that gets stored in MongoDB (url, publicId, etc.).
 * Never stores binary data in MongoDB.
 */
const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(new AppError("Media upload failed. Please try again.", 500));
      resolve(result);
    });
    stream.end(buffer);
  });

/**
 * Attempts to delete a Cloudinary asset by publicId.
 * Failures are logged but not re-thrown — an orphaned Cloudinary asset
 * should not block the user-facing response.
 */
const tryDeleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`[lessonService] Failed to delete Cloudinary asset ${publicId}:`, err.message);
  }
};

// ── Lesson CRUD ───────────────────────────────────────────────────────────────

/**
 * Creates a new lesson (always starts as a draft).
 * Teacher identity comes from the authenticated session — never from req.body.
 */
export const createLesson = async (teacherId, data) => {
  const { title, description, type, subjectId, classId, content, drawingSteps } = data;

  await validateSubject(subjectId);
  if (classId) await validateClassOwnership(classId, teacherId);

  // Validate type-specific content
  if (type === "note" && !content?.trim()) {
    throw new AppError("Note lessons must have content.", 400);
  }
  if (type === "drawing" && (!drawingSteps || drawingSteps.length === 0)) {
    throw new AppError("Drawing lessons must have at least one step.", 400);
  }

  const slug = generateSlug(title);

  const lessonData = {
    title,
    slug,
    description: description || null,
    type,
    subject: subjectId,
    teacher: teacherId,
    class: classId || null,
    status: "draft",
    visibility: "private",
  };

  if (type === "note") {
    lessonData.content = content;
  } else if (type === "drawing") {
    // Ensure stepNumbers are correct and sequential
    lessonData.drawingSteps = (drawingSteps || []).map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
  }

  const lesson = await Lesson.create(lessonData);
  return lesson;
};

/**
 * Returns a paginated list of lessons belonging to the authenticated teacher.
 * Supports filtering by status, type, subject, and text search on title.
 */
export const getTeacherLessons = async (teacherId, query) => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    subject,
    search,
  } = query;

  const filter = { teacher: teacherId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (subject) filter.subject = subject;
  if (search) filter.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("subject", "name slug icon")
      .populate("class", "name")
      .select("-content -drawingSteps -questions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lesson.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    lessons,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};

/**
 * Retrieves a single lesson by ID with access control:
 * - Teacher: can view their own lesson at any status
 * - Student: can only view published lessons
 * - Admin: can view any lesson
 */
export const getLessonById = async (lessonId, requestingUser) => {
  const lesson = await Lesson.findById(lessonId)
    .populate("subject", "name slug icon")
    .populate("teacher", "fullName email")
    .populate("class", "name");

  if (!lesson) throw new AppError("Lesson not found.", 404);

  const isOwner = lesson.teacher._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === "admin";
  const isPublished = lesson.status === "published";

  if (isAdmin || isOwner) return lesson;
  if (requestingUser.role === "student" && isPublished) return lesson;

  throw new AppError("You do not have permission to access this lesson.", 403);
};

/**
 * Updates a lesson's editable fields.
 * Only the lesson owner can do this. Uses an explicit whitelist.
 */
export const updateLesson = async (lessonId, teacherId, data) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to modify this lesson.", 403);
  }
  if (lesson.status === "archived") {
    throw new AppError("Archived lessons cannot be edited.", 400);
  }

  // Validate subject / class if being changed
  if (data.subjectId) await validateSubject(data.subjectId);
  if (data.classId) await validateClassOwnership(data.classId, teacherId);

  // Explicit whitelist — never spread data directly
  const ALLOWED = ["title", "description", "visibility"];
  for (const field of ALLOWED) {
    if (data[field] !== undefined) lesson[field] = data[field];
  }

  // Type-specific fields
  if (lesson.type === "note" && data.content !== undefined) {
    lesson.content = data.content;
  }
  if (lesson.type === "drawing" && data.drawingSteps !== undefined) {
    lesson.drawingSteps = data.drawingSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
  }
  if (data.subjectId) lesson.subject = data.subjectId;
  if (data.classId !== undefined) lesson.class = data.classId || null;

  // Re-generate slug only if title changed
  if (data.title && data.title !== lesson.title) {
    lesson.slug = generateSlug(data.title);
  }

  await lesson.save();
  return lesson;
};

/**
 * Publishes a lesson. Validates that it has the minimum required content.
 * Only the owner can publish.
 */
export const publishLesson = async (lessonId, teacherId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to publish this lesson.", 403);
  }
  if (lesson.status === "published") {
    throw new AppError("This lesson is already published.", 400);
  }
  if (lesson.status === "archived") {
    throw new AppError("Archived lessons cannot be published.", 400);
  }

  // Content validation before publish
  if (!lesson.title?.trim()) throw new AppError("A lesson must have a title before publishing.", 400);
  if (!lesson.description?.trim()) throw new AppError("A lesson must have a description before publishing.", 400);
  if (lesson.type === "note" && !lesson.content?.trim()) {
    throw new AppError("Note lessons must have content before publishing.", 400);
  }
  if (lesson.type === "drawing" && lesson.drawingSteps.length === 0) {
    throw new AppError("Drawing lessons must have at least one step before publishing.", 400);
  }

  lesson.status = "published";
  lesson.publishedAt = new Date();
  await lesson.save();
  return lesson;
};

/**
 * Archives a lesson (soft delete). Only the owner can do this.
 */
export const archiveLesson = async (lessonId, teacherId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to archive this lesson.", 403);
  }
  if (lesson.status === "archived") {
    throw new AppError("This lesson is already archived.", 400);
  }

  lesson.status = "archived";
  await lesson.save();
  return lesson;
};

/**
 * Deletes a draft lesson permanently. Only draft lessons can be deleted this way.
 * Published/archived lessons should be archived, not deleted, to preserve history.
 */
export const deleteLesson = async (lessonId, teacherId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to delete this lesson.", 403);
  }
  if (lesson.status !== "draft") {
    throw new AppError("Only draft lessons can be deleted. Use archive for published lessons.", 400);
  }

  await Lesson.findByIdAndDelete(lessonId);
};

// ── Media upload services ─────────────────────────────────────────────────────

/**
 * Uploads a lesson cover image to Cloudinary and updates the lesson document.
 * Returns the updated lesson.
 */
export const uploadLessonCoverImage = async (lessonId, teacherId, fileBuffer, mimetype) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to upload media for this lesson.", 403);
  }

  // Delete old cover image from Cloudinary if it exists
  if (lesson.coverImage?.publicId) {
    await tryDeleteCloudinaryAsset(lesson.coverImage.publicId, "image");
  }

  const result = await uploadBufferToCloudinary(fileBuffer, {
    folder: `smart-bionote-reader/lessons/${lessonId}/cover`,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  });

  lesson.coverImage = {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };

  await lesson.save();
  return lesson;
};

/**
 * Uploads a drawing step image to Cloudinary and updates the specific step.
 * ONLY valid for drawing lesson type.
 */
export const uploadDrawingStepImage = async (lessonId, stepId, teacherId, fileBuffer) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to upload media for this lesson.", 403);
  }
  if (lesson.type !== "drawing") {
    throw new AppError("Step images can only be uploaded to drawing lessons.", 400);
  }

  const step = lesson.drawingSteps.id(stepId);
  if (!step) throw new AppError("Drawing step not found.", 404);

  // Delete old step image from Cloudinary
  if (step.image?.publicId) {
    await tryDeleteCloudinaryAsset(step.image.publicId, "image");
  }

  const result = await uploadBufferToCloudinary(fileBuffer, {
    folder: `smart-bionote-reader/lessons/${lessonId}/steps/${stepId}`,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  });

  step.image = {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };

  await lesson.save();
  return lesson;
};

/**
 * Uploads teacher-recorded audio for a drawing step.
 * ONLY valid for drawing lesson steps — this method must NEVER be used
 * for normal note lessons. Normal notes use browser SpeechSynthesis later.
 */
export const uploadDrawingStepAudio = async (lessonId, stepId, teacherId, fileBuffer) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to upload media for this lesson.", 403);
  }
  if (lesson.type !== "drawing") {
    throw new AppError(
      "Teacher audio recordings can only be attached to drawing lesson steps. " +
      "Normal note lessons use the browser SpeechSynthesis reader instead.",
      400,
    );
  }

  const step = lesson.drawingSteps.id(stepId);
  if (!step) throw new AppError("Drawing step not found.", 404);

  // Delete old step audio from Cloudinary
  if (step.audio?.publicId) {
    await tryDeleteCloudinaryAsset(step.audio.publicId, "video"); // Cloudinary uses "video" for audio
  }

  const result = await uploadBufferToCloudinary(fileBuffer, {
    folder: `smart-bionote-reader/lessons/${lessonId}/steps/${stepId}/audio`,
    resource_type: "video", // Cloudinary resource type for audio files
    allowed_formats: ["mp3", "wav", "m4a", "aac"],
  });

  step.audio = {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration || null,
    format: result.format,
  };

  await lesson.save();
  return lesson;
};
