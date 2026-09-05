import { useContext } from "react";
import { PWAInstallContext } from "../context/PWAInstallContext.js";

/**
 * Exposes install-prompt state and the `promptInstall` action to any component.
 */
export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);

  if (!context) {
    throw new Error("usePWAInstall must be used within a PWAInstallProvider");
  }

  return context;
};
