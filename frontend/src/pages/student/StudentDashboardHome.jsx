import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, BookOpen, Trophy } from "lucide-react";
import { useAuthStore } from "../../stores/authStore.js";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getStudentProfile } from "../../services/studentService.js";
import { getAllProgress } from "../../services/progressService.js";
import { getPublishedLessons } from "../../services/lessonService.js";
import { getMyRank } from "../../services/leaderboardService.js";

const StudentDashboardHome = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);
  const [rank, setRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profileRes, progressRes, lessonsRes, rankRes] = await Promise.allSettled([
        getStudentProfile(),
        getAllProgress(),
        getPublishedLessons({ limit: 6 }),
        getMyRank(),
      ]);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data.profile);
      if (progressRes.status === "fulfilled") setProgress(progressRes.value.data.progress ?? []);
      if (lessonsRes.status === "fulfilled") setRecentLessons(lessonsRes.value.data.lessons ?? []);
      if (rankRes.status === "fulfilled") setRank(rankRes.value.data);
      setIsLoading(false);
    };
    load();
  }, []);

  // Find the in-progress lesson with the highest progress %
  const continueLesson = progress
    .filter((p) => !p.completed && p.progressPercentage > 0 && p.lesson)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)[0];

  if (isLoading) return (
    <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's where you left off." />

      {/* Continue learning */}
      {continueLesson?.lesson && (
        <Card className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-caption">Continue learning</p>
              <h2 className="text-h4 mt-0.5">{continueLesson.lesson.title}</h2>
              {continueLesson.lesson.subject && (
                <Badge variant="primary" className="mt-2">{continueLesson.lesson.subject.name}</Badge>
              )}
            </div>
            <Button variant="primary" size="sm" className="w-full sm:w-auto"
              onClick={() => navigate(`/student/lessons/${continueLesson.lesson._id}`)}>
              Resume Lesson
            </Button>
          </div>
          <ProgressBar value={continueLesson.progressPercentage} showValue className="mt-5" />
        </Card>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Study Streak" value={`${profile?.studyStreak ?? 0} days`} icon={Flame} accent="accent" />
        <StatCard label="Total XP" value={(profile?.totalXP ?? 0).toLocaleString()} icon={Sparkles} accent="primary" />
        <StatCard label="Lessons Done" value={profile?.lessonsCompleted ?? 0} icon={BookOpen} accent="secondary" />
        <StatCard label="Rank" value={rank ? `#${rank.rank}` : "—"} icon={Trophy} accent="primary" />
      </div>

      {/* Recent published lessons */}
      {recentLessons.length > 0 && (
        <section className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3">Recent Lessons</h2>
            <Button to="/student/lessons" variant="ghost" size="sm">View all</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLessons.map((lesson) => {
              const lessonProgress = progress.find((p) => p.lesson?._id === lesson._id);
              return (
                <Card key={lesson._id} hoverable as="button"
                  onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                  className="flex flex-col items-start gap-2 text-left w-full">
                  {lesson.coverImage?.url ? (
                    <img src={lesson.coverImage.url} alt={lesson.title}
                      className="h-32 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    {lesson.subject && <Badge variant="primary" className="mb-1">{lesson.subject.name}</Badge>}
                    <p className="text-small font-semibold text-text-strong line-clamp-2">{lesson.title}</p>
                  </div>
                  {lessonProgress && (
                    <ProgressBar
                      value={lessonProgress.progressPercentage}
                      color={lessonProgress.completed ? "secondary" : "primary"}
                      className="mt-auto w-full"
                    />
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboardHome;
