import { body } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const createLessonValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Lesson title is required.")
    .isLength({ max: 300 })
    .withMessage("Title cannot exceed 300 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Lesson type is required.")
    .isIn(["note", "drawing"])
    .withMessage("Lesson type must be note or drawing."),

  body("subjectId")
    .notEmpty()
    .withMessage("Subject is required.")
    .custom(isValidObjectId)
    .withMessage("Subject must be a valid ID."),

  body("classId")
    .optional({ nullable: true })
    .custom((v) => !v || isValidObjectId(v))
    .withMessage("Class must be a valid ID."),

  body("content")
    .optional()
    .trim()
    .isLength({ max: 100000 })
    .withMessage("Content is too long."),

  body("drawingSteps")
    .optional()
    .isArray()
    .withMessage("Drawing steps must be an array."),

  body("drawingSteps.*.title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Step title cannot exceed 200 characters."),

  body("drawingSteps.*.description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Step description cannot exceed 2000 characters."),
];

export const updateLessonValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Title cannot exceed 300 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),

  body("subjectId")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Subject must be a valid ID."),

  body("classId")
    .optional({ nullable: true })
    .custom((v) => !v || isValidObjectId(v))
    .withMessage("Class must be a valid ID."),

  body("content")
    .optional()
    .trim()
    .isLength({ max: 100000 })
    .withMessage("Content is too long."),

  body("visibility")
    .optional()
    .isIn(["private", "class", "public"])
    .withMessage("Visibility must be private, class, or public."),

  body("drawingSteps")
    .optional()
    .isArray()
    .withMessage("Drawing steps must be an array."),

  // Explicitly block status from being changed via the update endpoint
  // (use /publish and /archive dedicated endpoints instead)
  body("status")
    .not()
    .exists()
    .withMessage("Use the /publish or /archive endpoints to change lesson status."),

  // Teacher cannot set their own teacher field
  body("teacher")
    .not()
    .exists()
    .withMessage("Teacher cannot be changed."),
];
