import Question from "../models/Question.js";
import QuizResult from "../models/QuizResult.js";
import LessonProgress from "../models/LessonProgress.js";
import StudentProfile from "../models/StudentProfile.js";
import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";
import { awardXP, checkAndAwardBadges } from "./gamificationService.js";

const PASS_THRESHOLD_PERCENT = 50; // 50% to pass

/**
 * Grades a quiz submission entirely on the backend.
 * Correct answers are NEVER sent to the student before submission.
 * The frontend sends { lessonId, answers: [{ questionId, answer }] }.
 *
 * Returns the result with correct answers and explanations revealed.
 */
export const submitQuiz = async (userId, lessonId, answers) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.status !== "published")
    throw new AppError("This lesson is not available.", 400);

  // Load questions WITH correct answers — server side only
  const questions = await Question.find({ lesson: lessonId })
    .select("+correctAnswer")
    .lean();

  if (questions.length === 0)
    throw new AppError("This lesson has no questions yet.", 400);

  // Build answer map: questionId → student answer
  const answerMap = {};
  for (const a of answers) {
    answerMap[a.questionId] = (a.answer ?? "").toString().trim().toLowerCase();
  }

  let totalMarks = 0;
  let earnedMarks = 0;
  let correctCount = 0;
  const gradedQuestions = [];

  for (const q of questions) {
    const studentAnswer = answerMap[q._id.toString()] ?? "";
    const correct = q.correctAnswer.trim().toLowerCase();
    const isCorrect = studentAnswer === correct;

    totalMarks += q.marks;
    if (isCorrect) {
      earnedMarks += q.marks;
      correctCount++;
    }

    gradedQuestions.push({
      questionId: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      studentAnswer: answerMap[q._id.toString()] ?? null,
      correctAnswer: q.correctAnswer,   // revealed after submission
      explanation: q.explanation,
      isCorrect,
      marks: q.marks,
    });
  }

  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  const passed = percentage >= PASS_THRESHOLD_PERCENT;

  // Determine attempt number
  const attemptNumber = (await QuizResult.countDocuments({ user: userId, lesson: lessonId })) + 1;

  const result = await QuizResult.create({
    user: userId,
    lesson: lessonId,
    score: earnedMarks,
    percentage,
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    incorrectAnswers: questions.length - correctCount,
    passed,
    attemptNumber,
    completedAt: new Date(),
  });

  // Mark lesson as completed if quiz passed
  if (passed) {
    await LessonProgress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      { $set: { completed: true, completedAt: new Date(), progressPercentage: 100 } },
      { upsert: true },
    );
  }

  // Award XP and check badges (non-blocking)
  awardXP(userId, "quiz_completed", { percentage, passed }).catch((e) =>
    console.error("[quizService] XP award failed:", e.message),
  );
  checkAndAwardBadges(userId).catch((e) =>
    console.error("[quizService] Badge check failed:", e.message),
  );

  return {
    result,
    gradedQuestions,
    summary: {
      score: earnedMarks,
      totalMarks,
      percentage,
      passed,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      attemptNumber,
    },
  };
};

/** Returns a student's quiz results for a lesson. */
export const getMyResults = async (userId, lessonId) => {
  return QuizResult.find({ user: userId, lesson: lessonId })
    .sort({ completedAt: -1 })
    .lean();
};

/** Returns aggregated quiz analytics for a lesson (teacher view). */
export const getLessonQuizAnalytics = async (lessonId, teacherId) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString())
    throw new AppError("You do not have permission to view this lesson's analytics.", 403);

  const [stats] = await QuizResult.aggregate([
    { $match: { lesson: lesson._id } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        highestScore: { $max: "$percentage" },
        lowestScore: { $min: "$percentage" },
        passCount: { $sum: { $cond: ["$passed", 1, 0] } },
      },
    },
  ]);

  return stats
    ? {
        totalAttempts: stats.totalAttempts,
        averageScore: Math.round(stats.avgScore),
        highestScore: stats.highestScore,
        lowestScore: stats.lowestScore,
        passRate: Math.round((stats.passCount / stats.totalAttempts) * 100),
      }
    : { totalAttempts: 0, averageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0 };
};

/** Updates the student's average quiz score on their profile. */
export const refreshAverageQuizScore = async (userId) => {
  try {
    const [agg] = await QuizResult.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avg: { $avg: "$percentage" } } },
    ]);
    if (agg) {
      await StudentProfile.findOneAndUpdate(
        { user: userId },
        { $set: { averageQuizScore: Math.round(agg.avg), quizzesCompleted: await QuizResult.countDocuments({ user: userId, passed: true }) } },
      );
    }
  } catch (err) {
    console.error("[quizService] refreshAverageQuizScore failed:", err.message);
  }
};
