/** Accessible label for a form field, paired via `htmlFor`. */
const FormLabel = ({ htmlFor, children, required = false, className = "" }) => {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-small font-medium text-text-strong ${className}`}>
      {children}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
};

export default FormLabel;
