import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as enrollmentService from "../services/enrollmentService.js";

/**
 * @route   GET /api/enrollments/my-enrollments
 * @access  Authenticated student
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getEnrollmentsByStudent(req.user._id);
  sendSuccess(res, { message: "Enrollments retrieved successfully.", data: { enrollments } });
});

/**
 * @route   GET /api/enrollments/class/:classId
 * @access  Authenticated teacher (must own the class)
 */
export const getClassEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getEnrollmentsByClass(req.params.classId, req.user._id);
  sendSuccess(res, { message: "Enrollments retrieved successfully.", data: { enrollments } });
});
