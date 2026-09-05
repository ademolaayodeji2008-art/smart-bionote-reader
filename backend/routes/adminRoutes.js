import { Router } from "express";
import {
  getPlatformStats,
  getUsers, getUserById, activateUser, deactivateUser,
  getPendingTeachers, approveTeacher, rejectTeacher,
  getAdminLessons, adminArchiveLesson,
  adminCreateSubject, adminUpdateSubject,
  getAdminClasses,
  getAuditLogs,
} from "../controllers/adminController.js";
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
} from "../controllers/teacherInvitationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { createSubjectValidator, updateSubjectValidator } from "../validators/subjectValidators.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getSubscriptionStats, getRecentTransactions } from "../services/subscriptionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";

const router = Router();

// Every admin route requires authentication AND admin role — enforced server-side
router.use(protect, requireRole("admin"));

// Dashboard stats
router.get("/stats", getPlatformStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", validateObjectId("id"), getUserById);
router.patch("/users/:id/activate", validateObjectId("id"), activateUser);
router.patch("/users/:id/deactivate", validateObjectId("id"), deactivateUser);

// Teacher approval (existing approval workflow)
router.get("/teachers/pending", getPendingTeachers);
router.patch("/teachers/:profileId/approve", validateObjectId("profileId"), approveTeacher);
router.patch("/teachers/:profileId/reject", validateObjectId("profileId"), rejectTeacher);

// Teacher invitations (new secure invitation workflow)
router.post("/invitations", createInvitation);
router.get("/invitations", listInvitations);
router.patch("/invitations/:id/revoke", validateObjectId("id"), revokeInvitation);

// Lesson moderation
router.get("/lessons", getAdminLessons);
router.patch("/lessons/:id/archive", validateObjectId("id"), adminArchiveLesson);

// Subject management
router.post("/subjects", createSubjectValidator, validateRequest, adminCreateSubject);
router.put("/subjects/:id", validateObjectId("id"), updateSubjectValidator, validateRequest, adminUpdateSubject);

// Class overview
router.get("/classes", getAdminClasses);

// Audit logs
router.get("/audit-logs", getAuditLogs);

// Subscription stats + transactions
router.get("/subscription-stats", asyncHandler(async (req, res) => {
  const stats = await getSubscriptionStats();
  sendSuccess(res, { message: "Stats retrieved.", data: { stats } });
}));

router.get("/transactions", asyncHandler(async (req, res) => {
  const result = await getRecentTransactions({ page: req.query.page, limit: req.query.limit });
  sendSuccess(res, { message: "Transactions retrieved.", data: result });
}));

export default router;
