import { forwardRef } from "react";

/** Accessible radio button paired with its own visible label. */
const Radio = forwardRef(({ id, label, className = "", ...rest }, ref) => {
  return (
    <label htmlFor={id} className={`flex items-center gap-2.5 text-small text-text-body ${className}`}>
      <input
        id={id}
        ref={ref}
        type="radio"
        className="h-4.5 w-4.5 border-border text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 accent-primary"
        {...rest}
      />
      {label}
    </label>
  );
});

Radio.displayName = "Radio";

export default Radio;
