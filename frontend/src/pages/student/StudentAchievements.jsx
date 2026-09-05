import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getMyRank } from "../../services/leaderboardService.js";

const StudentAchievements = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyRank()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const earned = data?.earnedBadges ?? [];

  return (
    <div>
      <PageHeader title="Achievements" description="Badges you've earned on your learning journey." />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : earned.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-text-muted mb-4">
            <Award className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-body font-semibold text-text-strong">No badges yet</p>
          <p className="text-small mt-1 text-text-muted">Complete lessons and quizzes to earn your first badge.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {earned.map((eb) => {
            const badge = eb.badge;
            if (!badge) return null;
            return (
              <Card key={eb._id ?? badge._id} className="flex flex-col items-center gap-3 p-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <Award className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-small font-semibold text-text-strong">{badge.name}</p>
                  {badge.description && (
                    <p className="text-caption mt-0.5">{badge.description}</p>
                  )}
                </div>
                <Badge variant="secondary">Earned</Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;
