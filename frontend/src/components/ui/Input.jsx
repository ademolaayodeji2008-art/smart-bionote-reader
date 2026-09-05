import { forwardRef } from "react";
import FormLabel from "./FormLabel.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import { fieldBorderClasses } from "./formFieldStyles.js";

const FIELD_BASE =
  "w-full rounded-xl border bg-surface px-4 py-2.5 text-body text-text-strong placeholder:text-text-muted " +
  "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Text input with label + inline error message, compatible with
 * react-hook-form's `register()` via forwardRef.
 */
const Input = forwardRef(
  ({ id, label, error, required = false, className = "", ...rest }, ref) => {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={className}>
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`${FIELD_BASE} ${fieldBorderClasses(Boolean(error))}`}
          {...rest}
        />
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
