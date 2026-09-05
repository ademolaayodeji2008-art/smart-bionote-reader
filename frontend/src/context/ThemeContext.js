import { createContext } from "react";

export const THEME_STORAGE_KEY = "sbr-theme";
export const THEME_MODES = ["light", "dark", "system"];

export const ThemeContext = createContext(null);
