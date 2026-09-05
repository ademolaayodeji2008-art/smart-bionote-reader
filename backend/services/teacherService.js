import TeacherProfile from "../models/TeacherProfile.js";
import { AppError } from "../utils/AppError.js";

/**
 * Fields a teacher is allowed to update on their own profile.
 * isApproved is intentionally excluded — only admins may change it.
 */
const TEACHER_EDITABLE_FIELDS = [
  "schoolName",
  "qualification",
  "specialization",
  "bio",
  "yearsOfExperience",
  "subjects",
];

/**
 * Retrieves the profile for the given user ID.
 * Populates subjects with name + slug for display.
 */
export const getProfileByUserId = async (userId) => {
  const profile = await TeacherProfile.findOne({ user: userId })
    .populate("subjects", "name slug icon")
    .lean();

  if (!profile) {
    throw new AppError("Teacher profile not found.", 404);
  }

  return profile;
};

/**
 * Updates only the whitelisted fields.
 * isApproved cannot be set this way — it is strictly admin-controlled.
 *
 * Returns the updated profile document.
 */
export const updateProfileByUserId = async (userId, data) => {
  const safeUpdate = {};
  for (const field of TEACHER_EDITABLE_FIELDS) {
    if (data[field] !== undefined) {
      safeUpdate[field] = data[field];
    }
  }

  const profile = await TeacherProfile.findOneAndUpdate(
    { user: userId },
    { $set: safeUpdate },
    { new: true, runValidators: true },
  )
    .populate("subjects", "name slug icon")
    .lean();

  if (!profile) {
    throw new AppError("Teacher profile not found.", 404);
  }

  return profile;
};
