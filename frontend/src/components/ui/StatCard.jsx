import Card from "./Card.jsx";

const ICON_COLORS = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
};

/** Compact metric card — a single number with a label and trend icon. */
const StatCard = ({ label, value, icon: Icon, accent = "primary", trend }) => {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ICON_COLORS[accent]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-caption">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-h3">{value}</span>
          {trend && <span className="text-xs font-semibold text-secondary">{trend}</span>}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
