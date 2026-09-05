import { HeartHandshake, Lightbulb, ShieldCheck } from "lucide-react";
import Section from "../components/layout/Section.jsx";
import Card from "../components/ui/Card.jsx";
import { APP_DESCRIPTION, APP_SLOGAN } from "../utils/constants.js";

const VALUES = [
  {
    icon: Lightbulb,
    title: "Clarity first",
    description: "Every lesson is built to be understood, not just consumed.",
  },
  {
    icon: HeartHandshake,
    title: "Built with teachers",
    description: "Designed around how teachers actually create and share material.",
  },
  {
    icon: ShieldCheck,
    title: "Trustworthy by design",
    description: "A simple, dependable experience students and teachers can rely on.",
  },
];

/** About page — mission and guiding values behind Smart Bionote Reader. */
const AboutPage = () => {
  return (
    <div>
      <Section eyebrow="About" title="Why Smart Bionote Reader exists" align="center">
        <p className="text-body mx-auto max-w-2xl text-center text-text-muted">
          {APP_DESCRIPTION} Our goal is simple: {APP_SLOGAN.toLowerCase()} — and make every step
          of that process feel guided, encouraging, and easy to understand.
        </p>
      </Section>

      <Section eyebrow="Our Values" title="What guides how we build" className="bg-surface-muted/40">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="text-center sm:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-0" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-h4 mt-4">{title}</h3>
              <p className="text-small mt-1.5 text-text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default AboutPage;
