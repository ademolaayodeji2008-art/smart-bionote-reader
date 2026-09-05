import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MailPlus, XCircle, CheckCircle2, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
} from "../../services/invitationService.js";

const STATUS_CONFIG = {
  pending:  { variant: "accent",    icon: Clock,         label: "Pending" },
  accepted: { variant: "secondary", icon: CheckCircle2,  label: "Accepted" },
  revoked:  { variant: "danger",    icon: XCircle,       label: "Revoked" },
  expired:  { variant: "neutral",   icon: Clock,         label: "Expired" },
};

const AdminInviteTeachers = () => {
  const toast = useToast();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [revokeModal, setRevokeModal] = useState({ open: false, invitation: null });
  const [isRevoking, setIsRevoking] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await listInvitations();
      setInvitations(res.data.invitations);
    } catch {
      toast.error("Failed to load invitations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSend = async (values) => {
    setIsSending(true);
    try {
      await createInvitation(values);
      toast.success(`Invitation sent to ${values.email}.`);
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to send invitation.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await revokeInvitation(revokeModal.invitation._id);
      toast.success("Invitation revoked.");
      setRevokeModal({ open: false, invitation: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to revoke invitation.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Invite Teachers"
        description="Send secure invitations to new teachers. Teachers cannot self-register."
        action={
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            <MailPlus className="h-4 w-4" />
            {showForm ? "Cancel" : "Invite Teacher"}
            {showForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Invite form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="text-h4 mb-4">New Teacher Invitation</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSend)} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="fullName"
                label="Teacher full name"
                placeholder="e.g. Dr. Amara Okafor"
                required
                error={errors.fullName?.message}
                {...register("fullName", { required: "Full name is required." })}
              />
              <Input
                id="email"
                type="email"
                label="Teacher email address"
                placeholder="teacher@school.edu"
                required
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email." },
                })}
              />
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-small text-primary">
                The teacher will receive an email with a secure link to create their password. The invitation expires in <strong>48 hours</strong> and can only be used once.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSending}>
                <MailPlus className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Invitations list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4">All Invitations</h2>
        <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : invitations.length === 0 ? (
        <Card className="py-10 text-center">
          <MailPlus className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">No invitations yet</p>
          <p className="text-small mt-1 text-text-muted">Send your first teacher invitation above.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold text-text-muted">Teacher</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Status</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Invited by</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Expires</th>
                  <th className="px-5 py-3 font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={inv._id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-text-strong">{inv.fullName}</p>
                        <p className="text-caption">{inv.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={cfg.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-text-muted">{inv.invitedBy?.fullName ?? "—"}</td>
                      <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                        {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("en-NG") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {inv.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={() => setRevokeModal({ open: true, invitation: inv })}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Revoke confirmation modal */}
      <Modal
        open={revokeModal.open}
        onClose={() => setRevokeModal({ open: false, invitation: null })}
        title="Revoke invitation"
      >
        <p className="text-body text-text-body">
          Revoke the invitation for <span className="font-semibold">{revokeModal.invitation?.fullName}</span> ({revokeModal.invitation?.email})?
          The invitation link will immediately stop working.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRevokeModal({ open: false, invitation: null })}>
            Cancel
          </Button>
          <Button variant="danger" loading={isRevoking} onClick={handleRevoke}>
            Revoke
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInviteTeachers;
