import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import PasswordStrengthMeter from "../components/ui/PasswordStrengthMeter.jsx";
import Button from "../components/ui/Button.jsx";
import { resetPasswordRequest, getErrorMessage, getErrorCode } from "../services/authService.js";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENT_MESSAGE } from "../utils/passwordValidation.js";

/** view: "form" | "success" | "invalid" | "expired" */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [view, setView] = useState(token ? "form" : "invalid");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword", "");

  const onSubmit = async (formValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      await resetPasswordRequest({ token, ...formValues });
      setView("success");
    } catch (error) {
      const code = getErrorCode(error);
      if (code === "TOKEN_EXPIRED") setView("expired");
      else if (code === "TOKEN_INVALID") setView("invalid");
      else setFormError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Password reset</h1>
        <p className="text-small mt-2 text-text-muted">
          Your password has been changed successfully. You can now log in with your new password.
        </p>
        <Button to="/login" variant="primary" className="mt-6 w-full">
          Back to login
        </Button>
      </div>
    );
  }

  if (view === "expired") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Clock className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Link expired</h1>
        <p className="text-small mt-2 text-text-muted">
          Your password reset link has expired. Please request a new one.
        </p>
        <Button to="/forgot-password" variant="primary" className="mt-6 w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  if (view === "invalid") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertOctagon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Invalid link</h1>
        <p className="text-small mt-2 text-text-muted">
          This password reset link is invalid or has already been used.
        </p>
        <Button to="/forgot-password" variant="primary" className="mt-6 w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 text-center">Reset your password</h1>
      <p className="text-small mt-2 text-center text-text-muted">Choose a new password for your account.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <PasswordInput
            id="newPassword"
            label="New password"
            placeholder="Create a new password"
            required
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "Password is required",
              pattern: { value: PASSWORD_REGEX, message: PASSWORD_REQUIREMENT_MESSAGE },
            })}
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordInput
          id="confirmPassword"
          label="Confirm new password"
          placeholder="Re-enter your new password"
          required
          error={errors.confirmPassword?.message || formError}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === newPassword || "Passwords do not match",
          })}
        />

        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
          Reset password
        </Button>
      </form>

      <p className="text-small mt-6 text-center text-text-muted">
        <Link to="/login" className="font-semibold text-primary">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
