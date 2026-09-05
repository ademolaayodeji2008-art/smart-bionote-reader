import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import FormLabel from "./FormLabel.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import { fieldBorderClasses } from "./formFieldStyles.js";

/** Native <select> styled to match the rest of the form system. */
const Select = forwardRef(
  ({ id, label, error, required = false, options = [], placeholder, className = "", ...rest }, ref) => {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={className}>
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            defaultValue=""
            className={`w-full appearance-none rounded-xl border bg-surface px-4 py-2.5 pr-10 text-body text-text-strong
              transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40
              disabled:cursor-not-allowed disabled:opacity-50 ${fieldBorderClasses(Boolean(error))}`}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
        </div>
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
