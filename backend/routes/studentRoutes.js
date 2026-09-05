import { Router } from "express";
import { getStudentProfile, updateStudentProfile } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateStudentProfileValidator } from "../validators/studentValidators.js";

const router = Router();

// All routes require authentication + student role
router.use(protect, requireRole("student"));

/**
 * GET  /api/students/profile   — Retrieve own profile
 * PUT  /api/students/profile   — Update own profile (whitelisted fields only)
 */
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfileValidator, validateRequest, updateStudentProfile);

export default router;
