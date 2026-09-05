import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as quizService from "../services/quizService.js";

/** POST /api/lessons/:lessonId/quiz/submit */
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const result = await quizService.submitQuiz(
    req.user._id,
    req.params.lessonId,
    answers ?? [],
  );
  sendSuccess(res, { message: "Quiz submitted.", data: result });
});

/** GET /api/lessons/:lessonId/quiz/my-results */
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await quizService.getMyResults(req.user._id, req.params.lessonId);
  sendSuccess(res, { message: "Results retrieved.", data: { results } });
});

/** GET /api/lessons/:lessonId/quiz/analytics — teacher only */
export const getLessonQuizAnalytics = asyncHandler(async (req, res) => {
  const analytics = await quizService.getLessonQuizAnalytics(
    req.params.lessonId,
    req.user._id,
  );
  sendSuccess(res, { message: "Analytics retrieved.", data: { analytics } });
});
