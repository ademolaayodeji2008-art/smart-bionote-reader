import Class from "../models/Class.js";
import { AppError } from "../utils/AppError.js";

/**
 * Returns all active classes that belong to a specific teacher.
 * Populates subject names for display.
 */
export const getClassesByTeacher = async (teacherId) => {
  return Class.find({ teacher: teacherId, isActive: true })
    .populate("subjects", "name slug icon")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Returns a single class by id. Throws 404 if not found.
 */
export const getClassById = async (id) => {
  const cls = await Class.findById(id)
    .populate("subjects", "name slug icon")
    .populate("teacher", "fullName email")
    .lean();
  if (!cls) throw new AppError("Class not found.", 404);
  return cls;
};

/**
 * Creates a class. The teacher field is always set from the authenticated
 * user — the frontend cannot override it.
 */
export const createClass = async (teacherId, data) => {
  const { name, description, schoolName, classLevel, academicSession, subjects } = data;
  const cls = await Class.create({
    name,
    description,
    schoolName,
    classLevel,
    academicSession,
    subjects: subjects || [],
    teacher: teacherId,
  });
  return cls;
};

/**
 * Updates a class. Verifies that the requesting teacher owns it.
 * Only allowed fields are patched.
 */
export const updateClass = async (id, teacherId, data) => {
  const cls = await Class.findById(id);
  if (!cls) throw new AppError("Class not found.", 404);
  if (cls.teacher.toString() !== teacherId.toString()) {
    throw new AppError("You do not have permission to modify this class.", 403);
  }

  const allowedFields = ["name", "description", "schoolName", "classLevel", "academicSession", "subjects", "isActive"];
  const safeUpdate = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) safeUpdate[field] = data[field];
  }

  const updated = await Class.findByIdAndUpdate(id, { $set: safeUpdate }, {
    new: true,
    runValidators: true,
  }).populate("subjects", "name slug icon");

  return updated;
};
