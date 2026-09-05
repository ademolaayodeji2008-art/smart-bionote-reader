import Skeleton from "./Skeleton.jsx";

/** Stack of skeleton lines standing in for loading paragraph/heading text. */
const SkeletonText = ({ lines = 3, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
};

export default SkeletonText;
