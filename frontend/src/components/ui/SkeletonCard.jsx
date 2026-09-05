import Skeleton from "./Skeleton.jsx";
import SkeletonText from "./SkeletonText.jsx";

/** Loading placeholder shaped like a Card (thumbnail + text lines). */
const SkeletonCard = () => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4" role="status" aria-label="Loading card">
      <Skeleton className="aspect-video w-full" />
      <SkeletonText lines={2} className="mt-4" />
    </div>
  );
};

export default SkeletonCard;
