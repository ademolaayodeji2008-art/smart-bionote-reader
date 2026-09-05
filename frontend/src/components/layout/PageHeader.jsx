/** Consistent heading block for dashboard pages: title, description, and an optional action slot. */
const PageHeader = ({ title, description, action, className = "" }) => {
  return (
    <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-h2">{title}</h1>
        {description && <p className="text-small mt-1 text-text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
