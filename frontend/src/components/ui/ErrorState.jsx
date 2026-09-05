import { AlertOctagon } from "lucide-react";
import Button from "./Button.jsx";

/**
 * Friendly error placeholder with a retry action. Never surfaces raw
 * technical error details to the end user.
 */
const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-border px-6 py-14 text-center ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger" aria-hidden="true">
        <AlertOctagon className="h-7 w-7" />
      </div>
      <h3 className="text-h4">{title}</h3>
      <p className="text-small mt-1.5 max-w-sm text-text-muted">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-6">
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
