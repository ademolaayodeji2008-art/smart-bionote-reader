import { Router } from "express";
import { submitQuiz, getMyResults, getLessonQuizAnalytics } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { quizSubmitLimiter } from "../middleware/rateLimiters.js";

const router = Router({ mergeParams: true });
router.use(protect);

router.post("/submit", requireRole("student"), validateObjectId("lessonId"), quizSubmitLimiter, submitQuiz);
router.get("/my-results", requireRole("student"), validateObjectId("lessonId"), getMyResults);

// Teacher: analytics for their lesson
router.get("/analytics", requireRole("teacher"), validateObjectId("lessonId"), getLessonQuizAnalytics);

export default router;
