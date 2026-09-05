import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, PenLine } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getSubjects } from "../../services/subjectService.js";
import { adminCreateSubject, adminUpdateSubject } from "../../services/adminService.js";
import { useToast } from "../../hooks/useToast.js";

const SubjectForm = ({ initial, onSave, onCancel, isSaving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial ?? { name: "", slug: "", description: "", icon: "BookOpen" },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSave)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="name" label="Name" required error={errors.name?.message}
          {...register("name", { required: "Name is required." })} />
        <Input id="slug" label="Slug" required placeholder="e.g. biology"
          error={errors.slug?.message}
          {...register("slug", {
            required: "Slug is required.",
            pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only." },
          })} />
      </div>
      <Input id="icon" label="Icon name (Lucide)" placeholder="e.g. Microscope"
        {...register("icon")} />
      <Textarea id="description" label="Description" rows={3}
        {...register("description")} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSaving}>Save</Button>
      </div>
    </form>
  );
};

const AdminSubjects = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ open: false, subject: null }); // null = create
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    getSubjects()
      .then((r) => setSubjects(r.data.subjects))
      .catch(() => toast.error("Failed to load subjects."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (values) => {
    setIsSaving(true);
    try {
      const data = { ...values, slug: values.slug.toLowerCase().trim() };
      if (modalState.subject) {
        await adminUpdateSubject(modalState.subject._id, data);
        toast.success("Subject updated.");
      } else {
        await adminCreateSubject(data);
        toast.success("Subject created.");
      }
      setModalState({ open: false, subject: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save subject.");
    } finally { setIsSaving(false); }
  };

  const handleDeactivate = async (subject) => {
    try {
      await adminUpdateSubject(subject._id, { isActive: false });
      toast.success("Subject deactivated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to deactivate.");
    }
  };

  return (
    <div>
      <PageHeader title="Subjects" description="Manage platform subjects."
        action={
          <Button variant="primary" onClick={() => setModalState({ open: true, subject: null })}>
            <Plus className="h-4 w-4" />New Subject
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s._id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-body font-semibold text-text-strong">{s.name}</p>
                  <p className="text-caption mt-0.5">{s.slug}</p>
                </div>
                <Badge variant={s.isActive ? "secondary" : "neutral"}>
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {s.description && <p className="text-small text-text-muted line-clamp-2">{s.description}</p>}
              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="sm"
                  onClick={() => setModalState({ open: true, subject: s })}>
                  <PenLine className="h-4 w-4" />Edit
                </Button>
                {s.isActive && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeactivate(s)}
                    className="text-danger hover:text-danger">
                    Deactivate
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalState.open}
        onClose={() => setModalState({ open: false, subject: null })}
        title={modalState.subject ? "Edit Subject" : "New Subject"}
      >
        <SubjectForm
          initial={modalState.subject}
          onSave={handleSave}
          onCancel={() => setModalState({ open: false, subject: null })}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};

export default AdminSubjects;
