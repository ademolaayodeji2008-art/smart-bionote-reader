import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as classService from "../services/classService.js";

/**
 * @route   POST /api/classes
 * @access  Authenticated teacher
 */
export const createClass = asyncHandler(async (req, res) => {
  const cls = await classService.createClass(req.user._id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Class created successfully.", data: { class: cls } });
});

/**
 * @route   GET /api/classes/my-classes
 * @access  Authenticated teacher
 */
export const getMyClasses = asyncHandler(async (req, res) => {
  const classes = await classService.getClassesByTeacher(req.user._id);
  sendSuccess(res, { message: "Classes retrieved successfully.", data: { classes } });
});

/**
 * @route   GET /api/classes/:id
 * @access  Authenticated teacher (own classes) — expanded later for students
 */
export const getClassById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id);
  sendSuccess(res, { message: "Class retrieved successfully.", data: { class: cls } });
});

/**
 * @route   PUT /api/classes/:id
 * @access  Authenticated teacher (must own the class)
 */
export const updateClass = asyncHandler(async (req, res) => {
  const cls = await classService.updateClass(req.params.id, req.user._id, req.body);
  sendSuccess(res, { message: "Class updated successfully.", data: { class: cls } });
});
