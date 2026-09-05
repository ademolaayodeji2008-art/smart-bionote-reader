import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as adminService from "../services/adminService.js";

export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  sendSuccess(res, { message: "Stats retrieved.", data: { stats } });
});

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  sendSuccess(res, { message: "Users retrieved.", data: result });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  sendSuccess(res, { message: "User retrieved.", data: { user } });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await adminService.setUserActiveStatus(req.user._id, req.params.id, true);
  sendSuccess(res, { message: "User activated.", data: { user } });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await adminService.setUserActiveStatus(req.user._id, req.params.id, false);
  sendSuccess(res, { message: "User deactivated.", data: { user } });
});

// ── Teacher approval ──────────────────────────────────────────────────────────

export const getPendingTeachers = asyncHandler(async (req, res) => {
  const teachers = await adminService.getPendingTeachers();
  sendSuccess(res, { message: "Pending teachers retrieved.", data: { teachers } });
});

export const approveTeacher = asyncHandler(async (req, res) => {
  const profile = await adminService.setTeacherApproval(req.user._id, req.params.profileId, true);
  sendSuccess(res, { message: "Teacher approved.", data: { profile } });
});

export const rejectTeacher = asyncHandler(async (req, res) => {
  const profile = await adminService.setTeacherApproval(req.user._id, req.params.profileId, false);
  sendSuccess(res, { message: "Teacher approval revoked.", data: { profile } });
});

// ── Lessons ───────────────────────────────────────────────────────────────────

export const getAdminLessons = asyncHandler(async (req, res) => {
  const result = await adminService.getAdminLessons(req.query);
  sendSuccess(res, { message: "Lessons retrieved.", data: result });
});

export const adminArchiveLesson = asyncHandler(async (req, res) => {
  const lesson = await adminService.adminArchiveLesson(req.user._id, req.params.id);
  sendSuccess(res, { message: "Lesson archived.", data: { lesson } });
});

// ── Subjects ──────────────────────────────────────────────────────────────────

export const adminCreateSubject = asyncHandler(async (req, res) => {
  const subject = await adminService.adminCreateSubject(req.user._id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Subject created.", data: { subject } });
});

export const adminUpdateSubject = asyncHandler(async (req, res) => {
  const subject = await adminService.adminUpdateSubject(req.user._id, req.params.id, req.body);
  sendSuccess(res, { message: "Subject updated.", data: { subject } });
});

// ── Classes ───────────────────────────────────────────────────────────────────

export const getAdminClasses = asyncHandler(async (req, res) => {
  const result = await adminService.getAdminClasses(req.query);
  sendSuccess(res, { message: "Classes retrieved.", data: result });
});

// ── Audit logs ────────────────────────────────────────────────────────────────

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  sendSuccess(res, { message: "Audit logs retrieved.", data: result });
});
