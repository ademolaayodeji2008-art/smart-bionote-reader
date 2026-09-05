import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getPendingTeachers, approveTeacher, rejectTeacher } from "../../services/adminService.js";
import { useToast } from "../../hooks/useToast.js";

const AdminTeachers = () => {
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, profile: null, action: null });
  const [isActing, setIsActing] = useState(false);

  const load = () => {
    setIsLoading(true);
    getPendingTeachers()
      .then((r) => setTeachers(r.data.teachers))
      .catch(() => toast.error("Failed to load pending teachers."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    const { profile, action } = confirmModal;
    setIsActing(true);
    try {
      if (action === "approve") await approveTeacher(profile._id);
      else await rejectTeacher(profile._id);
      toast.success(`Teacher ${action === "approve" ? "approved" : "rejected"}.`);
      setConfirmModal({ open: false, profile: null, action: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Action failed.");
    } finally { setIsActing(false); }
  };

  return (
    <div>
      <PageHeader title="Teacher Approvals" description="Review and approve pending teacher accounts." />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : teachers.length === 0 ? (
        <Card className="py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-secondary" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">All caught up</p>
          <p className="text-small mt-1 text-text-muted">No pending teacher approvals right now.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {teachers.map((profile) => (
            <Card key={profile._id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={profile.user?.fullName} size="md" />
                <div>
                  <p className="text-body font-semibold text-text-strong">{profile.user?.fullName}</p>
                  <p className="text-small text-text-muted">{profile.user?.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.qualification && <Badge variant="neutral">{profile.qualification}</Badge>}
                    {profile.specialization && <Badge variant="neutral">{profile.specialization}</Badge>}
                    {profile.yearsOfExperience != null && (
                      <Badge variant="neutral">{profile.yearsOfExperience} yrs exp.</Badge>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-small mt-2 max-w-lg text-text-muted line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" size="sm"
                  onClick={() => setConfirmModal({ open: true, profile, action: "approve" })}>
                  <CheckCircle2 className="h-4 w-4" />Approve
                </Button>
                <Button variant="ghost" size="sm"
                  onClick={() => setConfirmModal({ open: true, profile, action: "reject" })}
                  className="text-danger hover:text-danger">
                  <XCircle className="h-4 w-4" />Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, profile: null, action: null })}
        title={confirmModal.action === "approve" ? "Approve teacher" : "Reject teacher"}
      >
        <p className="text-body text-text-body">
          {confirmModal.action === "approve"
            ? `Approve ${confirmModal.profile?.user?.fullName}? They will be able to create and publish lessons.`
            : `Reject ${confirmModal.profile?.user?.fullName}'s teacher status? Their approval will be revoked.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmModal({ open: false, profile: null, action: null })}>Cancel</Button>
          <Button
            variant={confirmModal.action === "approve" ? "secondary" : "danger"}
            loading={isActing}
            onClick={handleAction}
          >
            {confirmModal.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTeachers;
