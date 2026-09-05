import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, ClipboardList, BarChart3, Clock, PenLine, AlertCircle } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getPlatformStats } from "../../services/adminService.js";

const AdminDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlatformStats()
      .then((r) => setStats(r.data.stats))
      .catch(() => setError("Unable to load platform statistics."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>
  );

  if (error) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-body text-danger">{error}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform-wide overview." />

      {/* Pending approvals alert */}
      {stats.pending.teacherApprovals > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-small text-accent">
            <span className="font-semibold">{stats.pending.teacherApprovals} teacher{stats.pending.teacherApprovals !== 1 ? "s" : ""}</span> awaiting approval.{" "}
            <Button to="/admin/teachers" variant="ghost" size="sm" className="inline-flex p-0 text-accent underline">
              Review now
            </Button>
          </p>
        </div>
      )}

      {/* User stats */}
      <h2 className="text-h4 mb-3">Users</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={stats.users.total} icon={Users} accent="primary" />
        <StatCard label="Students" value={stats.users.students} icon={Users} accent="secondary" />
        <StatCard label="Teachers" value={stats.users.teachers} icon={GraduationCap} accent="accent" />
      </div>

      {/* Lesson stats */}
      <h2 className="text-h4 mb-3">Lessons</h2>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Published" value={stats.lessons.published} icon={BookOpen} accent="secondary" />
        <StatCard label="Drafts" value={stats.lessons.draft} icon={Clock} accent="neutral" />
        <StatCard label="Archived" value={stats.lessons.archived} icon={BookOpen} accent="accent" />
        <StatCard label="Notes" value={stats.lessons.note} icon={BookOpen} accent="primary" />
        <StatCard label="Drawing" value={stats.lessons.drawing} icon={PenLine} accent="accent" />
      </div>

      {/* Content & activity */}
      <h2 className="text-h4 mb-3">Activity</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Questions" value={stats.content.questions} icon={ClipboardList} accent="primary" />
        <StatCard label="Quiz Attempts" value={stats.content.quizAttempts} icon={BarChart3} accent="secondary" />
        <StatCard label="Active Classes" value={stats.classes.active} icon={GraduationCap} accent="accent" />
      </div>

      {/* Quick links */}
      <Card>
        <h2 className="text-h4 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button to="/admin/teachers" variant="outline">Manage Teachers</Button>
          <Button to="/admin/users" variant="outline">Manage Users</Button>
          <Button to="/admin/lessons" variant="outline">Moderate Lessons</Button>
          <Button to="/admin/subjects" variant="outline">Manage Subjects</Button>
          <Button to="/admin/audit-logs" variant="outline">View Audit Log</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
