const COLORS = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
};

/** Horizontal progress indicator. `value` is a percentage from 0–100. */
const ProgressBar = ({ value, color = "primary", label, showValue = false, className = "" }) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-small">
          {label && <span className="text-text-body">{label}</span>}
          {showValue && <span className="font-semibold text-text-strong">{clamped}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${COLORS[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
