import mongoose from "mongoose";

/**
 * Connects a student (User) to a Class.
 *
 * Compound unique index on [student, class] prevents duplicate enrollments.
 * Index: class — find all enrollments for a given class quickly (teacher view).
 * Index: student — find all enrollments for a given student quickly.
 */
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required."],
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class reference is required."],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "pending"],
        message: "Status must be active, inactive, or pending.",
      },
      default: "active",
    },
  },
  { timestamps: true },
);

// Prevent the same student from being enrolled in the same class more than once
enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
