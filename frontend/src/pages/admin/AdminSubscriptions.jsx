import { useEffect, useState, useCallback } from "react";
import { DollarSign, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import api from "../../services/api.js";

const AdminSubscriptions = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, txRes] = await Promise.allSettled([
        api.get("/admin/subscription-stats"),
        api.get("/admin/transactions", { params: { page, limit: 20 } }),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data.stats);
      if (txRes.status === "fulfilled") {
        setTransactions(txRes.value.data.data.transactions);
        setPagination(txRes.value.data.data.pagination);
      }
    } catch { /* partial data is fine */ }
    finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  if (isLoading && !stats) return (
    <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div>
      <PageHeader title="Subscriptions & Revenue" description="Platform subscription statistics and transaction records." />

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Transactions" value={stats.totalTransactions} icon={TrendingUp} accent="primary" />
          <StatCard label="Active Subscribers" value={stats.activeSubscriptions} icon={Users} accent="secondary" />
          <StatCard label="Expired" value={stats.expiredSubscriptions} icon={Users} accent="neutral" />
          <StatCard
            label="Total Revenue"
            value={`₦${(stats.totalRevenueNGN ?? 0).toLocaleString("en-NG")}`}
            icon={DollarSign}
            accent="accent"
          />
        </div>
      )}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-5 py-3 font-semibold text-text-muted">Student</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Plan</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Amount</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Status</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Date</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-text-strong">{tx.user?.fullName ?? "—"}</p>
                    <p className="text-caption">{tx.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {tx.subscription?.plan?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold text-primary">
                    {tx.displayAmount ?? `₦${(tx.amountKobo / 100).toLocaleString("en-NG")}`}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={tx.status === "successful" ? "secondary" : "danger"}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                    {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("en-NG") : "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-text-muted">{tx.reference}</td>
                </tr>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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

export default AdminSubscriptions;
