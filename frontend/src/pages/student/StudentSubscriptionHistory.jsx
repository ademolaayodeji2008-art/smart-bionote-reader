import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getSubscriptionHistory } from "../../services/subscriptionService.js";

const STATUS_CONFIG = {
  active:    { variant: "secondary", icon: CheckCircle2, label: "Active" },
  expired:   { variant: "neutral",   icon: Clock,        label: "Expired" },
  pending:   { variant: "accent",    icon: Clock,        label: "Pending" },
  cancelled: { variant: "danger",    icon: XCircle,      label: "Cancelled" },
  failed:    { variant: "danger",    icon: XCircle,      label: "Failed" },
};

const StudentSubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSubscriptionHistory()
      .then((r) => setHistory(r.data.history))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Subscription History"
        description="All your past and current subscription records."
        action={<Button to="/student/subscription" variant="outline">View Plans</Button>}
      />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : history.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">No subscription history yet</p>
          <p className="text-small mt-1 text-text-muted">Subscribe to a plan to get started.</p>
          <Button to="/student/subscription" variant="primary" className="mt-4">View Plans</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const isActive = sub.status === "active" && sub.endDate && new Date(sub.endDate) > new Date();
            return (
              <Card key={sub._id} className={isActive ? "border-secondary/30 bg-secondary/5" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-text-strong">
                        {sub.plan?.name ?? `${sub.durationMonths} Month${sub.durationMonths !== 1 ? "s" : ""}`}
                      </p>
                      <Badge variant={cfg.variant}>
                        <StatusIcon className="h-3 w-3 mr-0.5" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-small mt-1 text-primary font-semibold">
                      ₦{(sub.amountKobo / 100).toLocaleString("en-NG")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-caption">
                      {sub.startDate && (
                        <span>Started: {new Date(sub.startDate).toLocaleDateString("en-NG")}</span>
                      )}
                      {sub.endDate && (
                        <span>
                          {isActive ? "Expires" : "Expired"}: {new Date(sub.endDate).toLocaleDateString("en-NG")}
                        </span>
                      )}
                    </div>
                    {sub.transactionReference && (
                      <p className="text-caption mt-1">
                        Ref: <span className="font-mono">{sub.transactionReference}</span>
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <Button to="/student/subscription" variant="outline" size="sm">
                      Renew / Extend
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSubscriptionHistory;
