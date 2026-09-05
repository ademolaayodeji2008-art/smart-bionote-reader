import { Router } from "express";
import { verifyInvitation, acceptInvitation } from "../controllers/teacherInvitationController.js";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate-limit invitation acceptance to prevent brute-force token guessing
const acceptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many attempts. Please try again later." }),
});

// Public routes — no auth required (the invitation token IS the credential)
router.get("/verify", verifyInvitation);

router.post(
  "/accept",
  acceptLimiter,
  [
    body("token").trim().notEmpty().withMessage("Invitation token is required."),
    body("password")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .withMessage("Password must be at least 8 characters with an uppercase letter, lowercase letter, and number."),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match.");
      return true;
    }),
    // Role must never come from the client
    body("role").not().exists().withMessage("Role cannot be set by the client."),
  ],
  validateRequest,
  acceptInvitation,
);

export default router;
