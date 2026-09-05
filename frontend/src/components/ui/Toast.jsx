import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";

const CONFIG = {
  success: { icon: CheckCircle2, classes: "border-secondary/30 text-secondary" },
  error: { icon: XCircle, classes: "border-danger/30 text-danger" },
  warning: { icon: AlertTriangle, classes: "border-accent/30 text-accent" },
  info: { icon: Info, classes: "border-primary/30 text-primary" },
};

/** Single toast notification. Rendered by ToastProvider's container. */
const Toast = ({ type = "info", message, onDismiss }) => {
  const { icon: Icon, classes } = CONFIG[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-slide-up flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-4 shadow-lg ${classes}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="text-small flex-1 text-text-strong">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-text-muted hover:text-text-strong"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
