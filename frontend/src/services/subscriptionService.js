import api from "./api.js";

export const getPlans = async () => {
  const response = await api.get("/subscriptions/plans");
  return response.data;
};

export const getMySubscription = async () => {
  const response = await api.get("/subscriptions/me");
  return response.data;
};

export const getSubscriptionHistory = async () => {
  const response = await api.get("/subscriptions/history");
  return response.data;
};

export const initializePayment = async (planId) => {
  const response = await api.post("/payments/paystack/initialize", { planId });
  return response.data;
};

export const verifyPayment = async (reference) => {
  const response = await api.get(`/payments/verify/${reference}`);
  return response.data;
};
