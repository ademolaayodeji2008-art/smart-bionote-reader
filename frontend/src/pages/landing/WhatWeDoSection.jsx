import { BookOpen, Headphones, TrendingUp, ClipboardCheck } from "lucide-react";
import Section from "../../components/layout/Section.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

const POINTS = [
  {
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
    title: "Notes that teach",
    description: "Teacher-created Biology notes structured for clear, focused reading with synchronized highlighting.",
  },
  {
    icon: Headphones,
    color: "bg-secondary/10 text-secondary",
    title: "Audio that guides",
    description: "The Smart Reader reads every lesson aloud using your device's built-in voice — no extra app needed.",
  },
  {
    icon: ClipboardCheck,
    color: "bg-accent/10 text-accent",
    title: "Quizzes that confirm",
    description: "Quick checks after each lesson to confirm understanding and reveal the correct answers immediately.",
  },
  {
    icon: TrendingUp,
    color: "bg-primary/10 text-primary",
    title: "Progress that motivates",
    description: "XP, streaks, badges, and leaderboards keep students engaged and coming back every day.",
  },
];

const WhatWeDoSection = () => {
  const ref = useScrollReveal();

  return (
    <Section
      eyebrow="What Smart Bionote Reader Does"
      title="One platform for how students actually study"
      description="Reading, listening, and checking understanding — brought together instead of scattered across apps."
    >
      <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, color, title, description }, idx) => (
          <div
            key={title}
            className={`reveal reveal-delay-${idx + 1} group rounded-2xl border border-border bg-surface p-6 text-center sm:text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30`}
          >
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110 sm:mx-0`} aria-hidden="true">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-h4 mt-4">{title}</h3>
            <p className="text-small mt-1.5 text-text-muted">{description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default WhatWeDoSection;
