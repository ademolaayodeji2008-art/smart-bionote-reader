import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { forgotPasswordRequest, getErrorMessage } from "../services/authService.js";

/**
 * Always shows the same success message regardless of whether the email
 * exists — the backend deliberately never reveals account existence here.
 */
const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await forgotPasswordRequest(email);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Check your email</h1>
        <p className="text-small mt-2 text-text-muted">
          If an account exists with that email, password reset instructions have been sent.
        </p>
        <Button to="/login" variant="primary" className="mt-6 w-full">
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 text-center">Forgot your password?</h1>
      <p className="text-small mt-2 text-center text-text-muted">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          error={errors.email?.message || errorMessage}
          {...register("email", { required: "Email is required" })}
        />

        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className="text-small mt-6 text-center text-text-muted">
        Remembered your password?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
