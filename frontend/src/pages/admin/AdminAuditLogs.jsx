import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { getAuditLogs } from "../../services/adminService.js";

const ACTION_VARIANT = {
  APPROVE_TEACHER: "secondary", REJECT_TEACHER: "danger",
  ACTIVATE_USER: "secondary", DEACTIVATE_USER: "danger",
  ARCHIVE_LESSON: "accent", CREATE_SUBJECT: "primary", UPDATE_SUBJECT: "neutral",
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogs({ page, limit: 30 });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch { /* swallow */ }
    finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <PageHeader title="Audit Log" description="Record of administrative actions." />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold text-text-muted">Action</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Target</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Admin</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <Badge variant={ACTION_VARIANT[log.action] ?? "neutral"}>{log.action}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {log.targetType} <span className="font-mono text-xs">{log.targetId?.toString().slice(-6)}</span>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{log.admin?.fullName ?? "—"}</td>
                    <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-text-muted">No audit logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-small text-text-muted">Page {pagination.currentPage} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
