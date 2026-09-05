/**
 * MOCK DATA — for visual demonstration of lesson lists (student library,
 * teacher lesson management). Not connected to any backend/API.
 */
import { BookOpen, Calculator, FlaskConical, Globe, Palette } from "lucide-react";

export const mockLessons = [
  { id: "l1", title: "Fractions & Decimals", subject: "Mathematics", icon: Calculator, status: "in-progress", progress: 62 },
  { id: "l2", title: "States of Matter", subject: "Science", icon: FlaskConical, status: "completed", progress: 100 },
  { id: "l3", title: "Creative Writing Basics", subject: "English", icon: BookOpen, status: "not-started", progress: 0 },
  { id: "l4", title: "Ancient Civilizations", subject: "History", icon: Globe, status: "not-started", progress: 0 },
  { id: "l5", title: "Color Theory Basics", subject: "Art", icon: Palette, status: "not-started", progress: 0 },
  { id: "l6", title: "Introduction to Geometry", subject: "Mathematics", icon: Calculator, status: "completed", progress: 100 },
];
