import { CheckCircle2, Circle, Clock } from "lucide-react";
import Badge from "./Badge.jsx";

const STATUS_CONFIG = {
  completed: { variant: "secondary", icon: CheckCircle2, label: "Completed" },
  "in-progress": { variant: "accent", icon: Clock, label: "In progress" },
  "not-started": { variant: "neutral", icon: Circle, label: "Not started" },
};

/** Semantic wrapper around Badge for showing a lesson/quiz completion status. */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["not-started"];

  return (
    <Badge variant={config.variant} icon={config.icon}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
