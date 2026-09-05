import { useEffect, useState, useCallback } from "react";
import { FilePlus, BookOpen, PenLine, Archive, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { getMyLessons, publishLesson, archiveLesson, deleteLesson } from "../../services/lessonService.js";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "note", label: "Note" },
  { value: "drawing", label: "Drawing" },
];

const STATUS_BADGE = {
  draft: { variant: "neutral", label: "Draft" },
  published: { variant: "secondary", label: "Published" },
  archived: { variant: "danger", label: "Archived" },
};

const TYPE_BADGE = {
  note: { variant: "primary", label: "Note" },
  drawing: { variant: "accent", label: "Drawing" },
};

const TeacherLessons = () => {
  const toast = useToast();

  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Confirm dialog state
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, lesson: null });
  const [isActing, setIsActing] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await getMyLessons(params);
      setLessons(res.data.lessons);
      setPagination(res.data.pagination);
    } catch {
      setFetchError("Unable to load lessons. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Debounce search — reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const openConfirm = (action, lesson) => setConfirmModal({ open: true, action, lesson });
  const closeConfirm = () => setConfirmModal({ open: false, action: null, lesson: null });

  const handleConfirmAction = async () => {
    const { action, lesson } = confirmModal;
    setIsActing(true);
    try {
      if (action === "publish") {
        await publishLesson(lesson._id);
        toast.success("Lesson published.");
      } else if (action === "archive") {
        await archiveLesson(lesson._id);
        toast.success("Lesson archived.");
      } else if (action === "delete") {
        await deleteLesson(lesson._id);
        toast.success("Lesson deleted.");
      }
      closeConfirm();
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Action failed. Please try again.");
    } finally {
      setIsActing(false);
    }
  };

  const confirmCopy = {
    publish: {
      title: "Publish lesson",
      body: "This will make the lesson visible to students. Make sure the content is complete.",
      cta: "Publish",
      variant: "secondary",
    },
    archive: {
      title: "Archive lesson",
      body: "Archived lessons are hidden from students. You can still view and edit them.",
      cta: "Archive",
      variant: "ghost",
    },
    delete: {
      title: "Delete lesson",
      body: "Draft lessons are permanently deleted. This cannot be undone.",
      cta: "Delete",
      variant: "danger",
    },
  };

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Manage your lessons — drafts, published, and archived."
        action={
          <Button to="/teacher/create-lesson" variant="primary">
            <FilePlus className="h-4 w-4" aria-hidden="true" />
            Create Lesson
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex gap-3">
          <Select
            id="status-filter"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[140px]"
          />
          <Select
            id="type-filter"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-[130px]"
          />
        </div>
      </div>

      {/* Lesson list */}
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-body text-danger">{fetchError}</p>
          <Button variant="outline" onClick={fetchLessons}>Try again</Button>
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState
          title="No lessons found"
          description={search || statusFilter || typeFilter ? "Try adjusting your filters." : "Create your first lesson to get started."}
          action={!search && !statusFilter && !typeFilter && (
            <Button to="/teacher/create-lesson" variant="primary">
              <FilePlus className="h-4 w-4" />
              Create Lesson
            </Button>
          )}
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {lessons.map((lesson) => {
              const statusConfig = STATUS_BADGE[lesson.status] ?? STATUS_BADGE.draft;
              const typeConfig = TYPE_BADGE[lesson.type] ?? TYPE_BADGE.note;
              const isDraft = lesson.status === "draft";
              const isPublished = lesson.status === "published";

              return (
                <li key={lesson._id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  {/* Lesson info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body truncate font-medium text-text-strong">{lesson.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        {lesson.subject && (
                          <span className="text-caption">{lesson.subject.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      to={`/teacher/lessons/${lesson._id}/edit`}
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${lesson.title}`}
                    >
                      <PenLine className="h-4 w-4" />
                      Edit
                    </Button>

                    {isDraft && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openConfirm("publish", lesson)}
                        aria-label={`Publish ${lesson.title}`}
                      >
                        Publish
                      </Button>
                    )}

                    {isPublished && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirm("archive", lesson)}
                        aria-label={`Archive ${lesson.title}`}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}

                    {isDraft && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirm("delete", lesson)}
                        aria-label={`Delete ${lesson.title}`}
                        className="text-danger hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-small text-text-muted">
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} lessons
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPreviousPage}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm action modal */}
      <Modal
        open={confirmModal.open}
        onClose={closeConfirm}
        title={confirmModal.action ? confirmCopy[confirmModal.action]?.title : ""}
      >
        <p className="text-body text-text-body">
          {confirmModal.action ? confirmCopy[confirmModal.action]?.body : ""}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={closeConfirm} disabled={isActing}>
            Cancel
          </Button>
          <Button
            variant={confirmModal.action ? confirmCopy[confirmModal.action]?.variant : "primary"}
            onClick={handleConfirmAction}
            loading={isActing}
          >
            {confirmModal.action ? confirmCopy[confirmModal.action]?.cta : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherLessons;
