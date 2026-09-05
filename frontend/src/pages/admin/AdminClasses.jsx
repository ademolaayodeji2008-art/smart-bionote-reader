import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { getAdminClasses } from "../../services/adminService.js";

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await getAdminClasses(params);
      setClasses(res.data.classes);
      setPagination(res.data.pagination);
    } catch { /* swallow */ }
    finally { setIsLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div>
      <PageHeader title="Classes" description="Overview of all classes on the platform." />

      <SearchBar placeholder="Search classes…" value={search}
        onChange={(e) => setSearch(e.target.value)} className="mb-6 w-full sm:max-w-xs" />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls._id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-body font-semibold text-text-strong">{cls.name}</p>
                  {cls.schoolName && <p className="text-caption mt-0.5">{cls.schoolName}</p>}
                  {cls.academicSession && <p className="text-caption">{cls.academicSession}</p>}
                </div>
                <Badge variant={cls.isActive ? "secondary" : "neutral"}>
                  {cls.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cls.subjects?.map((s) => (
                  <Badge key={s._id} variant="primary">{s.name}</Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                <div>
                  <p className="text-caption">Teacher</p>
                  <p className="text-small text-text-strong">{cls.teacher?.fullName ?? "—"}</p>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span className="text-small font-semibold">{cls.enrollmentCount} students</span>
                </div>
              </div>
            </Card>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full py-10 text-center text-text-muted">No classes found.</div>
          )}
        </div>
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

export default AdminClasses;
