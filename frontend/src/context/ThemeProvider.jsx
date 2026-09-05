import { useEffect, useMemo, useState } from "react";
import { ThemeContext, THEME_STORAGE_KEY } from "./ThemeContext.js";

const getSystemPrefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

const getStoredTheme = () => {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(THEME_STORAGE_KEY) || "system";
};

const applyResolvedTheme = (resolvedTheme) => {
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
};

/**
 * Provides `theme` ("light" | "dark" | "system") and the currently rendered
 * `resolvedTheme` ("light" | "dark"), and keeps the `.dark` class on <html>
 * in sync — including live updates when `theme === "system"` and the OS
 * preference changes.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    getStoredTheme() === "dark" || (getStoredTheme() === "system" && getSystemPrefersDark())
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const resolve = () => (theme === "system" ? (getSystemPrefersDark() ? "dark" : "light") : theme);

    const updateResolved = () => {
      const next = resolve();
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };

    updateResolved();

    if (theme !== "system") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateResolved);
    return () => mediaQuery.removeEventListener("change", updateResolved);
  }, [theme]);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
