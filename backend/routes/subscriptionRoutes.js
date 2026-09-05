import { Router } from "express";
import { getPlans, getMySubscription, getHistory } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

router.get("/plans", getPlans);
router.get("/me", getMySubscription);
router.get("/history", getHistory);

export default router;
