import { Routes, Route } from "react-router-dom";
import { BarChart3, ClipboardList, FileText, GraduationCap, Library, Settings, UserCog, Users } from "lucide-react";

import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import StudentDashboardLayout from "../layouts/StudentDashboardLayout.jsx";
import TeacherDashboardLayout from "../layouts/TeacherDashboardLayout.jsx";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import GuestRoute from "./GuestRoute.jsx";
import SubscriptionGuard from "./SubscriptionGuard.jsx";

import SplashScreen from "../pages/SplashScreen.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import FeaturesPage from "../pages/FeaturesPage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "../pages/VerifyEmailPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import NotFound from "../pages/NotFound.jsx";
import PlaceholderPage from "../pages/shared/PlaceholderPage.jsx";

import StudentDashboardHome from "../pages/student/StudentDashboardHome.jsx";
import StudentLessons from "../pages/student/StudentLessons.jsx";
import LessonDetail from "../pages/student/LessonDetail.jsx";
import SmartReader from "../pages/student/SmartReader.jsx";
import DrawingLessonViewer from "../pages/student/DrawingLessonViewer.jsx";
import StudentQuiz from "../pages/student/StudentQuiz.jsx";
import StudentProgress from "../pages/student/StudentProgress.jsx";
import StudentLeaderboard from "../pages/student/StudentLeaderboard.jsx";
import StudentAchievements from "../pages/student/StudentAchievements.jsx";
import StudentSubscription from "../pages/student/StudentSubscription.jsx";
import StudentSubscriptionHistory from "../pages/student/StudentSubscriptionHistory.jsx";
import PaymentResult from "../pages/student/PaymentResult.jsx";
import StudentDownloads from "../pages/student/StudentDownloads.jsx";

import TeacherDashboardHome from "../pages/teacher/TeacherDashboardHome.jsx";
import TeacherLessons from "../pages/teacher/TeacherLessons.jsx";
import TeacherCreateLesson from "../pages/teacher/TeacherCreateLesson.jsx";
import TeacherEditLesson from "../pages/teacher/TeacherEditLesson.jsx";
import TeacherStudents from "../pages/teacher/TeacherStudents.jsx";
import TeacherQuizzes from "../pages/teacher/TeacherQuizzes.jsx";
import TeacherProfilePage from "../pages/teacher/TeacherProfilePage.jsx";
import TeacherQuestionBuilder from "../pages/teacher/TeacherQuestionBuilder.jsx";

import StudentProfilePage from "../pages/student/StudentProfilePage.jsx";

import AdminDashboardHome from "../pages/admin/AdminDashboardHome.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminTeachers from "../pages/admin/AdminTeachers.jsx";
import AdminSubjects from "../pages/admin/AdminSubjects.jsx";
import AdminLessons from "../pages/admin/AdminLessons.jsx";
import AdminClasses from "../pages/admin/AdminClasses.jsx";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs.jsx";
import AdminSubscriptions from "../pages/admin/AdminSubscriptions.jsx";
import AdminInviteTeachers from "../pages/admin/AdminInviteTeachers.jsx";
import AcceptInvitationPage from "../pages/AcceptInvitationPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />

      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Login/register redirect an already-authenticated user to their dashboard */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Password recovery / email verification stay reachable regardless of auth state */}
      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Teacher invitation acceptance — public, no layout wrapper needed */}
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

      {/* Student dashboard */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboardLayout />}>
          {/* Free routes — always accessible */}
          <Route index element={<StudentDashboardHome />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="subscription" element={<StudentSubscription />} />
          <Route path="subscription/history" element={<StudentSubscriptionHistory />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" description="Manage your account preferences." icon={Settings} />} />

          {/* Premium routes — require active subscription */}
          <Route path="lessons" element={<SubscriptionGuard><StudentLessons /></SubscriptionGuard>} />
          <Route path="lessons/:id" element={<SubscriptionGuard><LessonDetail /></SubscriptionGuard>} />
          <Route path="lessons/:id/quiz" element={<SubscriptionGuard><StudentQuiz /></SubscriptionGuard>} />
          <Route path="library" element={<SubscriptionGuard><PlaceholderPage title="Library" description="Browse all learning materials shared with you." icon={Library} /></SubscriptionGuard>} />
          <Route path="quizzes" element={<SubscriptionGuard><PlaceholderPage title="Quizzes" description="Quizzes tied to your lessons will appear here." icon={ClipboardList} /></SubscriptionGuard>} />
          <Route path="progress" element={<SubscriptionGuard><StudentProgress /></SubscriptionGuard>} />
          <Route path="leaderboard" element={<SubscriptionGuard><StudentLeaderboard /></SubscriptionGuard>} />
          <Route path="achievements" element={<SubscriptionGuard><StudentAchievements /></SubscriptionGuard>} />
          <Route path="downloads" element={<SubscriptionGuard><StudentDownloads /></SubscriptionGuard>} />
        </Route>
      </Route>

      {/* Full-screen readers — premium, require subscription */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student/read/:id" element={<SubscriptionGuard><SmartReader /></SubscriptionGuard>} />
        <Route path="/student/drawing/:id" element={<SubscriptionGuard><DrawingLessonViewer /></SubscriptionGuard>} />
        <Route path="/student/payment/result" element={<PaymentResult />} />
      </Route>

      {/* Teacher dashboard */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherDashboardLayout />}>
          <Route index element={<TeacherDashboardHome />} />
          <Route path="lessons" element={<TeacherLessons />} />
          <Route path="create-lesson" element={<TeacherCreateLesson />} />
          <Route path="lessons/:id/edit" element={<TeacherEditLesson />} />
          <Route path="lessons/:id/questions" element={<TeacherQuestionBuilder />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="quizzes" element={<TeacherQuizzes />} />
          <Route path="profile" element={<TeacherProfilePage />} />
          <Route
            path="analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                description="Class-wide performance insights will appear here."
                icon={BarChart3}
              />
            }
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" description="Manage your teacher account preferences." icon={Settings} />}
          />
        </Route>
      </Route>

      {/* Admin dashboard */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="invite-teachers" element={<AdminInviteTeachers />} />
          <Route
            path="students"
            element={<PlaceholderPage title="Students" description="Manage student accounts." icon={UserCog} />}
          />
          <Route
            path="analytics"
            element={<PlaceholderPage title="Analytics" description="Platform-wide usage and performance data." icon={BarChart3} />}
          />
          <Route
            path="reports"
            element={<PlaceholderPage title="Reports" description="Generated reports will appear here." icon={FileText} />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" description="Manage platform-wide settings." icon={Settings} />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
