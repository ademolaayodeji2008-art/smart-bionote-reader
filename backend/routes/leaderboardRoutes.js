import { Router } from "express";
import { getGlobalLeaderboard, getClassLeaderboard, getMyRank } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();
router.use(protect);

router.get("/", getGlobalLeaderboard);
router.get("/me", getMyRank);
router.get("/class/:classId", validateObjectId("classId"), getClassLeaderboard);

export default router;
