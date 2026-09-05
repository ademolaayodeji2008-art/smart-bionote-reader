import User from "../models/User.js";
import TeacherProfile from "../models/TeacherProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import Lesson from "../models/Lesson.js";
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import Question from "../models/Question.js";
import QuizResult from "../models/QuizResult.js";
import Enrollment from "../models/Enrollment.js";
import AuditLog from "../models/AuditLog.js";
import { AppError } from "../utils/AppError.js";

// ── Audit logging ─────────────────────────────────────────────────────────────

export const logAction = async (adminId, action, targetType, targetId, metadata = null) => {
  try {
    await AuditLog.create({ admin: adminId, action, targetType, targetId, metadata });
  } catch (err) {
    // Audit failure must never block the main operation
    console.error("[adminService] Audit log failed:", err.message);
  }
};

// ── Platform statistics ───────────────────────────────────────────────────────

export const getPlatformStats = async () => {
  const [
    totalUsers, totalStudents, totalTeachers,
    publishedLessons, draftLessons, archivedLessons,
    noteLesson, drawingLesson,
    totalQuestions, totalQuizAttempts, totalClasses,
    pendingTeachers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Lesson.countDocuments({ status: "published" }),
    Lesson.countDocuments({ status: "draft" }),
    Lesson.countDocuments({ status: "archived" }),
    Lesson.countDocuments({ type: "note" }),
    Lesson.countDocuments({ type: "drawing" }),
    Question.countDocuments(),
    QuizResult.countDocuments(),
    Class.countDocuments({ isActive: true }),
    TeacherProfile.countDocuments({ isApproved: false }),
  ]);

  return {
    users: { total: totalUsers, students: totalStudents, teachers: totalTeachers },
    lessons: {
      published: publishedLessons,
      draft: draftLessons,
      archived: archivedLessons,
      note: noteLesson,
      drawing: drawingLesson,
    },
    content: { questions: totalQuestions, quizAttempts: totalQuizAttempts },
    classes: { active: totalClasses },
    pending: { teacherApprovals: pendingTeachers },
  };
};

// ── User management ───────────────────────────────────────────────────────────

export const getUsers = async ({ page = 1, limit = 20, role, search, status }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (search) filter.$or = [
    { fullName: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -passwordChangedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  return { users, pagination: { currentPage: pageNum, totalPages, totalItems: total, hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1 } };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -passwordChangedAt")
    .lean();
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

export const setUserActiveStatus = async (adminId, userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404);
  if (user.role === "admin") throw new AppError("Admin accounts cannot be modified.", 403);

  user.isActive = isActive;
  await user.save();

  await logAction(adminId, isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER", "User", userId, { email: user.email });
  return user;
};

// ── Teacher approval ──────────────────────────────────────────────────────────

export const getPendingTeachers = async () => {
  const profiles = await TeacherProfile.find({ isApproved: false })
    .populate("user", "fullName email createdAt isActive")
    .lean();
  return profiles;
};

export const setTeacherApproval = async (adminId, teacherProfileId, isApproved) => {
  const profile = await TeacherProfile.findById(teacherProfileId);
  if (!profile) throw new AppError("Teacher profile not found.", 404);

  profile.isApproved = isApproved;
  await profile.save();

  await logAction(
    adminId,
    isApproved ? "APPROVE_TEACHER" : "REJECT_TEACHER",
    "TeacherProfile",
    teacherProfileId,
    { userId: profile.user },
  );
  return profile;
};

// ── Lesson moderation ─────────────────────────────────────────────────────────

export const getAdminLessons = async ({ page = 1, limit = 20, status, type, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (search) filter.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("subject", "name slug")
      .populate("teacher", "fullName email")
      .select("-content -drawingSteps -questions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lesson.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  return { lessons, pagination: { currentPage: pageNum, totalPages, totalItems: total, hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1 } };
};

export const adminArchiveLesson = async (adminId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError("Lesson not found.", 404);
  lesson.status = "archived";
  await lesson.save();
  await logAction(adminId, "ARCHIVE_LESSON", "Lesson", lessonId, { title: lesson.title });
  return lesson;
};

// ── Subject management (admin creates/updates/deactivates) ────────────────────

export const adminCreateSubject = async (adminId, data) => {
  const subject = await Subject.create(data);
  await logAction(adminId, "CREATE_SUBJECT", "Subject", subject._id, { name: subject.name });
  return subject;
};

export const adminUpdateSubject = async (adminId, subjectId, data) => {
  const allowed = ["name", "slug", "description", "icon", "isActive"];
  const safeUpdate = {};
  for (const f of allowed) { if (data[f] !== undefined) safeUpdate[f] = data[f]; }

  const subject = await Subject.findByIdAndUpdate(subjectId, { $set: safeUpdate }, { new: true, runValidators: true });
  if (!subject) throw new AppError("Subject not found.", 404);
  await logAction(adminId, "UPDATE_SUBJECT", "Subject", subjectId, safeUpdate);
  return subject;
};

// ── Class overview ────────────────────────────────────────────────────────────

export const getAdminClasses = async ({ page = 1, limit = 20, search }) => {
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [classes, total] = await Promise.all([
    Class.find(filter)
      .populate("teacher", "fullName email")
      .populate("subjects", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Class.countDocuments(filter),
  ]);

  // Attach enrollment counts
  const classIds = classes.map((c) => c._id);
  const enrollmentCounts = await Enrollment.aggregate([
    { $match: { class: { $in: classIds }, status: "active" } },
    { $group: { _id: "$class", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(enrollmentCounts.map((e) => [e._id.toString(), e.count]));
  const classesWithCounts = classes.map((c) => ({ ...c, enrollmentCount: countMap[c._id.toString()] ?? 0 }));

  const totalPages = Math.ceil(total / limitNum);
  return { classes: classesWithCounts, pagination: { currentPage: pageNum, totalPages, totalItems: total, hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1 } };
};

// ── Audit log retrieval ───────────────────────────────────────────────────────

export const getAuditLogs = async ({ page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate("admin", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditLog.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  return { logs, pagination: { currentPage: pageNum, totalPages, totalItems: total, hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1 } };
};
