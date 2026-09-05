import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const CONFIG = {
  success: { icon: CheckCircle2, classes: "border-secondary/30 bg-secondary/5 text-secondary" },
  error: { icon: XCircle, classes: "border-danger/30 bg-danger/5 text-danger" },
  warning: { icon: AlertTriangle, classes: "border-accent/30 bg-accent/5 text-accent" },
  info: { icon: Info, classes: "border-primary/30 bg-primary/5 text-primary" },
};

/** Inline banner for persistent page-level feedback (as opposed to a transient Toast). */
const Alert = ({ type = "info", title, children, className = "" }) => {
  const { icon: Icon, classes } = CONFIG[type];

  return (
    <div role="alert" className={`flex gap-3 rounded-xl border p-4 ${classes} ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="text-small text-text-body">
        {title && <p className="font-semibold text-text-strong">{title}</p>}
        {children}
      </div>
    </div>
  );
};

export default Alert;
