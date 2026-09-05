import { Router } from "express";
import express from "express";
import { initializePaystack, verifyPayment, handlePaystackWebhook } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

// Webhook needs the raw body for HMAC verification — must be registered before json middleware
// The raw body is available because we parse it as raw in app.js for this route.
// POST /api/payments/paystack/webhook — public endpoint called by Paystack servers
router.post("/paystack/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  // Re-parse raw body back to object so the controller can use req.body normally
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
}, handlePaystackWebhook);

// Rate-limit payment initialization to prevent abuse
const paymentInitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many payment requests. Please wait." }),
});

// Authenticated payment routes
router.post("/paystack/initialize", protect, requireRole("student"), paymentInitLimiter, initializePaystack);
router.get("/verify/:reference", protect, verifyPayment);

export default router;
