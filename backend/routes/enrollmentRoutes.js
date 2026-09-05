import { Router } from "express";
import { getMyEnrollments, getClassEnrollments } from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();

router.use(protect);

/**
 * GET /api/enrollments/my-enrollments          — Student: own enrollments
 * GET /api/enrollments/class/:classId          — Teacher: enrollments for their class
 */
router.get("/my-enrollments", requireRole("student"), getMyEnrollments);
router.get("/class/:classId", requireRole("teacher"), validateObjectId("classId"), getClassEnrollments);

export default router;
