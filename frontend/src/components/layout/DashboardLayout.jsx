import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import Sidebar from "../navigation/Sidebar.jsx";
import MobileBottomNav from "../navigation/MobileBottomNav.jsx";
import IconButton from "../ui/IconButton.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useAuthStore } from "../../stores/authStore.js";

/**
 * Shared shell for every role's dashboard: a persistent sidebar on large
 * screens (collapsing into a slide-in drawer below `lg`), a top header,
 * and a touch-friendly bottom tab bar on mobile. Route content renders
 * through <Outlet />.
 */
const DashboardLayout = ({ roleLabel, navItems, bottomNavItems }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const tabItems = bottomNavItems || navItems.slice(0, 5);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar roleLabel={roleLabel} items={navItems} />
        </div>
      </aside>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-dark/50"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-slide-up absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-surface shadow-2xl">
            <div className="flex justify-end p-3">
              <IconButton icon={X} label="Close menu" onClick={() => setIsDrawerOpen(false)} />
            </div>
            <Sidebar roleLabel={roleLabel} items={navItems} onNavigate={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <IconButton
              icon={Menu}
              label="Open menu"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden"
            />
            <div>
              <p className="text-caption">{roleLabel} dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/profile" aria-label="View profile">
              <Avatar name={user?.fullName} src={user?.profileImage} size="sm" />
            </Link>
            <IconButton icon={LogOut} label="Log out" onClick={handleLogout} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
          <Outlet />
        </main>

        <MobileBottomNav items={tabItems} />
      </div>
    </div>
  );
};

export default DashboardLayout;
