import { body } from "express-validator";
import mongoose from "mongoose";

export const updateStudentProfileValidator = [
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

  body("department")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Department cannot exceed 100 characters."),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters."),

  body("dateOfBirth")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date (YYYY-MM-DD)."),

  body("learningGoals")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Learning goals cannot exceed 500 characters."),

  body("favoriteSubjects")
    .optional()
    .isArray()
    .withMessage("Favorite subjects must be an array.")
    .custom((ids) => {
      if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Each favorite subject must be a valid subject ID.");
      }
      return true;
    }),

  // Explicitly reject protected statistics fields
  body(["totalXP", "currentLevel", "studyStreak", "longestStudyStreak", "totalStudyTime", "lessonsCompleted", "quizzesCompleted", "averageQuizScore"])
    .not()
    .exists()
    .withMessage("This field cannot be updated directly."),

  // Explicitly reject privilege-escalation fields
  body(["role", "isActive", "isEmailVerified", "googleId", "password", "email"])
    .not()
    .exists()
    .withMessage("This field cannot be changed through the profile endpoint."),
];
