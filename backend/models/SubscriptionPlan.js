import mongoose from "mongoose";

/**
 * Defines the available subscription plans.
 * Prices are stored server-side — the frontend NEVER sends an amount; it sends a planId only.
 * The backend retrieves the authoritative price from this collection.
 *
 * Currency: NGN (Nigerian Naira)
 */
const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    durationMonths: { type: Number, required: true, min: 1 },
    // Amount in kobo (NGN × 100) — stored as integer to avoid floating-point issues
    // E.g. ₦1,500 → 150000 kobo
    amountKobo: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN", uppercase: true },
    description: { type: String, trim: true, maxlength: 500, default: null },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
