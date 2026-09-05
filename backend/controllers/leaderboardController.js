import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { getLeaderboard } from "../services/gamificationService.js";
import StudentProfile from "../models/StudentProfile.js";

/** GET /api/leaderboard — global, paginated */
export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const result = await getLeaderboard({ page: req.query.page, limit: req.query.limit });
  sendSuccess(res, { message: "Leaderboard retrieved.", data: result });
});

/** GET /api/leaderboard/class/:classId */
export const getClassLeaderboard = asyncHandler(async (req, res) => {
  const result = await getLeaderboard({
    page: req.query.page,
    limit: req.query.limit,
    classId: req.params.classId,
  });
  sendSuccess(res, { message: "Class leaderboard retrieved.", data: result });
});

/** GET /api/leaderboard/me — returns the student's own rank and stats */
export const getMyRank = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id })
    .select("totalXP currentLevel studyStreak earnedBadges lessonsCompleted leaderboardRank")
    .populate("earnedBadges.badge", "name icon key")
    .lean();

  if (!profile) {
    return sendSuccess(res, { message: "Profile not found.", data: null });
  }

  // Calculate rank by counting profiles with more XP
  const rank = (await StudentProfile.countDocuments({ totalXP: { $gt: profile.totalXP } })) + 1;

  sendSuccess(res, {
    message: "Rank retrieved.",
    data: {
      rank,
      totalXP: profile.totalXP,
      currentLevel: profile.currentLevel,
      studyStreak: profile.studyStreak,
      lessonsCompleted: profile.lessonsCompleted,
      earnedBadges: profile.earnedBadges,
    },
  });
});
