import { body } from "express-validator";

export const createSubjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required.")
    .isLength({ max: 100 })
    .withMessage("Subject name cannot exceed 100 characters."),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Subject slug is required.")
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers, and hyphens."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name cannot exceed 50 characters."),
];

export const updateSubjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Subject name cannot exceed 100 characters."),

  body("slug")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers, and hyphens."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name cannot exceed 50 characters."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
];
