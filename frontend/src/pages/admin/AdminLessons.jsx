import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getAdminLessons, adminArchiveLesson } from "../../services/adminService.js";
import { useToast } from "../../hooks/useToast.js";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "note", label: "Note" },
  { value: "drawing", label: "Drawing" },
];

const STATUS_VARIANT = { published: "secondary", draft: "neutral", archived: "danger" };

const AdminLessons = () => {
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [archiveModal, setArchiveModal] = useState({ open: false, lesson: null });
  const [isActing, setIsActing] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await getAdminLessons(params);
      setLessons(res.data.lessons);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load lessons."); }
    finally { setIsLoading(false); }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  const handleArchive = async () => {
    setIsActing(true);
    try {
      await adminArchiveLesson(archiveModal.lesson._id);
      toast.success("Lesson archived.");
      setArchiveModal({ open: false, lesson: null });
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to archive lesson.");
    } finally { setIsActing(false); }
  };

  return (
    <div>
      <PageHeader title="Lessons" description="Review and moderate all platform lessons." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar placeholder="Search lessons…" value={search}
          onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
        <div className="flex gap-3">
          <Select id="status-filter" options={STATUS_OPTIONS} value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[140px]" />
          <Select id="type-filter" options={TYPE_OPTIONS} value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)} className="min-w-[130px]" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold text-text-muted">Title</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Type</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Status</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Subject</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Teacher</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-text-strong max-w-[200px] truncate">{lesson.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={lesson.type === "note" ? "primary" : "accent"}>{lesson.type}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_VARIANT[lesson.status] ?? "neutral"}>{lesson.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{lesson.subject?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-text-muted">{lesson.teacher?.fullName ?? "—"}</td>
                    <td className="px-5 py-3">
                      {lesson.status !== "archived" && (
                        <Button variant="ghost" size="sm"
                          onClick={() => setArchiveModal({ open: true, lesson })}
                          className="text-danger hover:text-danger">
                          Archive
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-text-muted">No lessons found.</td></tr>
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

      <Modal open={archiveModal.open} onClose={() => setArchiveModal({ open: false, lesson: null })} title="Archive lesson">
        <p className="text-body text-text-body">
          Archive <span className="font-semibold">"{archiveModal.lesson?.title}"</span>? It will be hidden from students. This action is logged.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setArchiveModal({ open: false, lesson: null })}>Cancel</Button>
          <Button variant="danger" loading={isActing} onClick={handleArchive}>Archive</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLessons;
