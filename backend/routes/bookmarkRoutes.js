import { Router } from "express";
import { addBookmark, removeBookmark, getBookmarks } from "../controllers/bookmarkController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();
router.use(protect, requireRole("student"));

router.get("/", getBookmarks);
router.post("/:lessonId", validateObjectId("lessonId"), addBookmark);
router.delete("/:lessonId", validateObjectId("lessonId"), removeBookmark);

export default router;
