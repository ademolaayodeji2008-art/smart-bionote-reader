/**
 * PaymentResult — /student/payment/result
 *
 * Paystack redirects here after the student completes (or abandons) payment.
 * URL contains ?reference=... (Paystack standard callback parameter).
 *
 * This page calls the backend to VERIFY the payment server-side.
 * It NEVER trusts ?status=success from the URL — that would be trivial to fake.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyPayment } from "../../services/subscriptionService.js";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [subscription, setSubscription] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setErrorMessage("No payment reference found. If you made a payment, contact support.");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyPayment(reference);
        setSubscription(res.data.subscription);
        setStatus("success");
      } catch (err) {
        setStatus("failed");
        setErrorMessage(
          err.response?.data?.message ??
          "Payment could not be verified. If you were charged, please contact support with your reference."
        );
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <h1 className="text-h2">Verifying your payment…</h1>
            <p className="text-small mt-2 text-text-muted">Please wait while we confirm your transaction.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
              <CheckCircle2 className="h-9 w-9 text-secondary" aria-hidden="true" />
            </div>
            <h1 className="text-h2">Payment Successful!</h1>
            <p className="text-small mt-2 text-text-muted">
              Your subscription is now active.
            </p>
            {subscription && (
              <div className="mt-4 rounded-xl bg-surface-muted p-4 text-left text-small">
                <p><span className="font-semibold">Plan:</span> {subscription.plan?.name}</p>
                {subscription.endDate && (
                  <p className="mt-1">
                    <span className="font-semibold">Expires:</span>{" "}
                    {new Date(subscription.endDate).toLocaleDateString("en-NG", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                )}
                {reference && (
                  <p className="mt-1 text-caption font-mono">Ref: {reference}</p>
                )}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="primary" onClick={() => navigate("/student")}>
                Go to Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/student/subscription/history")}>
                View Subscription History
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <XCircle className="h-9 w-9 text-danger" aria-hidden="true" />
            </div>
            <h1 className="text-h2">Payment Not Confirmed</h1>
            <p className="text-small mt-2 text-text-muted">{errorMessage}</p>
            {reference && (
              <p className="mt-3 rounded-xl bg-surface-muted px-4 py-2 font-mono text-xs text-text-muted">
                Reference: {reference}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="primary" onClick={() => navigate("/student/subscription")}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => navigate("/student")}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentResult;
