import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as questionService from "../services/questionService.js";

/** GET /api/lessons/:lessonId/questions — student-safe (no answers) */
export const getQuestions = asyncHandler(async (req, res) => {
  const questions = await questionService.getQuestionsForLesson(req.params.lessonId);
  sendSuccess(res, { message: "Questions retrieved.", data: { questions } });
});

/** GET /api/lessons/:lessonId/questions/with-answers — teacher only */
export const getQuestionsWithAnswers = asyncHandler(async (req, res) => {
  const questions = await questionService.getQuestionsWithAnswers(
    req.params.lessonId,
    req.user._id,
  );
  sendSuccess(res, { message: "Questions retrieved.", data: { questions } });
});

/** POST /api/lessons/:lessonId/questions */
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(
    req.user._id,
    req.params.lessonId,
    req.body,
  );
  sendSuccess(res, { statusCode: 201, message: "Question created.", data: { question } });
});

/** PUT /api/questions/:id */
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.user._id, req.body);
  sendSuccess(res, { message: "Question updated.", data: { question } });
});

/** DELETE /api/questions/:id */
export const deleteQuestion = asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id, req.user._id);
  sendSuccess(res, { message: "Question deleted." });
});

/** PUT /api/lessons/:lessonId/questions/reorder */
export const reorderQuestions = asyncHandler(async (req, res) => {
  await questionService.reorderQuestions(req.user._id, req.params.lessonId, req.body.ordering);
  sendSuccess(res, { message: "Questions reordered." });
});
