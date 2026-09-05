import { NavLink } from "react-router-dom";

/**
 * Touch-friendly bottom tab bar shown on small screens inside dashboard
 * layouts. `items` is `[{ label, to, icon, end }]` — kept short (4-5 items)
 * so each tab stays comfortably tappable.
 */
const MobileBottomNav = ({ items }) => {
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? "text-primary" : "text-text-muted"
            }`
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
