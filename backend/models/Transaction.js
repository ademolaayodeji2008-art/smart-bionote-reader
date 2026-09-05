import mongoose from "mongoose";

/**
 * Records every payment attempt (successful or not) for audit and revenue reporting.
 * Index: reference (unique) — idempotency check on webhook replay.
 * Index: user — all transactions for a student.
 * Index: status + createdAt — revenue queries.
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    // Paystack (or future provider) transaction reference — unique per attempt
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: { type: String, default: "paystack" },
    amountKobo: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "abandoned", "refunded"],
      default: "pending",
      index: true,
    },
    // Raw Paystack metadata stored for debugging — never used for business logic
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

transactionSchema.index({ status: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
