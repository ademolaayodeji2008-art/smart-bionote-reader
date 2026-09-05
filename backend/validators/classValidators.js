import { body } from "express-validator";
import mongoose from "mongoose";

const subjectsArray = body("subjects")
  .optional()
  .isArray()
  .withMessage("Subjects must be an array.")
  .custom((ids) => {
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      throw new Error("Each subject must be a valid subject ID.");
    }
    return true;
  });

export const createClassValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Class name is required.")
    .isLength({ max: 150 })
    .withMessage("Class name cannot exceed 150 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("schoolName")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("School name cannot exceed 200 characters."),

  body("classLevel")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Class level cannot exceed 50 characters."),

  body("academicSession")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Academic session cannot exceed 20 characters."),

  subjectsArray,
];

export const updateClassValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Class name cannot exceed 150 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("schoolName")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("School name cannot exceed 200 characters."),

  body("classLevel")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Class level cannot exceed 50 characters."),

  body("academicSession")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Academic session cannot exceed 20 characters."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean."),

  subjectsArray,
];
