/** Base shimmering placeholder block for loading states. */
const Skeleton = ({ className = "" }) => {
  return <div className={`animate-pulse rounded-lg bg-surface-muted ${className}`} aria-hidden="true" />;
};

export default Skeleton;
