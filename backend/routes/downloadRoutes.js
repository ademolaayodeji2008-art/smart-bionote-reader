import { Router } from "express";
import { authorizeDownload, getDownloadable } from "../controllers/downloadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();
router.use(protect, requireRole("student"));

router.post("/:lessonId", validateObjectId("lessonId"), authorizeDownload);
router.get("/", getDownloadable);

export default router;
