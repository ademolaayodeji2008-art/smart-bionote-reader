import { Router } from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  createSubjectValidator,
  updateSubjectValidator,
} from "../validators/subjectValidators.js";

const router = Router();

// All subject routes require authentication
router.use(protect);

/**
 * GET  /api/subjects        — Any authenticated user
 * GET  /api/subjects/:id    — Any authenticated user
 * POST /api/subjects        — Admin only
 * PUT  /api/subjects/:id    — Admin only
 * DEL  /api/subjects/:id    — Admin only (soft delete)
 */
router.get("/", getSubjects);
router.get("/:id", validateObjectId("id"), getSubjectById);
router.post("/", requireRole("admin"), createSubjectValidator, validateRequest, createSubject);
router.put("/:id", requireRole("admin"), validateObjectId("id"), updateSubjectValidator, validateRequest, updateSubject);
router.delete("/:id", requireRole("admin"), validateObjectId("id"), deleteSubject);

export default router;
