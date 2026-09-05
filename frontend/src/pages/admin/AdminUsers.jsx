import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { getUsers, activateUser, deactivateUser } from "../../services/adminService.js";
import { useToast } from "../../hooks/useToast.js";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ROLE_VARIANT = { student: "primary", teacher: "secondary", admin: "accent" };

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null, action: null });
  const [isActing, setIsActing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getUsers(params);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load users."); }
    finally { setIsLoading(false); }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const handleAction = async () => {
    const { user, action } = confirmModal;
    setIsActing(true);
    try {
      if (action === "activate") await activateUser(user._id);
      else await deactivateUser(user._id);
      toast.success(`User ${action === "activate" ? "activated" : "deactivated"}.`);
      setConfirmModal({ open: false, user: null, action: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Action failed.");
    } finally { setIsActing(false); }
  };

  return (
    <div>
      <PageHeader title="Users" description="Search, view, and manage all platform accounts." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
        <div className="flex gap-3">
          <Select id="role-filter" options={ROLE_OPTIONS} value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)} className="min-w-[130px]" />
          <Select id="status-filter" options={STATUS_OPTIONS} value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[140px]" />
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
                  <th className="px-5 py-3 font-semibold text-text-muted">User</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Role</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Status</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Joined</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.fullName} src={user.profileImage} size="sm" />
                        <div>
                          <p className="font-semibold text-text-strong">{user.fullName}</p>
                          <p className="text-caption">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={ROLE_VARIANT[user.role] ?? "neutral"}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.isActive ? "text-secondary" : "text-danger"}`}>
                        {user.isActive
                          ? <><CheckCircle2 className="h-3.5 w-3.5" />Active</>
                          : <><XCircle className="h-3.5 w-3.5" />Inactive</>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {user.role !== "admin" && (
                        user.isActive ? (
                          <Button variant="ghost" size="sm"
                            onClick={() => setConfirmModal({ open: true, user, action: "deactivate" })}>
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm"
                            onClick={() => setConfirmModal({ open: true, user, action: "activate" })}>
                            Activate
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-small text-text-muted">
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, user: null, action: null })}
        title={confirmModal.action === "activate" ? "Activate account" : "Deactivate account"}
      >
        <p className="text-body text-text-body">
          {confirmModal.action === "activate"
            ? `Activate ${confirmModal.user?.fullName}'s account? They will be able to log in again.`
            : `Deactivate ${confirmModal.user?.fullName}'s account? They will not be able to log in.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmModal({ open: false, user: null, action: null })}>Cancel</Button>
          <Button
            variant={confirmModal.action === "activate" ? "secondary" : "danger"}
            loading={isActing}
            onClick={handleAction}
          >
            {confirmModal.action === "activate" ? "Activate" : "Deactivate"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
