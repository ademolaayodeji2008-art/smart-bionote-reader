import { useEffect, useState } from "react";
import { Users, BookOpen, Target, FilePlus, Clock, PenLine } from "lucide-react";
import { useAuthStore } from "../../stores/authStore.js";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { getMyLessons } from "../../services/lessonService.js";
import api from "../../services/api.js";

const TYPE_BADGE = { note: "primary", drawing: "accent" };
const STATUS_BADGE = { published: "secondary", draft: "neutral", archived: "danger" };

const TeacherDashboardHome = () => {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const [stats, setStats] = useState({ totalStudents: 0, publishedLessons: 0, draftLessons: 0, totalClasses: 0 });
  const [recentLessons, setRecentLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonsRes, classesRes] = await Promise.allSettled([
          getMyLessons({ limit: 5, page: 1 }),
          api.get("/classes/my-classes"),
        ]);

        let published = 0, draft = 0, lessons = [];

        if (lessonsRes.status === "fulfilled") {
          const all = lessonsRes.value.data;
          lessons = all.lessons ?? [];

          // Get full counts with separate filtered calls
          const [pubRes, draftRes] = await Promise.allSettled([
            getMyLessons({ limit: 1, status: "published" }),
            getMyLessons({ limit: 1, status: "draft" }),
          ]);
          if (pubRes.status === "fulfilled") published = pubRes.value.data.pagination?.totalItems ?? 0;
          if (draftRes.status === "fulfilled") draft = draftRes.value.data.pagination?.totalItems ?? 0;
        }

        const totalClasses = classesRes.status === "fulfilled"
          ? (classesRes.value.data?.data?.classes?.length ?? 0)
          : 0;

        setStats({ publishedLessons: published, draftLessons: draft, totalClasses });
        setRecentLessons(lessons.slice(0, 5));
      } catch {
        // Show zeros rather than crashing
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return (
    <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's an overview of your teaching activity."
        action={
          <Button to="/teacher/create-lesson" variant="primary">
            <FilePlus className="h-4 w-4" aria-hidden="true" />
            Create Lesson
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Published Lessons" value={stats.publishedLessons} icon={BookOpen} accent="secondary" />
        <StatCard label="Drafts" value={stats.draftLessons} icon={Clock} accent="neutral" />
        <StatCard label="Classes" value={stats.totalClasses} icon={Users} accent="primary" />
        <StatCard label="Drawing Lessons" value={recentLessons.filter(l => l.type === "drawing").length} icon={PenLine} accent="accent" />
      </div>

      {/* Recent lessons */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h4">Recent Lessons</h2>
          <Button to="/teacher/lessons" variant="ghost" size="sm">View all</Button>
        </div>

        {recentLessons.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-body text-text-muted">No lessons yet.</p>
            <Button to="/teacher/create-lesson" variant="primary" className="mt-4">
              <FilePlus className="h-4 w-4" />
              Create your first lesson
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentLessons.map((lesson) => (
              <li key={lesson._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-small font-semibold text-text-strong truncate">{lesson.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={TYPE_BADGE[lesson.type] ?? "neutral"}>
                      {lesson.type}
                    </Badge>
                    <Badge variant={STATUS_BADGE[lesson.status] ?? "neutral"}>
                      {lesson.status}
                    </Badge>
                    {lesson.subject && (
                      <span className="text-caption">{lesson.subject.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    to={`/teacher/lessons/${lesson._id}/edit`}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboardHome;
