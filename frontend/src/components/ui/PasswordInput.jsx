import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormLabel from "./FormLabel.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import { fieldBorderClasses } from "./formFieldStyles.js";

const FIELD_BASE =
  "w-full rounded-xl border bg-surface px-4 py-2.5 pr-11 text-body text-text-strong placeholder:text-text-muted " +
  "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/** Password field with a show/hide visibility toggle. */
const PasswordInput = forwardRef(
  ({ id, label, error, required = false, className = "", ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={className}>
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={`${FIELD_BASE} ${fieldBorderClasses(Boolean(error))}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-muted hover:text-text-strong"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
