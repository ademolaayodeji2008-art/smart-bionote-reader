import Spinner from "./Spinner.jsx";

/** Full-viewport loading state for route-level suspense/async boundaries. */
const FullPageLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-small text-text-muted">{label}</p>
    </div>
  );
};

export default FullPageLoader;
