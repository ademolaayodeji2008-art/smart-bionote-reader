import { useEffect, useState } from "react";
import { PWAInstallContext } from "./PWAInstallContext.js";

/**
 * Captures the browser's `beforeinstallprompt` event so an "Install App"
 * action can be triggered later from anywhere in the UI.
 */
export const PWAInstallProvider = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const value = {
    canInstall: Boolean(installPrompt),
    isInstalled,
    promptInstall,
  };

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
};
