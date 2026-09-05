import mongoose from "mongoose";

/**
 * Represents a school class/group (e.g. "JSS2 Biology – 2025/2026").
 * One primary teacher owns the class; subjects are an array of Subject refs.
 *
 * Index: teacher — find all classes belonging to a teacher quickly.
 * Index: academicSession — filter classes by school year.
 * Index: isActive — standard active-record filter.
 */
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required."],
      trim: true,
      maxlength: [150, "Class name cannot exceed 150 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
      default: null,
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, "School name cannot exceed 200 characters."],
      default: null,
    },
    // e.g. "JSS1", "SSS2", "Primary 5"
    classLevel: {
      type: String,
      trim: true,
      maxlength: [50, "Class level cannot exceed 50 characters."],
      default: null,
    },
    // e.g. "2025/2026"
    academicSession: {
      type: String,
      trim: true,
      maxlength: [20, "Academic session cannot exceed 20 characters."],
      default: null,
      index: true,
    },
    // Subjects taught in this class
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    // Primary teacher who owns and manages the class
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A class must have a teacher."],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Class = mongoose.model("Class", classSchema);

export default Class;
