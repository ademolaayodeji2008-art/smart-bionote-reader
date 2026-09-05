import { NavLink } from "react-router-dom";
import Logo from "../ui/Logo.jsx";

/**
 * Vertical navigation list shared by every dashboard role. `items` is
 * `[{ label, to, icon, end }]`. Used both as the persistent desktop rail
 * and as the content of the mobile drawer (see DashboardLayout).
 */
const Sidebar = ({ roleLabel, items, onNavigate, className = "" }) => {
  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="border-b border-border px-5 py-5">
        <Logo size="sm" />
        <p className="text-caption mt-2">{roleLabel}</p>
      </div>

      <nav aria-label={`${roleLabel} navigation`} className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-nav transition-colors duration-150 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-body hover:bg-surface-muted hover:text-text-strong"
              }`
            }
          >
            <Icon className="h-[1.1rem] w-[1.1rem] shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
