import { User } from "lucide-react";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Circular avatar — shows an image, initials, or a fallback icon. */
const Avatar = ({ src, name, size = "md", className = "" }) => {
  const sizeClasses = SIZES[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name}'s avatar` : ""}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
      />
    );
  }

  if (name) {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${sizeClasses} ${className}`}
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-surface-muted text-text-muted ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      <User className="h-1/2 w-1/2" />
    </span>
  );
};

export default Avatar;
