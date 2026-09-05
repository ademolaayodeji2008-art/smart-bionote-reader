import { Link } from "react-router-dom";
import LessonThumbnail from "./LessonThumbnail.jsx";
import SubjectBadge from "./SubjectBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import ProgressBar from "./ProgressBar.jsx";

/** Card representing a single lesson in a list/grid. */
const LessonCard = ({ title, subject, icon, status, progress, to = "#" }) => {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <LessonThumbnail icon={icon} accent="primary" />
      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="text-h4 line-clamp-2 group-hover:text-primary">{title}</h3>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SubjectBadge subject={subject} />
        <StatusBadge status={status} />
      </div>
      {typeof progress === "number" && (
        <ProgressBar value={progress} className="mt-4" showValue />
      )}
    </Link>
  );
};

export default LessonCard;
