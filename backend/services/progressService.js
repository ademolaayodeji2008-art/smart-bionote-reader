import LessonProgress from "../models/LessonProgress.js";
import StudentProfile from "../models/StudentProfile.js";
import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";

/**
 * Upserts a progress record for the given student + lesson.
 * Also triggers streak/study-time updates on StudentProfile.
 * Called on a throttled basis from the frontend — not on every word.
 */
export const upsertProgress = async (userId, lessonId, { progressPercentage, lastPosition }) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.status !== "published")
    throw new AppError("Progress can only be tracked for published lessons.", 400);

  const now = new Date();
  const wasCompleted = progressPercentage >= 100;

  const update = {
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    lastPosition: lastPosition ?? 0,
    lastAccessedAt: now,
    ...(wasCompleted && { completed: true, completedAt: now }),
  };

  const progress = await LessonProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    { $set: update },
    { upsert: true, new: true, runValidators: true },
  ).lean();

  // Update streak and study counters on StudentProfile (server-controlled)
  await updateStudyStreak(userId, now, wasCompleted && !progress.completed);

  return progress;
};

/** Retrieves progress for the authenticated student on a specific lesson. */
export const getProgressForLesson = async (userId, lessonId) => {
  return LessonProgress.findOne({ user: userId, lesson: lessonId }).lean();
};

/** Retrieves all progress records for the authenticated student. */
export const getAllProgress = async (userId) => {
  return LessonProgress.find({ user: userId })
    .populate({
      path: "lesson",
      select: "title type subject coverImage",
      populate: { path: "subject", select: "name slug" },
    })
    .sort({ lastAccessedAt: -1 })
    .lean();
};

/**
 * Updates the study streak on StudentProfile.
 * A "study day" is a calendar day (in UTC). The streak increments when
 * the student studies on a day they haven't studied on yet.
 * Called server-side only — never trusted from the client.
 */
const updateStudyStreak = async (userId, now, justCompleted) => {
  try {
    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) return;

    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const lastStudy = profile.lastStudyDate
      ? new Date(Date.UTC(
          profile.lastStudyDate.getUTCFullYear(),
          profile.lastStudyDate.getUTCMonth(),
          profile.lastStudyDate.getUTCDate(),
        ))
      : null;

    const alreadyStudiedToday = lastStudy && lastStudy.getTime() === todayUTC.getTime();
    if (alreadyStudiedToday) return; // already counted today

    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const continuedStreak = lastStudy && lastStudy.getTime() === yesterdayUTC.getTime();

    const newStreak = continuedStreak ? profile.studyStreak + 1 : 1;
    const newLongest = Math.max(newStreak, profile.longestStudyStreak);

    const profileUpdate = {
      lastStudyDate: todayUTC,
      studyStreak: newStreak,
      longestStudyStreak: newLongest,
    };

    if (justCompleted) {
      profileUpdate.lessonsCompleted = (profile.lessonsCompleted || 0) + 1;
    }

    await StudentProfile.findOneAndUpdate({ user: userId }, { $set: profileUpdate });
  } catch (err) {
    // Non-critical — streak update failure must not block the progress save
    console.error("[progressService] Streak update failed:", err.message);
  }
};
