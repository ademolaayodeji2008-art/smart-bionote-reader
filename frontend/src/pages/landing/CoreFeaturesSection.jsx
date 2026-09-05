import useScrollReveal from "../../hooks/useScrollReveal.js";
import Section from "../../components/layout/Section.jsx";
import FeatureCard from "../../components/ui/FeatureCard.jsx";
import { CORE_FEATURES } from "../../utils/featureList.js";

const CoreFeaturesSection = () => {
  const ref = useScrollReveal();

  return (
    <Section
      id="features"
      eyebrow="Core Learning Features"
      title="Everything students need to thrive"
      description="A single platform that brings reading, listening, and assessment together."
      className="bg-surface-muted/40"
    >
      <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CORE_FEATURES.map((feature, idx) => (
          <div
            key={feature.title}
            className={`reveal reveal-delay-${Math.min(idx + 1, 5)}`}
          >
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
    </Section>
  );
};

export default CoreFeaturesSection;
