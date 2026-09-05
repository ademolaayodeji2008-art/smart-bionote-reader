import { BookOpen } from "lucide-react";

const GRADIENTS = {
  primary: "from-primary/80 to-primary",
  secondary: "from-secondary/80 to-secondary",
  accent: "from-accent/80 to-accent",
};

/**
 * Placeholder lesson cover — a gradient block with a subject icon,
 * standing in for a real thumbnail image until content upload exists.
 */
const LessonThumbnail = ({ icon: Icon = BookOpen, accent = "primary", className = "" }) => {
  return (
    <div
      className={`flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br text-white ${GRADIENTS[accent]} ${className}`}
      aria-hidden="true"
    >
      <Icon className="h-8 w-8 opacity-90" />
    </div>
  );
};

export default LessonThumbnail;
