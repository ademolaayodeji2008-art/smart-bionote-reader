import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/** `items` is `[{ label, to }]`; the last item renders as plain text (current page). */
const Breadcrumbs = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-small text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {isLast || !item.to ? (
                <span aria-current={isLast ? "page" : undefined} className="font-medium text-text-strong">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
