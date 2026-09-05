import { PenSquare, BookOpenCheck, BarChart3 } from "lucide-react";
import Section from "../../components/layout/Section.jsx";
import Card from "../../components/ui/Card.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

const STEPS = [
  {
    number: "1",
    icon: PenSquare,
    color: "bg-primary/10 text-primary",
    ring: "bg-primary",
    title: "Teacher Creates a Lesson",
    description: "Teachers publish Biology notes, step-by-step drawings, and quizzes for their class in minutes.",
  },
  {
    number: "2",
    icon: BookOpenCheck,
    color: "bg-secondary/10 text-secondary",
    ring: "bg-secondary",
    title: "Student Reads, Listens & Learns",
    description: "Students follow along with synchronized text and the Smart Reader's built-in reading voice at their own pace.",
  },
  {
    number: "3",
    icon: BarChart3,
    color: "bg-accent/10 text-accent",
    ring: "bg-accent",
    title: "Track Progress & Earn Rewards",
    description: "Quizzes confirm understanding while XP, streaks, and leaderboards keep motivation high.",
  },
];

const HowItWorksSection = () => {
  const ref = useScrollReveal();

  return (
    <Section eyebrow="How It Works" title="Learning in three simple steps">
      <div ref={ref} className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">

        {/* Connecting line between steps (desktop only) */}
        <div
          className="reveal pointer-events-none absolute top-8 left-[calc(16.7%+20px)] right-[calc(16.7%+20px)] hidden h-0.5 sm:block"
          aria-hidden="true"
          style={{
            background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)",
            opacity: 0.25,
          }}
        />

        {STEPS.map(({ number, icon: Icon, color, ring, title, description }, idx) => (
          <div key={number} className={`reveal reveal-delay-${idx + 1}`}>
            <Card className="relative pt-10 text-center sm:text-left h-full">
              {/* Step number badge */}
              <span
                className={`absolute -top-4 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full ${ring} text-sm font-bold text-white shadow-lg sm:left-6 sm:translate-x-0`}
                aria-hidden="true"
              >
                {number}
              </span>

              {/* Pulsing ring behind icon */}
              <div className="relative mx-auto mt-2 h-14 w-14 sm:mx-0">
                <div className={`absolute inset-0 rounded-xl ${ring} animate-pulse opacity-15`} />
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${color}`} aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className="text-h4 mt-4">{title}</h3>
              <p className="text-small mt-1.5 text-text-muted">{description}</p>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorksSection;
