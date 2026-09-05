import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import Input from "../components/ui/Input.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import PasswordStrengthMeter from "../components/ui/PasswordStrengthMeter.jsx";
import Checkbox from "../components/ui/Checkbox.jsx";
import ErrorMessage from "../components/ui/ErrorMessage.jsx";
import Button from "../components/ui/Button.jsx";
import GoogleAuthButton from "../components/ui/GoogleAuthButton.jsx";
import { useToast } from "../hooks/useToast.js";
import { useAuthStore } from "../stores/authStore.js";
import { getRoleHomePath } from "../utils/roleNavigation.js";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENT_MESSAGE } from "../utils/passwordValidation.js";

// Role selector intentionally removed — public registration always creates a student account.
// Teachers are created via the admin invitation system only.

const RegisterPage = () => {
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (formValues) => {
    const result = await registerUser(formValues);
    if (result.success) {
      setRegisteredEmail(formValues.email);
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    const result = await loginWithGoogle(idToken);
    if (result.success) {
      toast.success("Welcome to Smart Bionote Reader!");
      navigate(getRoleHomePath(result.user.role), { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  if (registeredEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-h2 mt-4">Check your email</h1>
        <p className="text-small mt-2 text-text-muted">
          We sent a verification link to <span className="font-semibold text-text-strong">{registeredEmail}</span>.
          Verify your email to activate your account, then log in.
        </p>
        <Button to="/login" variant="primary" className="mt-6 w-full">
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 text-center">Create your account</h1>
      <p className="text-small mt-2 text-center text-text-muted">
        Join Smart Bionote Reader and start learning.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="fullName"
          label="Full name"
          placeholder="Jane Doe"
          required
          error={errors.fullName?.message}
          {...register("fullName", { required: "Full name is required" })}
        />

        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />

        <div>
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Create a password"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
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
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <div>
          <Checkbox
            id="acceptTerms"
            label="I agree to the Terms of Service and Privacy Policy"
            {...register("acceptTerms", { required: "You must accept the terms to continue" })}
          />
          <ErrorMessage id="acceptTerms-error">{errors.acceptTerms?.message}</ErrorMessage>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton onCredential={handleGoogleCredential} text="signup_with" />

      <p className="text-small mt-6 text-center text-text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
