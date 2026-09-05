const SIZES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

const COLORS = {
  primary: "border-primary/25 border-t-primary",
  white: "border-white/30 border-t-white",
  current: "border-current/25 border-t-current",
};

/** Accessible loading indicator used for splash screens and async states. */
const Spinner = ({ size = "md", color = "primary", className = "" }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SIZES[size]} ${COLORS[color]} animate-spin rounded-full ${className}`}
    />
  );
};

export default Spinner;
