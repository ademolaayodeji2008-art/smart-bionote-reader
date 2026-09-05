/** Inline validation error shown beneath a form field. */
const ErrorMessage = ({ children, id }) => {
  if (!children) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-danger">
      {children}
    </p>
  );
};

export default ErrorMessage;
