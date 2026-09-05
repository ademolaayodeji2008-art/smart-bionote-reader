import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { APP_NAME, APP_SLOGAN } from "../utils/constants.js";

const SPLASH_DURATION_MS = 2200;

/**
 * First screen shown on load. Auto-redirects to the landing page,
 * doubling as the PWA's splash/loading experience.
 */
const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home", { replace: true }), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary via-blue-700 to-dark px-4 text-center">
      <div className="animate-scale-in flex flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
          <Logo size="lg" showName={false} />
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">{APP_NAME}</h1>
        <p className="mt-2 text-base font-medium text-white/80">{APP_SLOGAN}</p>

        <div className="mt-10">
          <Spinner size="md" color="white" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
