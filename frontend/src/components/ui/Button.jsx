import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-button " +
  "transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const VARIANTS = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30",
  secondary:
    "bg-secondary text-white shadow-md shadow-secondary/25 hover:bg-secondary-hover hover:shadow-lg hover:shadow-secondary/30",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
  ghost: "bg-transparent text-text-body hover:bg-surface-muted hover:text-text-strong",
  danger:
    "bg-danger text-white shadow-md shadow-danger/25 hover:bg-danger-hover hover:shadow-lg hover:shadow-danger/30",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Reusable call-to-action button. Renders a <Link> when `to` is given, an
 * <a> when `href` is given, otherwise a native <button>. Supports a
 * `loading` state that disables interaction and shows a spinner.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  ...rest
}) => {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={isDisabled}
        onClick={(event) => isDisabled && event.preventDefault()}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-disabled={isDisabled} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={isDisabled} aria-busy={loading} {...rest}>
      {content}
    </button>
  );
};

export default Button;
