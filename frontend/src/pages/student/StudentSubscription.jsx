/**
 * StudentSubscription — /student/subscription
 *
 * Displays all available subscription plans with pricing in NGN.
 * The actual amount charged is ALWAYS determined server-side from the plan record.
 * The frontend only sends the planId — it never sends a price.
 *
 * Plan prices (authoritative source: backend SubscriptionPlan collection):
 *  1 Month  → ₦1,500
 *  3 Months → ₦4,000
 *  6 Months → ₦8,000
 *  9 Months → ₦12,500
 * 12 Months → ₦16,000
 */

import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, Crown, Calendar } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getPlans, getMySubscription, initializePayment } from "../../services/subscriptionService.js";
import { useToast } from "../../hooks/useToast.js";

const PLAN_BENEFITS = [
  "Access all published lessons",
  "Download lessons for offline study",
  "Take unlimited quizzes",
  "Track progress & earn XP",
  "Leaderboard ranking",
  "Earn achievement badges",
];

const SubscriptionPlanCard = ({ plan, isRecommended, currentPlan, onSubscribe, isLoading }) => {
  const monthlyEquivalent = plan.amountNGN / plan.durationMonths;
  const isActive = currentPlan?.plan?.durationMonths === plan.durationMonths && currentPlan?.status === "active";

  return (
    <div className={`relative rounded-2xl border-2 p-6 transition-all duration-200 ${
      isRecommended
        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
        : "border-border bg-surface"
    }`}>
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow">
            <Crown className="h-3 w-3" />Best Value
          </span>
        </div>
      )}

      <div className="text-center">
        <p className="text-h3 text-text-strong">{plan.name}</p>
        <p className="mt-3 text-4xl font-bold text-primary">{plan.displayPrice}</p>
        {plan.durationMonths > 1 && (
          <p className="mt-1 text-small text-text-muted">
            ≈ ₦{Math.round(monthlyEquivalent).toLocaleString("en-NG")}/month
          </p>
        )}
        {plan.description && (
          <p className="mt-2 text-small text-text-muted">{plan.description}</p>
        )}
      </div>

      <ul className="mt-6 space-y-2.5">
        {PLAN_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-small text-text-body">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isActive ? (
          <Button variant="secondary" className="w-full" disabled>
            <CheckCircle2 className="h-4 w-4" />Current Plan
          </Button>
        ) : (
          <Button
            variant={isRecommended ? "primary" : "outline"}
            className="w-full"
            loading={isLoading}
            onClick={() => onSubscribe(plan._id)}
          >
            Subscribe — {plan.displayPrice}
          </Button>
        )}
      </div>
    </div>
  );
};

const StudentSubscription = () => {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [plansRes, subRes] = await Promise.allSettled([getPlans(), getMySubscription()]);
      if (plansRes.status === "fulfilled") setPlans(plansRes.value.data.plans);
      if (subRes.status === "fulfilled") setCurrentPlan(subRes.value.data.subscription);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSubscribe = async (planId) => {
    setSubscribingPlanId(planId);
    try {
      const res = await initializePayment(planId);
      // Redirect to Paystack payment page
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not initialize payment. Please try again.");
      setSubscribingPlanId(null);
    }
  };

  // The 12-month plan is recommended (best value)
  const recommendedPlanMonths = 12;

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        description="Choose a plan to unlock full access to Smart Bionote Reader."
      />

      {/* Current plan banner */}
      {currentPlan && (
        <Card className="mb-8 flex flex-wrap items-center justify-between gap-4 border-secondary/30 bg-secondary/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-small font-semibold text-text-strong">
                Active subscription — {currentPlan.plan?.name}
              </p>
              <p className="text-caption">
                Expires {new Date(currentPlan.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {Math.max(0, Math.ceil((new Date(currentPlan.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button to="/student/subscription/history" variant="ghost" size="sm">
              <Calendar className="h-4 w-4" />View History
            </Button>
          </div>
        </Card>
      )}

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((plan) => (
          <SubscriptionPlanCard
            key={plan._id}
            plan={plan}
            isRecommended={plan.durationMonths === recommendedPlanMonths}
            currentPlan={currentPlan}
            onSubscribe={handleSubscribe}
            isLoading={subscribingPlanId === plan._id}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-small text-text-muted">
        Prices are in Nigerian Naira (₦). Payments are processed securely by Paystack.
        Renewing before expiry extends from your current end date.
      </p>
    </div>
  );
};

export default StudentSubscription;
