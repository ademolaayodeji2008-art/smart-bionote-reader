import { forwardRef } from "react";
import FormLabel from "./FormLabel.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import { fieldBorderClasses } from "./formFieldStyles.js";

/** Multi-line text field matching the Input component's visual style. */
const Textarea = forwardRef(
  ({ id, label, error, required = false, rows = 4, className = "", ...rest }, ref) => {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={className}>
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full resize-y rounded-xl border bg-surface px-4 py-2.5 text-body text-text-strong
            placeholder:text-text-muted transition-colors duration-150 focus:outline-none
            focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50
            ${fieldBorderClasses(Boolean(error))}`}
          {...rest}
        />
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
