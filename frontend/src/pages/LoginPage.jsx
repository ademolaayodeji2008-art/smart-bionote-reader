import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../components/ui/Input.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import Checkbox from "../components/ui/Checkbox.jsx";
import Button from "../components/ui/Button.jsx";
import GoogleAuthButton from "../components/ui/GoogleAuthButton.jsx";
import { useToast } from "../hooks/useToast.js";
import { useAuthStore } from "../stores/authStore.js";
import { getRoleHomePath } from "../utils/roleNavigation.js";

const LoginPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    navigate(from || getRoleHomePath(user.role), { replace: true });
  };

  const onSubmit = async (formValues) => {
    const result = await login(formValues);
    if (result.success) {
      toast.success("Welcome back!");
      redirectAfterLogin(result.user);
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    const result = await loginWithGoogle(idToken);
    if (result.success) {
      toast.success("Welcome back!");
      redirectAfterLogin(result.user);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <h1 className="text-h2 text-center">Welcome back</h1>
      <p className="text-small mt-2 text-center text-text-muted">
        Log in to continue your learning journey.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          required
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />

        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" {...register("rememberMe")} />
          <Link to="/forgot-password" className="text-small font-medium text-primary">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
          Log In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton onCredential={handleGoogleCredential} text="signin_with" />

      <p className="text-small mt-6 text-center text-text-muted">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
