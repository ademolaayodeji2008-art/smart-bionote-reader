import { Router } from "express";
import { getTeacherProfile, updateTeacherProfile } from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateTeacherProfileValidator } from "../validators/teacherValidators.js";

const router = Router();

// All routes require authentication + teacher role
router.use(protect, requireRole("teacher"));

/**
 * GET  /api/teachers/profile   — Retrieve own profile
 * PUT  /api/teachers/profile   — Update own profile (whitelisted fields only, isApproved excluded)
 */
router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfileValidator, validateRequest, updateTeacherProfile);

export default router;
