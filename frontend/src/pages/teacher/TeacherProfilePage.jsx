import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import { useToast } from "../../hooks/useToast.js";
import { getTeacherProfile, updateTeacherProfile } from "../../services/teacherService.js";

const TeacherProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTeacherProfile();
        setProfile(res.data.profile);
        reset({
          schoolName: res.data.profile.schoolName ?? "",
          qualification: res.data.profile.qualification ?? "",
          specialization: res.data.profile.specialization ?? "",
          bio: res.data.profile.bio ?? "",
          yearsOfExperience: res.data.profile.yearsOfExperience ?? "",
        });
      } catch {
        setFetchError("Unable to load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [reset]);

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      const payload = {
        schoolName: values.schoolName || null,
        qualification: values.qualification || null,
        specialization: values.specialization || null,
        bio: values.bio || null,
        yearsOfExperience:
          values.yearsOfExperience !== "" && values.yearsOfExperience !== null
            ? Number(values.yearsOfExperience)
            : null,
      };
      const res = await updateTeacherProfile(payload);
      setProfile(res.data.profile);
      reset(values);
      toast.success("Profile saved successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-body text-danger">{fetchError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your professional information." />

      {/* Identity card */}
      <Card className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar name={user?.fullName} src={user?.profileImage} size="lg" />
        <div className="flex-1">
          <h2 className="text-h3">{user?.fullName}</h2>
          <p className="text-small mt-1 text-text-muted">{user?.email}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge variant="primary">Teacher</Badge>
            {/* Approval status — read-only, admin-controlled */}
            {profile?.isApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Pending Approval
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Read-only approval notice */}
      {!profile?.isApproved && (
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-small text-accent">
            Your account is pending administrator approval. You can still create lessons in draft mode, but they won't be visible to students until your account is approved.
          </p>
        </div>
      )}

      {/* Subjects taught — read-only display for now (editing comes with subject management UI) */}
      {profile?.subjects && profile.subjects.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-h4 mb-3">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((subject) => (
              <Badge key={subject._id} variant="secondary">
                {subject.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Editable profile form */}
      <Card>
        <h2 className="text-h4 mb-6">Professional Details</h2>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            id="schoolName"
            label="School name"
            placeholder="e.g. Federal Government College, Lagos"
            error={errors.schoolName?.message}
            {...register("schoolName", { maxLength: { value: 200, message: "School name is too long." } })}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="qualification"
              label="Highest qualification"
              placeholder="e.g. B.Sc. Biology, PGDE"
              error={errors.qualification?.message}
              {...register("qualification", { maxLength: { value: 200, message: "Qualification is too long." } })}
            />
            <Input
              id="specialization"
              label="Specialization"
              placeholder="e.g. Cell Biology, Genetics"
              error={errors.specialization?.message}
              {...register("specialization", { maxLength: { value: 200, message: "Specialization is too long." } })}
            />
          </div>

          <Input
            id="yearsOfExperience"
            label="Years of teaching experience"
            type="number"
            placeholder="e.g. 5"
            min={0}
            max={60}
            error={errors.yearsOfExperience?.message}
            {...register("yearsOfExperience", {
              min: { value: 0, message: "Cannot be negative." },
              max: { value: 60, message: "Cannot exceed 60 years." },
            })}
          />

          <Textarea
            id="bio"
            label="Bio"
            placeholder="Tell your students about yourself..."
            rows={4}
            error={errors.bio?.message}
            {...register("bio", { maxLength: { value: 1000, message: "Bio cannot exceed 1000 characters." } })}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSaving}
              disabled={!isDirty || isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TeacherProfilePage;
