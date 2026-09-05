import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as studentService from "../services/studentService.js";

/**
 * @route   GET /api/students/profile
 * @access  Authenticated student (own profile only)
 */
export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getProfileByUserId(req.user._id);
  sendSuccess(res, { message: "Profile retrieved successfully.", data: { profile } });
});

/**
 * @route   PUT /api/students/profile
 * @access  Authenticated student (own profile only)
 * Only whitelisted fields may be updated — statistics are server-controlled.
 */
export const updateStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.updateProfileByUserId(req.user._id, req.body);
  sendSuccess(res, { message: "Profile updated successfully.", data: { profile } });
});
