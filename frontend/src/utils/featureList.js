import { BookOpen, PenTool, ClipboardCheck, TrendingUp, Flame, Trophy } from "lucide-react";

/**
 * Marketing copy for the platform's future core features — shown on the
 * landing page and the dedicated /features page. Visual only; none of
 * this functionality is implemented yet.
 */
export const CORE_FEATURES = [
  {
    icon: BookOpen,
    title: "Smart Note Reading",
    description: "Listen to learning materials while following along with the text.",
    accent: "primary",
  },
  {
    icon: PenTool,
    title: "Drawing Lessons",
    description: "Learn drawings step by step with teacher explanations.",
    accent: "secondary",
  },
  {
    icon: ClipboardCheck,
    title: "Interactive Quizzes",
    description: "Test your understanding after each lesson.",
    accent: "accent",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Keep track of your learning progress.",
    accent: "primary",
  },
  {
    icon: Flame,
    title: "Study Streaks",
    description: "Build consistent learning habits.",
    accent: "accent",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Compete with classmates and celebrate progress.",
    accent: "secondary",
  },
];
