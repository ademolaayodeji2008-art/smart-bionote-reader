import { Link, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import { APP_SLOGAN } from "../utils/constants.js";

/** Centered card shell for authentication pages (login/register placeholders). */
const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/home">
          <Logo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-small font-medium text-text-muted">{APP_SLOGAN}</p>
          </div>
          <div className="animate-fade-in-up rounded-2xl border border-border bg-surface p-8 shadow-lg">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
