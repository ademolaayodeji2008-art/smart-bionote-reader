import { Router } from "express";
import {
  createClass,
  getMyClasses,
  getClassById,
  updateClass,
} from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { createClassValidator, updateClassValidator } from "../validators/classValidators.js";

const router = Router();

router.use(protect, requireRole("teacher"));

/**
 * POST /api/classes              — Teacher creates a class
 * GET  /api/classes/my-classes   — Teacher views their own classes
 * GET  /api/classes/:id          — Teacher views a single class
 * PUT  /api/classes/:id          — Teacher updates their own class (ownership verified in service)
 */
router.post("/", createClassValidator, validateRequest, createClass);
router.get("/my-classes", getMyClasses);
router.get("/:id", validateObjectId("id"), getClassById);
router.put("/:id", validateObjectId("id"), updateClassValidator, validateRequest, updateClass);

export default router;
