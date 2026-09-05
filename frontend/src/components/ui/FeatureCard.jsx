import Card from "./Card.jsx";

/** Marketing card used on the landing page to preview a platform feature. */
const FeatureCard = ({ icon: Icon, title, description, accent = "primary" }) => {
  const iconWrapClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <Card hoverable className="animate-fade-in-up h-full">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconWrapClasses[accent]}`}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-h4 mb-2">{title}</h3>
      <p className="text-small text-text-muted">{description}</p>
    </Card>
  );
};

export default FeatureCard;
