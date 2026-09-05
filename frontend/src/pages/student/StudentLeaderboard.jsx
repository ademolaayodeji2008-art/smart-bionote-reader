import { useEffect, useState } from "react";
import { Trophy, Flame, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getGlobalLeaderboard, getMyRank } from "../../services/leaderboardService.js";
import { useAuthStore } from "../../stores/authStore.js";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

const StudentLeaderboard = () => {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [lb, rank] = await Promise.allSettled([
          getGlobalLeaderboard({ page, limit: 20 }),
          getMyRank(),
        ]);
        if (lb.status === "fulfilled") {
          setEntries(lb.value.data.entries);
          setPagination(lb.value.data.pagination);
        }
        if (rank.status === "fulfilled") setMyRank(rank.value.data);
      } catch { /* show partial data */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [page]);

  return (
    <div>
      <PageHeader title="Leaderboard" description="See how you rank among all learners." />

      {/* My rank card */}
      {myRank && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              #{myRank.rank}
            </div>
            <div>
              <p className="text-small font-semibold text-text-strong">{user?.fullName}</p>
              <p className="text-caption">Level {myRank.currentLevel}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="text-small font-semibold">{myRank.totalXP?.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-accent">
              <Flame className="h-4 w-4" aria-hidden="true" />
              <span className="text-small font-semibold">{myRank.studyStreak} day streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <span className="text-small font-semibold">{myRank.earnedBadges?.length ?? 0} badges</span>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {entries.map((entry) => {
              const isMe = entry.user?._id === user?._id;
              return (
                <li key={entry.user?._id ?? entry.rank}
                  className={`flex items-center gap-4 px-5 py-4 ${isMe ? "bg-primary/5" : ""}`}
                >
                  <span className="w-8 shrink-0 text-center font-bold text-text-muted">
                    {MEDAL[entry.rank] ?? entry.rank}
                  </span>
                  <Avatar name={entry.user?.fullName} src={entry.user?.profileImage} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-small font-semibold truncate ${isMe ? "text-primary" : "text-text-strong"}`}>
                      {entry.user?.fullName ?? "—"}
                      {isMe && <span className="ml-2 text-caption">(you)</span>}
                    </p>
                    <p className="text-caption">Level {entry.currentLevel}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span className="text-small font-semibold text-primary">
                      {entry.totalXP?.toLocaleString()}
                    </span>
                  </div>
                  {entry.badgeCount > 0 && (
                    <Badge variant="neutral">{entry.badgeCount} 🏅</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-small text-text-muted">Page {pagination.currentPage} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboard;
