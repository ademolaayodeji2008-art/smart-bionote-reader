/** Shared border/focus classes for text-like form fields (Input, PasswordInput, Select, Textarea). */
export const fieldBorderClasses = (hasError) =>
  hasError ? "border-danger focus:border-danger" : "border-border focus:border-primary";
