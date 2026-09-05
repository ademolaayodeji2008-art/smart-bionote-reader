import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ToastContext } from "./ToastContext.js";
import Toast from "../components/ui/Toast.jsx";

const DEFAULT_DURATION = 4000;

/** Hosts the toast queue and renders it in a fixed-position portal. */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type, message, duration = DEFAULT_DURATION) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, message }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      success: (message, duration) => showToast("success", message, duration),
      error: (message, duration) => showToast("error", message, duration),
      warning: (message, duration) => showToast("warning", message, duration),
      info: (message, duration) => showToast("info", message, duration),
      dismiss: dismissToast,
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:right-6 sm:left-auto">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
              <Toast type={toast.type} message={toast.message} onDismiss={() => dismissToast(toast.id)} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};
