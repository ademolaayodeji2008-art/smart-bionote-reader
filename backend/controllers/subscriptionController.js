import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as subscriptionService from "../services/subscriptionService.js";

/** GET /api/subscriptions/plans — public to all authenticated users */
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getActivePlans();
  sendSuccess(res, { message: "Plans retrieved.", data: { plans } });
});

/** GET /api/subscriptions/me — current active subscription */
export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getMySubscription(req.user._id);
  sendSuccess(res, { message: "Subscription retrieved.", data: { subscription } });
});

/** GET /api/subscriptions/history */
export const getHistory = asyncHandler(async (req, res) => {
  const history = await subscriptionService.getSubscriptionHistory(req.user._id);
  sendSuccess(res, { message: "History retrieved.", data: { history } });
});
