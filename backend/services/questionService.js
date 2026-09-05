import Question from "../models/Question.js";
import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";

/** Verifies lesson exists and the requesting teacher owns it. */
const assertTeacherOwnsLesson = async (lessonId, teacherId) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError("Lesson not found.", 404);
  if (lesson.teacher.toString() !== teacherId.toString())
    throw new AppError("You do not have permission to manage questions for this lesson.", 403);
  return lesson;
};

/** Returns all questions for a lesson — WITHOUT correctAnswer (student-safe). */
export const getQuestionsForLesson = async (lessonId) => {
  return Question.find({ lesson: lessonId })
    .select("-correctAnswer")
    .sort({ order: 1, createdAt: 1 })
    .lean();
};

/** Returns all questions WITH correctAnswer — teacher/admin only. */
export const getQuestionsWithAnswers = async (lessonId, teacherId) => {
  await assertTeacherOwnsLesson(lessonId, teacherId);
  return Question.find({ lesson: lessonId })
    .select("+correctAnswer")
    .sort({ order: 1, createdAt: 1 })
    .lean();
};

/** Creates a new question for a lesson. Teacher must own the lesson. */
export const createQuestion = async (teacherId, lessonId, data) => {
  await assertTeacherOwnsLesson(lessonId, teacherId);
  const { questionText, type, options, correctAnswer, explanation, marks, order } = data;
  return Question.create({
    lesson: lessonId,
    questionText,
    type,
    options: options || [],
    correctAnswer,
    explanation: explanation || null,
    marks: marks ?? 1,
    order: order ?? 0,
  });
};

/** Updates a question. Teacher must own the parent lesson. */
export const updateQuestion = async (questionId, teacherId, data) => {
  const question = await Question.findById(questionId).lean();
  if (!question) throw new AppError("Question not found.", 404);
  await assertTeacherOwnsLesson(question.lesson, teacherId);

  const ALLOWED = ["questionText", "type", "options", "correctAnswer", "explanation", "marks", "order"];
  const safeUpdate = {};
  for (const field of ALLOWED) {
    if (data[field] !== undefined) safeUpdate[field] = data[field];
  }

  return Question.findByIdAndUpdate(questionId, { $set: safeUpdate }, {
    new: true, runValidators: true,
  });
};

/** Deletes a question. Teacher must own the parent lesson. */
export const deleteQuestion = async (questionId, teacherId) => {
  const question = await Question.findById(questionId).lean();
  if (!question) throw new AppError("Question not found.", 404);
  await assertTeacherOwnsLesson(question.lesson, teacherId);
  await Question.findByIdAndDelete(questionId);
};

/** Reorders questions by accepting an array of { id, order } pairs. */
export const reorderQuestions = async (teacherId, lessonId, ordering) => {
  await assertTeacherOwnsLesson(lessonId, teacherId);
  const ops = ordering.map(({ id, order }) =>
    Question.findByIdAndUpdate(id, { $set: { order } }),
  );
  await Promise.all(ops);
};
