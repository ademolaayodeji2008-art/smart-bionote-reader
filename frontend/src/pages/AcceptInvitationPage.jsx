/**
 * AcceptInvitationPage — /accept-invitation?token=...
 *
 * Public page for teachers to set their password and activate their account.
 * The role is set SERVER-SIDE to "teacher" — the client never controls it.
 *
 * Flow:
 * 1. Page loads → verify token with backend (GET /api/invitations/verify)
 * 2. If valid → show password form with teacher's name pre-filled
 * 3. Teacher submits password → POST /api/invitations/accept
 * 4. Backend creates account with role="teacher" and signs user in
 * 5. Redirect to teacher dashboard
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import PasswordStrengthMeter from "../components/ui/PasswordStrengthMeter.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { useToast } from "../hooks/useToast.js";
import { useAuthStore } from "../stores/authStore.js";
import { verifyInvitationToken, acceptInvitation } from "../services/invitationService.js";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENT_MESSAGE } from "../utils/passwordValidation.js";

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = searchParams.get("token");

  const [verifyState, setVerifyState] = useState("loading"); // loading | valid | invalid
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [invalidMessage, setInvalidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password", "");

  // Verify the token on load
  useEffect(() => {
    if (!token) {
      setVerifyState("invalid");
      setInvalidMessage("No invitation token found in the link. Please check your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyInvitationToken(token);
        setInvitationInfo(res.data.invitation);
        setVerifyState("valid");
      } catch (err) {
        setVerifyState("invalid");
        setInvalidMessage(err.response?.data?.message ?? "This invitation link is invalid or has expired.");
      }
    };

    verify();
  }, [token]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await acceptInvitation({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      // Update auth store with the newly created teacher user
      useAuthStore.setState({
        user: res.data.user,
        isAuthenticated: true,
      });

      toast.success("Welcome to Smart Bionote Reader! Your teacher account is ready.");
      navigate("/teacher", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        {/* Loading */}
        {verifyState === "loading" && (
          <Card className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            <p className="text-body text-text-muted">Verifying your invitation…</p>
          </Card>
        )}

        {/* Invalid / expired / revoked */}
        {verifyState === "invalid" && (
          <Card className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
              <XCircle className="h-8 w-8 text-danger" aria-hidden="true" />
            </div>
            <h1 className="text-h2">Invitation Invalid</h1>
            <p className="text-body mt-3 text-text-muted">{invalidMessage}</p>
            <p className="text-small mt-4 text-text-muted">
              Please contact your administrator to request a new invitation.
            </p>
            <Link to="/login" className="mt-6 block text-small font-semibold text-primary">
              Back to login
            </Link>
          </Card>
        )}

        {/* Valid — show password form */}
        {verifyState === "valid" && invitationInfo && (
          <Card>
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-h2">Welcome, {invitationInfo.fullName}!</h1>
                <p className="text-small mt-1 text-text-muted">
                  You've been invited to join Smart Bionote Reader as a <strong>Teacher</strong>.
                  Create your password to activate your account.
                </p>
              </div>
            </div>

            {/* Read-only email — shows teacher their account email */}
            <div className="mb-5 rounded-xl bg-surface-muted px-4 py-3">
              <p className="text-caption">Your account email</p>
              <p className="text-body font-semibold text-text-strong">{invitationInfo.email}</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <PasswordInput
                  id="password"
                  label="Create a password"
                  placeholder="At least 8 characters"
                  required
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required.",
                    pattern: { value: PASSWORD_REGEX, message: PASSWORD_REQUIREMENT_MESSAGE },
                  })}
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <PasswordInput
                id="confirmPassword"
                label="Confirm password"
                placeholder="Re-enter your password"
                required
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) => value === password || "Passwords do not match.",
                })}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isSubmitting}
              >
                <CheckCircle2 className="h-4 w-4" />
                Activate My Teacher Account
              </Button>
            </form>

            <p className="text-caption mt-4 text-center text-text-muted">
              Invitation expires {new Date(invitationInfo.expiresAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
