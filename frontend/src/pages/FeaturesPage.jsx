import Section from "../components/layout/Section.jsx";
import FeatureCard from "../components/ui/FeatureCard.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { CORE_FEATURES } from "../utils/featureList.js";

/** Dedicated page expanding on the feature previews shown on the landing page. */
const FeaturesPage = () => {
  return (
    <div>
      <Section
        eyebrow="Features"
        title="Built for how students actually learn"
        description="Every feature below is designed to make studying feel guided, not overwhelming. These are previews of what's coming to Smart Bionote Reader."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      <Section>
        <Card className="glass flex flex-col items-center gap-5 p-10 text-center">
          <h2 className="text-h2">See it in action</h2>
          <p className="text-body max-w-lg text-text-muted">
            Create a free account to explore the Smart Bionote Reader experience as it grows.
          </p>
          <Button to="/register" variant="primary">
            Get Started
          </Button>
        </Card>
      </Section>
    </div>
  );
};

export default FeaturesPage;
