import { Inbox } from "lucide-react";
import Button from "./Button.jsx";

/** Friendly placeholder for lists/pages with no content yet. */
const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, actionTo, className = "" }) => {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-text-muted" aria-hidden="true">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-h4">{title}</h3>
      {description && <p className="text-small mt-1.5 max-w-sm text-text-muted">{description}</p>}
      {actionLabel && actionTo && (
        <Button to={actionTo} variant="primary" size="sm" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
