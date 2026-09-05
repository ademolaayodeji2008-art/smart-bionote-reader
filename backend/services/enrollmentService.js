import Enrollment from "../models/Enrollment.js";
import Class from "../models/Class.js";
import { AppError } from "../utils/AppError.js";

/**
 * Returns all enrollments for a given student, with class details populated.
 */
export const getEnrollmentsByStudent = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate({
      path: "class",
      populate: [
        { path: "subjects", select: "name slug icon" },
        { path: "teacher", select: "fullName email" },
      ],
    })
    .sort({ enrolledAt: -1 })
    .lean();
};

/**
 * Returns all enrollments for a given class.
 * Verifies the requesting teacher owns that class before exposing the list.
 */
export const getEnrollmentsByClass = async (classId, teacherId) => {
  const cls = await Class.findById(classId).lean();
  if (!cls) throw new AppError("Class not found.", 404);
  if (cls.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to view this class's enrollments.", 403);
  }

  return Enrollment.find({ class: classId })
    .populate("student", "fullName email profileImage")
    .sort({ enrolledAt: -1 })
    .lean();
};
