import StudentProfile from "../models/StudentProfile.js";
import Badge from "../models/Badge.js";

/**
 * XP awards per activity. Centralised here so changing values never
 * requires touching multiple files.
 */
const XP_REWARDS = {
  lesson_completed: 100,
  quiz_completed: 50,
  quiz_passed: 50,       // bonus on top of quiz_completed
  streak_continued: 20,
};

/**
 * Level thresholds — XP required to reach each level.
 * Level 1 = 0 XP, Level 2 = 200 XP, Level 3 = 500 XP, etc.
 * Stored as a sorted array of [level, minXP] pairs.
 */
const LEVEL_THRESHOLDS = [
  [1, 0],
  [2, 200],
  [3, 500],
  [4, 1000],
  [5, 1800],
  [6, 3000],
  [7, 4500],
  [8, 6500],
  [9, 9000],
  [10, 12000],
];

/** Calculates the level for a given XP total. */
export const calculateLevel = (xp) => {
  let level = 1;
  for (const [lvl, minXP] of LEVEL_THRESHOLDS) {
    if (xp >= minXP) level = lvl;
    else break;
  }
  return level;
};

/**
 * Awards XP to a student for a specific activity.
 * Updates totalXP and currentLevel on their profile.
 * Anti-cheat: XP is only set by the server; clients cannot submit XP values.
 *
 * @param {string} userId
 * @param {"lesson_completed"|"quiz_completed"|"quiz_passed"|"streak_continued"} activity
 * @param {Object} context - additional context (e.g. { percentage, passed })
 */
export const awardXP = async (userId, activity, context = {}) => {
  let xpToAdd = XP_REWARDS[activity] ?? 0;

  // Bonus XP for passing a quiz — added on top of quiz_completed base
  if (activity === "quiz_completed" && context.passed) {
    xpToAdd += XP_REWARDS.quiz_passed ?? 0;
  }

  if (xpToAdd <= 0) return;

  const profile = await StudentProfile.findOne({ user: userId });
  if (!profile) return;

  const newXP = (profile.totalXP || 0) + xpToAdd;
  const newLevel = calculateLevel(newXP);

  await StudentProfile.findOneAndUpdate(
    { user: userId },
    { $set: { totalXP: newXP, currentLevel: newLevel } },
  );
};

/**
 * Checks whether the student has earned any new badges and awards them.
 * Idempotent — already-earned badges are never re-awarded.
 * Called after significant events (lesson complete, quiz submit, streak update).
 */
export const checkAndAwardBadges = async (userId) => {
  const profile = await StudentProfile.findOne({ user: userId })
    .populate("earnedBadges.badge")
    .lean();
  if (!profile) return;

  const activeBadges = await Badge.find({ isActive: true }).lean();
  const alreadyEarnedKeys = new Set(
    profile.earnedBadges.map((eb) => eb.badge?.key).filter(Boolean),
  );

  const newBadges = [];

  for (const badge of activeBadges) {
    if (alreadyEarnedKeys.has(badge.key)) continue;

    let earned = false;
    switch (badge.requirementType) {
      case "lessons_completed":
        earned = profile.lessonsCompleted >= badge.requirementValue;
        break;
      case "quizzes_completed":
        earned = profile.quizzesCompleted >= badge.requirementValue;
        break;
      case "streak_days":
        earned = profile.studyStreak >= badge.requirementValue;
        break;
      case "xp_reached":
        earned = profile.totalXP >= badge.requirementValue;
        break;
      case "perfect_score":
        // requirementValue = minimum score percentage (e.g. 100 = perfect)
        earned = profile.averageQuizScore >= badge.requirementValue;
        break;
      default:
        break;
    }

    if (earned) {
      newBadges.push({ badge: badge._id, earnedAt: new Date() });
      // Also award the badge's XP bonus
      if (badge.xpReward > 0) {
        await StudentProfile.findOneAndUpdate(
          { user: userId },
          { $inc: { totalXP: badge.xpReward } },
        );
      }
    }
  }

  if (newBadges.length > 0) {
    await StudentProfile.findOneAndUpdate(
      { user: userId },
      { $push: { earnedBadges: { $each: newBadges } } },
    );
  }
};

/**
 * Returns the global leaderboard — top students by XP.
 * Uses lean() for performance since this is read-only.
 * Excludes private information (email, school, etc.).
 */
export const getLeaderboard = async ({ page = 1, limit = 20, classId } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // If classId provided, scope to that class via enrollments
  let userIds = null;
  if (classId) {
    const { default: Enrollment } = await import("../models/Enrollment.js");
    const enrollments = await Enrollment.find({ class: classId, status: "active" })
      .select("student")
      .lean();
    userIds = enrollments.map((e) => e.student);
  }

  const filter = {};
  if (userIds) filter.user = { $in: userIds };

  const [profiles, total] = await Promise.all([
    StudentProfile.find(filter)
      .populate("user", "fullName profileImage")
      .select("user totalXP currentLevel studyStreak earnedBadges lessonsCompleted")
      .sort({ totalXP: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    StudentProfile.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  // Add rank number based on position in sorted result
  const entries = profiles.map((p, idx) => ({
    rank: skip + idx + 1,
    user: p.user,
    totalXP: p.totalXP,
    currentLevel: p.currentLevel,
    studyStreak: p.studyStreak,
    lessonsCompleted: p.lessonsCompleted,
    badgeCount: p.earnedBadges?.length ?? 0,
  }));

  return {
    entries,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};
