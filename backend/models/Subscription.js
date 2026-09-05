import mongoose from "mongoose";

/**
 * Tracks a student's subscription to the platform.
 * The backend is the sole authority on subscription status — frontend values are never trusted.
 *
 * Entitlement check: current date < endDate AND status === "active"
 *
 * Index: user — fast lookup of a student's current subscription.
 * Index: status + endDate — efficient expiration queries.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    durationMonths: { type: Number, required: true, min: 1 },
    // Amount in kobo — matches what was actually charged
    amountKobo: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled", "failed"],
      default: "pending",
      index: true,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null, index: true },
    paymentProvider: { type: String, default: "paystack" },
    // Paystack transaction reference
    transactionReference: { type: String, default: null, index: true },
  },
  { timestamps: true },
);

subscriptionSchema.index({ status: 1, endDate: 1 });

/** Returns true when the subscription grants access right now. */
subscriptionSchema.methods.isCurrentlyActive = function () {
  return this.status === "active" && this.endDate && new Date() < this.endDate;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
