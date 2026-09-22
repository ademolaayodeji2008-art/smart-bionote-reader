import mongoose from "mongoose";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE NOTE — Two completely separate learning systems:
 *
 * 1. NOTE lessons
 *    Teacher writes educational text content.
 *    The application will later use the Browser SpeechSynthesis API to
 *    read the note aloud. There is NO teacher-uploaded reading audio here.
 *    The `content` field holds the educational text only.
 *
 * 2. DRAWING lessons
 *    Teachers upload images and their own recorded audio per step.
 *    Each drawingStep has its own { image, audio } from Cloudinary.
 *    This teacher-recorded audio is ONLY for drawing steps.
 *
 * These two systems must never be mixed. A note lesson has no audio field.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Cloudinary media metadata sub-schema (images) ───────────────────────────
const imageMetaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    format: { type: String, default: null },
  },
  { _id: false },
);

// ── Cloudinary media metadata sub-schema (audio — drawing steps only) ───────
const audioMetaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    // Duration in seconds, set when Cloudinary returns it
    duration: { type: Number, default: null },
    format: { type: String, default: null },
  },
  { _id: false },
);

// ── Drawing step sub-document ────────────────────────────────────────────────
const drawingStepSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: [true, "Step number is required."],
      min: [1, "Step number must be at least 1."],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Step title cannot exceed 200 characters."],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Step description cannot exceed 2000 characters."],
      default: null,
    },
    // Stored as Cloudinary metadata only — binary never goes in MongoDB
    image: {
      type: imageMetaSchema,
      default: null,
    },
    // Teacher-recorded audio for THIS step only.
    // There is NO equivalent field on the root lesson document for notes.
    audio: {
      type: audioMetaSchema,
      default: null,
    },
  },
  { _id: true },
);

// ── Question foundation sub-document ─────────────────────────────────────────
// Full quiz engine will be built in a later phase. This establishes the
// schema so questions can be associated with lessons now.
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required."],
      trim: true,
      maxlength: [2000, "Question text cannot exceed 2000 characters."],
    },
    // Multiple choice, true/false, short answer — expandable later
    questionType: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer"],
      default: "multiple-choice",
    },
    // For multiple-choice / true-false: array of option strings
    options: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
    // Index into options[], or the answer text for short-answer
    correctAnswer: {
      type: String,
      trim: true,
      default: null,
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [1000, "Explanation cannot exceed 1000 characters."],
      default: null,
    },
    marks: {
      type: Number,
      default: 1,
      min: [0, "Marks cannot be negative."],
    },
  },
  { _id: true },
);

// ── Main Lesson schema ────────────────────────────────────────────────────────
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required."],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters."],
    },
    // URL-friendly identifier, generated server-side from title + unique suffix
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters."],
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: ["note", "drawing"],
        message: "Lesson type must be note or drawing.",
      },
      required: [true, "Lesson type is required."],
      index: true,
    },

    // ── Relationships ──────────────────────────────────────────────────────
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "A lesson must belong to a subject."],
      index: true,
    },
    // Teacher who created and owns this lesson — always set from auth, never trusted from frontend
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A lesson must have a teacher."],
      index: true,
    },
    // Optional: lesson is associated with a specific class
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true,
    },

    // ── Media ──────────────────────────────────────────────────────────────
    // Cover image stored as Cloudinary metadata only
    coverImage: {
      type: imageMetaSchema,
      default: null,
    },

    // ── NOTE content ───────────────────────────────────────────────────────
    // For type = "note" only.
    // DO NOT add a teacher audio field here — normal notes use browser TTS.
    content: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * contentMode controls which content the student sees:
     *   "text"     — teacher typed/pasted content directly (default)
     *   "document" — teacher uploaded a Word/PDF document
     *
     * When "document": document.html is rendered visually,
     *                  content (plain text) is used for the voice reader.
     * When "text":     content is both rendered and read by the voice.
     */
    contentMode: {
      type: String,
      enum: ["text", "document"],
      default: "text",
    },

    /**
     * Uploaded document metadata (Word .docx or PDF).
     * Only populated when contentMode === "document".
     * Binary data is NEVER stored here — only Cloudinary URLs + extracted text.
     */
    document: {
      // Cloudinary URL to download/view the original file
      url: { type: String, default: null },
      publicId: { type: String, default: null },
      // "docx" or "pdf"
      type: { type: String, enum: ["docx", "pdf"], default: null },
      // Extracted HTML from mammoth (.docx only) — rendered to the student
      html: { type: String, default: null },
      // Extracted plain text — fed to the SpeechSynthesis voice reader
      plainText: { type: String, default: null },
    },

    // ── DRAWING content ────────────────────────────────────────────────────
    // For type = "drawing" only.
    // Each step has its own image + teacher-recorded audio (Cloudinary metadata).
    drawingSteps: {
      type: [drawingStepSchema],
      default: [],
    },

    // ── Questions foundation ───────────────────────────────────────────────
    // Full quiz engine in a later phase. Schema is established now so
    // questions can be attached to lessons.
    questions: {
      type: [questionSchema],
      default: [],
    },

    // ── Status & visibility ────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived.",
      },
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: {
        values: ["private", "class", "public"],
        message: "Visibility must be private, class, or public.",
      },
      default: "private",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index: fetch a teacher's lessons filtered by status efficiently
lessonSchema.index({ teacher: 1, status: 1 });
// Compound index: fetch lessons for a subject filtered by status
lessonSchema.index({ subject: 1, status: 1 });
// Compound index: fetch published lessons for a class
lessonSchema.index({ class: 1, status: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
