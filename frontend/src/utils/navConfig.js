import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardList,
  TrendingUp,
  Trophy,
  Award,
  Settings,
  Users,
  FilePlus,
  BarChart3,
  GraduationCap,
  UserCog,
  FileText,
  Download,
  CreditCard,
  DollarSign,
} from "lucide-react";

/**
 * Sidebar + bottom-nav definitions for each dashboard role. These are real
 * navigation targets (every route below has a placeholder page), not mock
 * demo content.
 */
export const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard, end: true },
  { label: "My Lessons", to: "/student/lessons", icon: BookOpen },
  { label: "Library", to: "/student/library", icon: Library },
  { label: "Quizzes", to: "/student/quizzes", icon: ClipboardList },
  { label: "Progress", to: "/student/progress", icon: TrendingUp },
  { label: "Leaderboard", to: "/student/leaderboard", icon: Trophy },
  { label: "Achievements", to: "/student/achievements", icon: Award },
  { label: "Downloads", to: "/student/downloads", icon: Download },
  { label: "Subscription", to: "/student/subscription", icon: CreditCard },
  { label: "Profile", to: "/student/profile", icon: Settings },
];

export const STUDENT_BOTTOM_NAV_ITEMS = [
  { label: "Home", to: "/student", icon: LayoutDashboard, end: true },
  { label: "Lessons", to: "/student/lessons", icon: BookOpen },
  { label: "Progress", to: "/student/progress", icon: TrendingUp },
  { label: "Leaders", to: "/student/leaderboard", icon: Trophy },
  { label: "Profile", to: "/student/profile", icon: Settings },
];

export const TEACHER_NAV_ITEMS = [
  { label: "Dashboard", to: "/teacher", icon: LayoutDashboard, end: true },
  { label: "Lessons", to: "/teacher/lessons", icon: BookOpen },
  { label: "Create Lesson", to: "/teacher/create-lesson", icon: FilePlus },
  { label: "Students", to: "/teacher/students", icon: Users },
  { label: "Quizzes", to: "/teacher/quizzes", icon: ClipboardList },
  { label: "Analytics", to: "/teacher/analytics", icon: BarChart3 },
  { label: "Profile", to: "/teacher/profile", icon: Settings },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Teachers", to: "/admin/teachers", icon: GraduationCap },
  { label: "Invite Teachers", to: "/admin/invite-teachers", icon: GraduationCap },
  { label: "Students", to: "/admin/students", icon: UserCog },
  { label: "Lessons", to: "/admin/lessons", icon: BookOpen },
  { label: "Subjects", to: "/admin/subjects", icon: BookOpen },
  { label: "Classes", to: "/admin/classes", icon: BarChart3 },
  { label: "Subscriptions", to: "/admin/subscriptions", icon: DollarSign },
  { label: "Audit Log", to: "/admin/audit-logs", icon: FileText },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];
