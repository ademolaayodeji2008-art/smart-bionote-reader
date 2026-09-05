import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getMyLessons } from "../../services/lessonService.js";
import { getQuizAnalytics } from "../../services/quizService.js";

const TeacherQuizzes = () => {
  const [lessons, setLessons] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Get published lessons that could have quizzes
        const res = await getMyLessons({ status: "published", limit: 50 });
        const publishedLessons = res.data.lessons ?? [];
        setLessons(publishedLessons);

        // Fetch quiz analytics for each lesson (best-effort)
        const analyticsMap = {};
        await Promise.allSettled(
          publishedLessons.map(async (lesson) => {
            try {
              const ar = await getQuizAnalytics(lesson._id);
              analyticsMap[lesson._id] = ar.data.analytics;
            } catch {
              analyticsMap[lesson._id] = null;
            }
          }),
        );
        setAnalytics(analyticsMap);
      } catch {
        // swallow — show empty state
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
        title="Quizzes"
        description="Quiz performance for your published lessons."
      />

      {lessons.length === 0 ? (
        <Card className="py-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">No published lessons yet</p>
          <p className="text-small mt-1 text-text-muted">
            Publish a lesson, then add questions to it via the lesson editor.
          </p>
          <Button to="/teacher/lessons" variant="primary" className="mt-4">Go to Lessons</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const stats = analytics[lesson._id];
            return (
              <Card key={lesson._id} hoverable>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent" aria-hidden="true">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-h4 mt-4 line-clamp-2">{lesson.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lesson.subject && <Badge variant="primary">{lesson.subject.name}</Badge>}
                  <Badge variant={lesson.type === "note" ? "neutral" : "accent"}>{lesson.type}</Badge>
                </div>

                {stats ? (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-small">
                    <div className="rounded-xl bg-surface-muted p-3 text-center">
                      <p className="text-h4 text-primary">{stats.totalAttempts}</p>
                      <p className="text-caption mt-0.5">Attempts</p>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3 text-center">
                      <p className="text-h4 text-secondary">{stats.averageScore}%</p>
                      <p className="text-caption mt-0.5">Avg. Score</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-small mt-4 text-text-muted">No quiz attempts yet.</p>
                )}

                <Button
                  to={`/teacher/lessons/${lesson._id}/questions`}
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  Manage Questions
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
