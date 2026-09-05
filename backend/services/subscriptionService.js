import crypto from "node:crypto";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import { AppError } from "../utils/AppError.js";

// ── Plan management ───────────────────────────────────────────────────────────

/** Returns all active plans sorted by display order. Never trusts client price. */
export const getActivePlans = async () => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
  // Expose price in NGN (not kobo) for frontend display
  return plans.map((p) => ({
    ...p,
    amountNGN: p.amountKobo / 100,
    displayPrice: `₦${(p.amountKobo / 100).toLocaleString("en-NG")}`,
  }));
};

export const getPlanById = async (planId) => {
  const plan = await SubscriptionPlan.findById(planId).lean();
  if (!plan) throw new AppError("Subscription plan not found.", 404);
  if (!plan.isActive) throw new AppError("This subscription plan is no longer available.", 400);
  return plan;
};

// ── Entitlement check ─────────────────────────────────────────────────────────

/**
 * Returns the student's current active subscription, or null.
 * This is the authoritative check — never trust frontend subscription state.
 */
export const getActiveSubscription = async (userId) => {
  const sub = await Subscription.findOne({
    user: userId,
    status: "active",
    endDate: { $gt: new Date() },
  })
    .populate("plan", "name durationMonths")
    .lean();
  return sub || null;
};

export const hasActiveSubscription = async (userId) => {
  const sub = await getActiveSubscription(userId);
  return Boolean(sub);
};

// ── Get student's subscription info ──────────────────────────────────────────

export const getMySubscription = async (userId) => {
  const sub = await Subscription.findOne({ user: userId, status: "active", endDate: { $gt: new Date() } })
    .populate("plan")
    .lean();
  return sub;
};

export const getSubscriptionHistory = async (userId) => {
  return Subscription.find({ user: userId })
    .populate("plan", "name durationMonths")
    .sort({ createdAt: -1 })
    .lean();
};

// ── Payment initialization ────────────────────────────────────────────────────

/**
 * Creates a pending Subscription + Transaction and returns a Paystack
 * authorization URL for the student to complete payment.
 *
 * Price is taken from the server-side plan — the frontend amount is IGNORED.
 */
export const initializePayment = async (userId, userEmail, planId) => {
  const plan = await getPlanById(planId);

  // Generate a unique Paystack reference
  const reference = `SBR-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  // Create pending subscription record
  const subscription = await Subscription.create({
    user: userId,
    plan: plan._id,
    durationMonths: plan.durationMonths,
    amountKobo: plan.amountKobo,
    currency: plan.currency,
    status: "pending",
    transactionReference: reference,
  });

  // Create pending transaction record
  await Transaction.create({
    user: userId,
    subscription: subscription._id,
    reference,
    provider: "paystack",
    amountKobo: plan.amountKobo,
    currency: plan.currency,
    status: "pending",
  });

  // Call Paystack to get the authorization URL
  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      amount: plan.amountKobo,   // Paystack uses kobo
      currency: plan.currency,
      reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: {
        planId: plan._id.toString(),
        planName: plan.name,
        userId: userId.toString(),
      },
    }),
  });

  if (!paystackResponse.ok) {
    await Subscription.findByIdAndUpdate(subscription._id, { status: "failed" });
    await Transaction.findOneAndUpdate({ reference }, { status: "failed" });
    throw new AppError("Payment initialization failed. Please try again.", 502);
  }

  const { data } = await paystackResponse.json();
  return { authorizationUrl: data.authorization_url, reference };
};

// ── Payment verification (called from verify endpoint + webhook) ──────────────

/**
 * Verifies a Paystack transaction reference server-side.
 * Activates the subscription only when Paystack confirms the payment.
 * Idempotent — calling twice with the same reference is safe.
 */
export const verifyAndActivate = async (reference) => {
  // Idempotency: if already successful, return existing state
  const existingTx = await Transaction.findOne({ reference }).lean();
  if (!existingTx) throw new AppError("Transaction not found.", 404);
  if (existingTx.status === "successful") {
    const sub = await Subscription.findById(existingTx.subscription).populate("plan").lean();
    return { alreadyProcessed: true, subscription: sub };
  }

  // Verify with Paystack
  const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  if (!paystackResponse.ok) throw new AppError("Payment verification failed.", 502);

  const { data } = await paystackResponse.json();

  if (data.status !== "success") {
    await Transaction.findOneAndUpdate({ reference }, { status: data.status === "abandoned" ? "abandoned" : "failed" });
    await Subscription.findOneAndUpdate({ transactionReference: reference }, { status: "failed" });
    throw new AppError("Payment was not successful.", 402);
  }

  // Verify amount matches plan (anti-tampering)
  const subscription = await Subscription.findOne({ transactionReference: reference });
  if (!subscription) throw new AppError("Subscription record not found.", 404);

  if (data.amount !== subscription.amountKobo) {
    console.error(`[subscriptionService] Amount mismatch: expected ${subscription.amountKobo}, got ${data.amount}`);
    throw new AppError("Payment amount mismatch. Contact support.", 400);
  }

  // Calculate subscription dates
  // If student has an existing active sub, EXTEND from its endDate (not today)
  const existingSub = await Subscription.findOne({
    user: subscription.user,
    status: "active",
    endDate: { $gt: new Date() },
    _id: { $ne: subscription._id },
  });

  const startDate = new Date();
  const baseDate = existingSub?.endDate && existingSub.endDate > startDate
    ? new Date(existingSub.endDate)
    : startDate;

  const endDate = new Date(baseDate);
  endDate.setMonth(endDate.getMonth() + subscription.durationMonths);

  // Activate subscription
  subscription.status = "active";
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  await subscription.save();

  // Mark transaction successful
  await Transaction.findOneAndUpdate(
    { reference },
    { status: "successful", paidAt: new Date(), metadata: data },
  );

  return { alreadyProcessed: false, subscription };
};

// ── Admin stats ───────────────────────────────────────────────────────────────

export const getSubscriptionStats = async () => {
  const now = new Date();
  const [total, active, expired, totalRevenue] = await Promise.all([
    Transaction.countDocuments({ status: "successful" }),
    Subscription.countDocuments({ status: "active", endDate: { $gt: now } }),
    Subscription.countDocuments({ $or: [{ status: "expired" }, { status: "active", endDate: { $lte: now } }] }),
    Transaction.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: null, total: { $sum: "$amountKobo" } } },
    ]),
  ]);
  return {
    totalTransactions: total,
    activeSubscriptions: active,
    expiredSubscriptions: expired,
    totalRevenueNGN: totalRevenue[0] ? totalRevenue[0].total / 100 : 0,
  };
};

export const getRecentTransactions = async ({ page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    Transaction.find({ status: "successful" })
      .populate("user", "fullName email")
      .populate({ path: "subscription", populate: { path: "plan", select: "name durationMonths" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Transaction.countDocuments({ status: "successful" }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  return {
    transactions: transactions.map((t) => ({
      ...t,
      amountNGN: t.amountKobo / 100,
      displayAmount: `₦${(t.amountKobo / 100).toLocaleString("en-NG")}`,
    })),
    pagination: { currentPage: pageNum, totalPages, totalItems: total, hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1 },
  };
};
