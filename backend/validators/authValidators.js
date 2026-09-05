import { body, query } from "express-validator";

// At least 8 characters, one uppercase, one lowercase, one number.
// Intentionally does not require a special character per product spec.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const passwordField = (field = "password") =>
  body(field)
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
    );

export const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required.").isLength({ max: 100 }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  passwordField("password"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
  // role field is intentionally NOT accepted — public registration always creates a student.
  // Teachers are created via the admin invitation system only.
  body("role").not().exists().withMessage("Role cannot be set during registration."),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  body("rememberMe").optional().isBoolean(),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
];

export const resetPasswordValidator = [
  body("token").trim().notEmpty().withMessage("A reset token is required."),
  passwordField("newPassword"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match.");
    return true;
  }),
];

export const verifyEmailValidator = [query("token").trim().notEmpty().withMessage("A verification token is required.")];

export const googleAuthValidator = [body("idToken").trim().notEmpty().withMessage("A Google ID token is required.")];
