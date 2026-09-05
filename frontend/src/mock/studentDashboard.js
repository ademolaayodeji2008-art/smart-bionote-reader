/**
 * MOCK DATA — for visual demonstration of the student dashboard only.
 * Not connected to any backend/API. Replace with real data in a later phase.
 */
import { BookOpen, Calculator, FlaskConical, Palette } from "lucide-react";

export const mockContinueLearning = {
  title: "Fractions & Decimals",
  subject: "Mathematics",
  icon: Calculator,
  progress: 62,
  status: "in-progress",
};

export const mockRecentLessons = [
  { id: "l1", title: "Fractions & Decimals", subject: "Mathematics", icon: Calculator, status: "in-progress", progress: 62 },
  { id: "l2", title: "States of Matter", subject: "Science", icon: FlaskConical, status: "completed", progress: 100 },
  { id: "l3", title: "Creative Writing Basics", subject: "English", icon: BookOpen, status: "not-started", progress: 0 },
];

export const mockRecommendedLessons = [
  { id: "r1", title: "Introduction to Fractions", subject: "Mathematics", icon: Calculator, status: "not-started", progress: 0 },
  { id: "r2", title: "The Water Cycle", subject: "Science", icon: FlaskConical, status: "not-started", progress: 0 },
  { id: "r3", title: "Color Theory Basics", subject: "Art", icon: Palette, status: "not-started", progress: 0 },
];

export const mockStudentStats = {
  studyStreakDays: 12,
  xp: 2450,
  overallProgress: 48,
};
