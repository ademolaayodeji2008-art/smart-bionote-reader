/**
 * SubscriptionGuard
 *
 * Wraps premium student routes. If the student does not have an active
 * subscription they are shown a gate page with the subscription plans
 * instead of the requested content.
 *
 * Free routes (always accessible without a subscription):
 *   /student              — dashboard home
 *   /student/profile      — profile page
 *   /student/subscription — subscription plans page
 *   /student/subscription/history
 *   /student/payment/result
 *
 * Everything else requires an active subscription.
 */

import { useSubscription } from "../hooks/useSubscription.js";
import { Navigate, useLocation } from "react-router-dom";
import Spinner from "../components/ui/Spinner.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import { Lock, Sparkles } from "lucide-react";

const FREE_PATHS = [
  "/student",
  "/student/profile",
  "/student/subscription",
  "/student/subscription/history",
  "/student/payment/result",
];

const SubscriptionGatePage = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Lock className="h-8 w-8" aria-hidden="true" />
    </div>
    <h1 className="text-h2">Subscribe to Access</h1>
    <p className="text-body mt-3 max-w-md text-text-muted">
      This feature requires an active Smart Bionote Reader subscription.
      Choose a plan to unlock lessons, quizzes, progress tracking, and more.
    </p>

    <Card className="mt-8 w-full max-w-sm text-left">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        <p className="text-body font-semibold text-text-strong">What you get</p>
      </div>
      <ul className="space-y-2 text-small text-text-body">
        {[
          "Access all Biology lessons",
          "Step-by-step drawing lessons",
          "Smart reading voice with highlighting",
          "Quizzes & instant feedback",
          "Progress tracking",
          "XP, levels & badges",
          "Leaderboard ranking",
          "Download lessons for offline study",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-secondary font-bold">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2">
        <p className="text-caption text-center text-text-muted">Starting from</p>
        <p className="text-center text-3xl font-bold text-primary">₦1,500</p>
        <p className="text-center text-caption text-text-muted">per month</p>
      </div>

      <Button to="/student/subscription" variant="primary" className="mt-6 w-full">
        View Subscription Plans
      </Button>
    </Card>
  </div>
);

const SubscriptionGuard = ({ children }) => {
  const { isActive, isLoading } = useSubscription();
  const location = useLocation();

  // Always allow free paths
  const isFree = FREE_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith("/student/subscription")
  );

  if (isFree) return children;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isActive) {
    return <SubscriptionGatePage />;
  }

  return children;
};

export default SubscriptionGuard;
