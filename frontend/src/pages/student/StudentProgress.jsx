import { useEffect, useState } from "react";
import { BookOpen, PenLine, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getAllProgress } from "../../services/progressService.js";
import { useNavigate } from "react-router-dom";

const StudentProgress = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllProgress()
      .then((r) => setProgress(r.data.progress))
      .catch(() => setError("Unable to load your progress."))
      .finally(() => setIsLoading(false));
  }, []);

  const completed = progress.filter((p) => p.completed).length;
  const inProgress = progress.filter((p) => !p.completed && p.progressPercentage > 0).length;

  return (
    <div>
      <PageHeader title="My Progress" description="Track every lesson you've started or completed." />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-h2 text-secondary">{completed}</p>
          <p className="text-caption mt-1">Completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-h2 text-primary">{inProgress}</p>
          <p className="text-caption mt-1">In Progress</p>
        </Card>
        <Card className="text-center col-span-2 sm:col-span-1">
          <p className="text-h2 text-text-strong">{progress.length}</p>
          <p className="text-caption mt-1">Total Started</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-body text-danger">{error}</p>
        </div>
      ) : progress.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-body text-text-muted">No progress yet. Open a lesson to get started.</p>
          <Button to="/student/lessons" variant="primary" className="mt-4">Browse Lessons</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {progress.map((p) => {
            const lesson = p.lesson;
            if (!lesson) return null;
            const Icon = lesson.type === "drawing" ? PenLine : BookOpen;
            return (
              <Card key={p._id} hoverable
                as="button"
                onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                className="flex w-full items-center gap-4 text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body font-semibold text-text-strong truncate">{lesson.title}</p>
                    {p.completed && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-secondary">
                        <CheckCircle2 className="h-3.5 w-3.5" />Completed
                      </span>
                    )}
                  </div>
                  {lesson.subject && <p className="text-caption mt-0.5">{lesson.subject.name}</p>}
                  <ProgressBar value={p.progressPercentage} showValue color={p.completed ? "secondary" : "primary"} className="mt-2" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
