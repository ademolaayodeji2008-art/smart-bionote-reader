import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as subjectService from "../services/subjectService.js";

/**
 * @route   GET /api/subjects
 * @access  Any authenticated user
 */
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await subjectService.getAllSubjects();
  sendSuccess(res, { message: "Subjects retrieved successfully.", data: { subjects } });
});

/**
 * @route   GET /api/subjects/:id
 * @access  Any authenticated user
 */
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  sendSuccess(res, { message: "Subject retrieved successfully.", data: { subject } });
});

/**
 * @route   POST /api/subjects
 * @access  Admin only
 */
export const createSubject = asyncHandler(async (req, res) => {
  const subject = await subjectService.createSubject(req.body);
  sendSuccess(res, { statusCode: 201, message: "Subject created successfully.", data: { subject } });
});

/**
 * @route   PUT /api/subjects/:id
 * @access  Admin only
 */
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body);
  sendSuccess(res, { message: "Subject updated successfully.", data: { subject } });
});

/**
 * @route   DELETE /api/subjects/:id
 * @access  Admin only
 * Soft-deletes (deactivates) the subject rather than permanently removing it,
 * since lessons may reference it later.
 */
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await subjectService.deactivateSubject(req.params.id);
  sendSuccess(res, { message: "Subject deactivated successfully.", data: { subject } });
});
