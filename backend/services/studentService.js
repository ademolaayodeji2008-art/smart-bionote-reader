import StudentProfile from "../models/StudentProfile.js";
import { AppError } from "../utils/AppError.js";

/**
 * Fields a student is allowed to update on their own profile.
 * Statistics (XP, streaks, scores, etc.) are intentionally excluded —
 * those are only ever written by server-side learning logic.
 */
const STUDENT_EDITABLE_FIELDS = [
  "schoolName",
  "classLevel",
  "department",
  "bio",
  "dateOfBirth",
  "learningGoals",
  "favoriteSubjects",
];

/**
 * Retrieves the profile for the given user ID.
 * Populates favoriteSubjects with name + slug for display.
 * Throws a 404 if no profile exists yet (shouldn't happen in normal flow,
 * but guards against edge cases where profile creation failed silently).
 */
export const getProfileByUserId = async (userId) => {
  const profile = await StudentProfile.findOne({ user: userId })
    .populate("favoriteSubjects", "name slug icon")
    .lean();

  if (!profile) {
    throw new AppError("Student profile not found.", 404);
  }

  return profile;
};

/**
 * Updates only the whitelisted fields from the provided data object.
 * Ignores any keys that are not in STUDENT_EDITABLE_FIELDS, so arbitrary
 * req.body content cannot overwrite protected statistics.
 *
 * Returns the updated profile document.
 */
export const updateProfileByUserId = async (userId, data) => {
  const safeUpdate = {};
  for (const field of STUDENT_EDITABLE_FIELDS) {
    if (data[field] !== undefined) {
      safeUpdate[field] = data[field];
    }
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { user: userId },
    { $set: safeUpdate },
    { new: true, runValidators: true },
  )
    .populate("favoriteSubjects", "name slug icon")
    .lean();

  if (!profile) {
    throw new AppError("Student profile not found.", 404);
  }

  return profile;
};
