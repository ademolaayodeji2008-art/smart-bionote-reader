import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

const OPTIONS = [
  { mode: "light", icon: Sun, label: "Light theme" },
  { mode: "system", icon: Monitor, label: "System theme" },
  { mode: "dark", icon: Moon, label: "Dark theme" },
];

/** Segmented control for switching between light, dark, and system theme. */
const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-muted p-1 ${className}`}
    >
      {OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => setTheme(mode)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2
              ${isActive ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text-strong"}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
