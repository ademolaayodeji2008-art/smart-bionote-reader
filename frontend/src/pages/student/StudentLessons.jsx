import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, PenLine, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Select from "../../components/ui/Select.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { getPublishedLessons } from "../../services/lessonService.js";
import { getSubjects } from "../../services/subjectService.js";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "note", label: "Note" },
  { value: "drawing", label: "Drawing" },
];

const TYPE_ICON = { note: BookOpen, drawing: PenLine };
const TYPE_BADGE = { note: "primary", drawing: "accent" };

const LessonCard = ({ lesson, onClick }) => {
  const Icon = TYPE_ICON[lesson.type] ?? BookOpen;
  return (
    <Card
      hoverable
      as="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-3 text-left transition-shadow"
    >
      {lesson.coverImage?.url ? (
        <img
          src={lesson.coverImage.url}
          alt={lesson.title}
          className="h-36 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-10 w-10" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={TYPE_BADGE[lesson.type] ?? "neutral"}>
            {lesson.type === "note" ? "Note" : "Drawing"}
          </Badge>
          {lesson.subject && (
            <Badge variant="neutral">{lesson.subject.name}</Badge>
          )}
        </div>
        <h3 className="text-body mt-2 font-semibold text-text-strong line-clamp-2">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="text-small mt-1 text-text-muted line-clamp-2">{lesson.description}</p>
        )}
        {lesson.teacher && (
          <p className="text-caption mt-2">{lesson.teacher.fullName}</p>
        )}
      </div>
      <span className="text-small mt-1 font-semibold text-primary">Open Lesson →</span>
    </Card>
  );
};

const StudentLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getSubjects()
      .then((r) => setSubjects(r.data.subjects))
      .catch(() => {});
  }, []);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await getPublishedLessons(params);
      setLessons(res.data.lessons);
      setPagination(res.data.pagination);
    } catch {
      setError("Unable to load lessons. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, subjectFilter, typeFilter]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);
  useEffect(() => { setPage(1); }, [search, subjectFilter, typeFilter]);

  const subjectOptions = [
    { value: "", label: "All subjects" },
    ...subjects.map((s) => ({ value: s._id, label: s.name })),
  ];

  return (
    <div>
      <PageHeader title="My Lessons" description="Browse and open lessons your teachers have published." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex gap-3">
          <Select id="subject-filter" options={subjectOptions} value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)} className="min-w-[150px]" />
          <Select id="type-filter" options={TYPE_OPTIONS} value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)} className="min-w-[130px]" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-body text-danger">{error}</p>
          <Button variant="outline" onClick={fetchLessons}>Try again</Button>
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState title="No lessons found"
          description={search || subjectFilter || typeFilter ? "Try adjusting your filters." : "No published lessons yet. Check back soon."} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson._id} lesson={lesson}
              onClick={() => navigate(`/student/lessons/${lesson._id}`)} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-small text-text-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLessons;
