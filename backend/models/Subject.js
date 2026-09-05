import mongoose from "mongoose";

/**
 * Represents a school subject (Biology, Chemistry, Physics, etc.).
 * The platform starts with Biology but must support expansion.
 *
 * Index: slug (unique) — fast lookup by URL-friendly identifier.
 * Index: isActive — filter to only active subjects in listings.
 */
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required."],
      trim: true,
      maxlength: [100, "Subject name cannot exceed 100 characters."],
    },
    // URL-friendly unique identifier, e.g. "biology", "english-language"
    slug: {
      type: String,
      required: [true, "Subject slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
      default: null,
    },
    // Icon name / identifier for frontend display (e.g. Lucide icon name)
    icon: {
      type: String,
      trim: true,
      default: "BookOpen",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
