import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { verifyEmailRequest, getErrorMessage, getErrorCode } from "../services/authService.js";

/** status: "loading" | "success" | "invalid" | "expired" */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    let cancelled = false;

    verifyEmailRequest(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error) => {
        if (cancelled) return;
        const code = getErrorCode(error);
        setMessage(getErrorMessage(error));
        setStatus(code === "TOKEN_EXPIRED" ? "expired" : "invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center text-center">
        <Spinner size="lg" />
        <h1 className="text-h2 mt-6">Verifying your email...</h1>
        <p className="text-small mt-2 text-text-muted">This will only take a moment.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Email verified</h1>
        <p className="text-small mt-2 text-text-muted">
          Your account is now active. You can log in and start learning.
        </p>
        <Button to="/login" variant="primary" className="mt-6 w-full">
          Continue to login
        </Button>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Clock className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Link expired</h1>
        <p className="text-small mt-2 text-text-muted">{message}</p>
        <Button to="/login" variant="primary" className="mt-6 w-full">
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertOctagon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-h2 mt-4">Verification failed</h1>
      <p className="text-small mt-2 text-text-muted">
        {message || "This verification link is invalid or your account may already be verified."}
      </p>
      <Button to="/login" variant="primary" className="mt-6 w-full">
        Back to login
      </Button>
    </div>
  );
};

export default VerifyEmailPage;
