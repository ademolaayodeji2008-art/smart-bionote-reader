const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/25",
  outline: "border border-border text-text-body hover:bg-surface-muted",
  ghost: "bg-transparent text-text-body hover:bg-surface-muted",
};

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

/**
 * Square, icon-only button. Always requires an accessible `label` since
 * there is no visible text for assistive technology to read.
 */
const IconButton = ({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  ...rest
}) => {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none
        disabled:opacity-50 active:scale-95 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
    </button>
  );
};

export default IconButton;
