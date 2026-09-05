import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import Button from "../ui/Button.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import Avatar from "../ui/Avatar.jsx";
import { usePWAInstall } from "../../hooks/usePWAInstall.js";
import { useAuthStore } from "../../stores/authStore.js";
import { getRoleHomePath } from "../../utils/roleNavigation.js";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
];

const navLinkClasses = ({ isActive }) =>
  `text-nav transition-colors hover:text-primary ${isActive ? "text-primary" : "text-text-body"}`;

/** Public site navbar: desktop inline nav, mobile hamburger + drawer. Reflects real auth state. */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { canInstall, promptInstall } = usePWAInstall();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/home");
  };

  return (
    <header className="glass sticky top-0 z-40">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link to="/home" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {canInstall && (
            <Button variant="outline" size="sm" onClick={promptInstall}>
              Install App
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <Button to={getRoleHomePath(user.role)} variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Button>
              <Link to="/profile" aria-label="View profile">
                <Avatar name={user.fullName} src={user.profileImage} size="sm" />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="outline" size="sm">
                Login
              </Button>
              <Button to="/register" variant="primary" size="sm">
                Register
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-strong md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="animate-slide-down border-t border-border px-4 pb-4 md:hidden"
        >
          <div className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="flex items-center justify-between py-1">
              <span className="text-small text-text-muted">Theme</span>
              <ThemeToggle />
            </div>

            {canInstall && (
              <Button variant="outline" onClick={promptInstall} className="w-full">
                Install App
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <Button
                  to={getRoleHomePath(user.role)}
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Button>
                <Button
                  to="/profile"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Button>
                <Button to="/register" variant="primary" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
