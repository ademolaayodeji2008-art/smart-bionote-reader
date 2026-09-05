import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as teacherService from "../services/teacherService.js";

/**
 * @route   GET /api/teachers/profile
 * @access  Authenticated teacher (own profile only)
 */
export const getTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await teacherService.getProfileByUserId(req.user._id);
  sendSuccess(res, { message: "Profile retrieved successfully.", data: { profile } });
});

/**
 * @route   PUT /api/teachers/profile
 * @access  Authenticated teacher (own profile only)
 * isApproved is never writable here — that is admin-only.
 */
export const updateTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await teacherService.updateProfileByUserId(req.user._id, req.body);
  sendSuccess(res, { message: "Profile updated successfully.", data: { profile } });
});
