/**
 * useSubscription
 *
 * Checks whether the authenticated student has an active subscription.
 * The backend is the authority — this hook only caches the result in memory
 * for the current session. It never trusts localStorage or IndexedDB for
 * entitlement decisions.
 */

import { useState, useEffect } from "react";
import { getMySubscription } from "../services/subscriptionService.js";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await getMySubscription();
        const sub = res.data.subscription;
        setSubscription(sub);
        setIsActive(Boolean(sub && sub.status === "active" && new Date(sub.endDate) > new Date()));
      } catch {
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  return { subscription, isActive, isLoading };
};
