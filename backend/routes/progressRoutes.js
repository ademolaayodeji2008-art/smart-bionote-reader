import { Router } from "express";
import { updateProgress, getProgressForLesson, getAllProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();
router.use(protect, requireRole("student"));

router.get("/", getAllProgress);
router.get("/:lessonId", validateObjectId("lessonId"), getProgressForLesson);
router.put("/:lessonId", validateObjectId("lessonId"), updateProgress);

export default router;
