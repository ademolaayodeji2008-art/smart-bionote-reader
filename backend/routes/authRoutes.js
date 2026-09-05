import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuthLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  googleAuthValidator,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerLimiter, registerValidator, validateRequest, register);
router.post("/login", loginLimiter, loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", protect, getCurrentUser);
router.get("/verify-email", verifyEmailValidator, validateRequest, verifyEmail);
router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPasswordValidator, validateRequest, resetPassword);
router.post("/google", googleAuthValidator, validateRequest, googleAuthLogin);

export default router;
