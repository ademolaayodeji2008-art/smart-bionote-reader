/**
 * Standard surface card — the base building block the other card
 * variants (Feature, Lesson, Progress, Stat) are composed from.
 */
const Card = ({ children, hoverable = false, className = "", as: Tag = "div", ...rest }) => {
  return (
    <Tag
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-200
        ${hoverable ? "hover:shadow-lg" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Card;
