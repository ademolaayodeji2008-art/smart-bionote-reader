import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";
import { initializePayment, verifyAndActivate } from "../services/subscriptionService.js";

/**
 * POST /api/payments/paystack/initialize
 * Student selects a plan; backend fetches authoritative price from DB.
 */
export const initializePaystack = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  if (!planId) throw new AppError("Plan ID is required.", 400);

  const result = await initializePayment(req.user._id, req.user.email, planId);
  sendSuccess(res, {
    statusCode: 201,
    message: "Payment initialized.",
    data: { authorizationUrl: result.authorizationUrl, reference: result.reference },
  });
});

/**
 * GET /api/payments/verify/:reference
 * Called after Paystack redirects back to the frontend callback URL.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const result = await verifyAndActivate(reference);
  sendSuccess(res, {
    message: result.alreadyProcessed ? "Payment already processed." : "Payment verified and subscription activated.",
    data: { subscription: result.subscription },
  });
});

/**
 * POST /api/payments/paystack/webhook
 * Receives Paystack webhook events.
 * Verifies the signature with HMAC-SHA512 using PAYSTACK_SECRET_KEY.
 * Idempotent — processing the same event twice is safe.
 */
export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  if (!signature) {
    res.sendStatus(400);
    return;
  }

  // Verify webhook authenticity
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    res.sendStatus(401);
    return;
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      try {
        await verifyAndActivate(reference);
      } catch (err) {
        // Log but don't crash — Paystack retries webhooks on non-2xx
        console.error("[webhook] verifyAndActivate failed:", err.message);
      }
    }
  }

  // Always respond 200 to acknowledge receipt
  res.sendStatus(200);
});
