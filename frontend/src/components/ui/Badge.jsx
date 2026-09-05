const VARIANTS = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-surface-muted text-text-muted",
};

/** Small pill used for tags, subjects, and statuses. */
const Badge = ({ children, variant = "neutral", icon: Icon, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
