import { Router } from "express";
import {
  getQuestions,
  getQuestionsWithAnswers,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router({ mergeParams: true }); // mergeParams to get :lessonId from parent
router.use(protect);

// Student + teacher: get questions (no answers)
router.get("/", validateObjectId("lessonId"), getQuestions);

// Teacher only
router.get("/with-answers", requireRole("teacher"), validateObjectId("lessonId"), getQuestionsWithAnswers);
router.post("/", requireRole("teacher"), validateObjectId("lessonId"), createQuestion);
router.put("/reorder", requireRole("teacher"), validateObjectId("lessonId"), reorderQuestions);
router.put("/:id", requireRole("teacher"), validateObjectId("id"), updateQuestion);
router.delete("/:id", requireRole("teacher"), validateObjectId("id"), deleteQuestion);

export default router;
