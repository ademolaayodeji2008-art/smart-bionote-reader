import Button from "../components/ui/Button.jsx";

const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-display text-primary">404</h1>
      <p className="text-body mt-4 text-text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button to="/home" variant="primary" className="mt-8">
        Back to home
      </Button>
    </div>
  );
};

export default NotFound;
