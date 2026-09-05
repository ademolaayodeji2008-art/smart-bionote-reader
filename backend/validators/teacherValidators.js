import { body } from "express-validator";
import mongoose from "mongoose";

export const updateTeacherProfileValidator = [
  body("schoolName")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("School name cannot exceed 200 characters."),

  body("qualification")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Qualification cannot exceed 200 characters."),

  body("specialization")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Specialization cannot exceed 200 characters."),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio cannot exceed 1000 characters."),

  body("yearsOfExperience")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 60 })
    .withMessage("Years of experience must be between 0 and 60."),

  body("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array.")
    .custom((ids) => {
      if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Each subject must be a valid subject ID.");
      }
      return true;
    }),

  // Explicitly reject admin-controlled field
  body("isApproved")
    .not()
    .exists()
    .withMessage("Approval status cannot be modified directly."),

  // Explicitly reject privilege-escalation fields
  body(["role", "isActive", "isEmailVerified", "googleId", "password", "email"])
    .not()
    .exists()
    .withMessage("This field cannot be changed through the profile endpoint."),
];
