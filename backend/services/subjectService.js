import Subject from "../models/Subject.js";
import { AppError } from "../utils/AppError.js";

/**
 * Returns all active subjects sorted by name.
 * Uses lean() since this is a read-only listing.
 */
export const getAllSubjects = async () => {
  return Subject.find({ isActive: true }).sort({ name: 1 }).lean();
};

/**
 * Returns a single subject by its MongoDB ObjectId.
 * Throws 404 if not found.
 */
export const getSubjectById = async (id) => {
  const subject = await Subject.findById(id).lean();
  if (!subject) throw new AppError("Subject not found.", 404);
  return subject;
};

/**
 * Creates a new subject. Slug uniqueness is enforced by the schema index;
 * a duplicate-key error from MongoDB is surfaced as a 409 by the global
 * error handler.
 */
export const createSubject = async (data) => {
  const { name, slug, description, icon } = data;
  const subject = await Subject.create({ name, slug, description, icon });
  return subject;
};

/**
 * Updates an existing subject.
 * Only name, slug, description, icon, and isActive are updatable.
 */
export const updateSubject = async (id, data) => {
  const allowedFields = ["name", "slug", "description", "icon", "isActive"];
  const safeUpdate = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) safeUpdate[field] = data[field];
  }

  const subject = await Subject.findByIdAndUpdate(id, { $set: safeUpdate }, {
    new: true,
    runValidators: true,
  });
  if (!subject) throw new AppError("Subject not found.", 404);
  return subject;
};

/**
 * Soft-deletes a subject by marking it inactive.
 * Preferred over hard deletion because lessons may reference it later.
 */
export const deactivateSubject = async (id) => {
  const subject = await Subject.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true },
  );
  if (!subject) throw new AppError("Subject not found.", 404);
  return subject;
};
