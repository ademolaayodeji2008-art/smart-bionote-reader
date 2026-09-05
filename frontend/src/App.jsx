import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { ToastProvider } from "./context/ToastProvider.jsx";
import { PWAInstallProvider } from "./context/PWAInstallProvider.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useAuthStore } from "./stores/authStore.js";

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <PWAInstallProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PWAInstallProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
