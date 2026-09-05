import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, Flame, Sparkles, Target, Clock, Trophy } from "lucide-react";
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
import { getStudentProfile, updateStudentProfile } from "../../services/studentService.js";

/** Read-only stat tile used in the statistics section. */
const StatTile = ({ icon: Icon, label, value, accent = "primary" }) => {
  const COLORS = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${COLORS[accent]}`} aria-hidden="true">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-caption">{label}</p>
        <p className="text-h4 mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
};

const StudentProfilePage = () => {
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
        const res = await getStudentProfile();
        setProfile(res.data.profile);
        reset({
          schoolName: res.data.profile.schoolName ?? "",
          classLevel: res.data.profile.classLevel ?? "",
          department: res.data.profile.department ?? "",
          bio: res.data.profile.bio ?? "",
          learningGoals: res.data.profile.learningGoals ?? "",
          dateOfBirth: res.data.profile.dateOfBirth
            ? res.data.profile.dateOfBirth.slice(0, 10)
            : "",
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
        classLevel: values.classLevel || null,
        department: values.department || null,
        bio: values.bio || null,
        learningGoals: values.learningGoals || null,
        dateOfBirth: values.dateOfBirth || null,
      };
      const res = await updateStudentProfile(payload);
      setProfile(res.data.profile);
      reset(values); // clear isDirty
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
      <PageHeader title="My Profile" description="Manage your personal and academic information." />

      {/* Identity card */}
      <Card className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar name={user?.fullName} src={user?.profileImage} size="lg" />
        <div>
          <h2 className="text-h3">{user?.fullName}</h2>
          <p className="text-small mt-1 text-text-muted">{user?.email}</p>
          <Badge variant="primary" className="mt-2">Student</Badge>
        </div>
      </Card>

      {/* Study statistics — read-only, server-controlled */}
      <Card className="mb-6">
        <h2 className="text-h4 mb-4">Study Statistics</h2>
        <p className="text-small mb-4 text-text-muted">These are updated automatically as you learn.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={Sparkles} label="Total XP" value={profile?.totalXP?.toLocaleString()} accent="primary" />
          <StatTile icon={BookOpen} label="Level" value={profile?.currentLevel} accent="secondary" />
          <StatTile icon={Flame} label="Study Streak" value={`${profile?.studyStreak ?? 0} days`} accent="accent" />
          <StatTile icon={Target} label="Lessons Completed" value={profile?.lessonsCompleted} accent="primary" />
          <StatTile icon={Trophy} label="Quizzes Done" value={profile?.quizzesCompleted} accent="secondary" />
          <StatTile icon={Clock} label="Study Time" value={`${profile?.totalStudyTime ?? 0} min`} accent="accent" />
        </div>
      </Card>

      {/* Editable profile form */}
      <Card>
        <h2 className="text-h4 mb-6">Personal & Academic Details</h2>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="schoolName"
              label="School name"
              placeholder="e.g. Lagos State Secondary School"
              error={errors.schoolName?.message}
              {...register("schoolName", { maxLength: { value: 200, message: "School name is too long." } })}
            />
            <Input
              id="classLevel"
              label="Class level"
              placeholder="e.g. JSS2, SSS3, Primary 5"
              error={errors.classLevel?.message}
              {...register("classLevel", { maxLength: { value: 50, message: "Class level is too long." } })}
            />
          </div>

          <Input
            id="department"
            label="Department"
            placeholder="e.g. Science, Arts, Commercial"
            error={errors.department?.message}
            {...register("department", { maxLength: { value: 100, message: "Department name is too long." } })}
          />

          <Input
            id="dateOfBirth"
            label="Date of birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />

          <Textarea
            id="bio"
            label="Bio"
            placeholder="Tell us a little about yourself..."
            rows={3}
            error={errors.bio?.message}
            {...register("bio", { maxLength: { value: 500, message: "Bio cannot exceed 500 characters." } })}
          />

          <Textarea
            id="learningGoals"
            label="Learning goals"
            placeholder="What do you want to achieve? e.g. Pass WAEC Biology with distinction..."
            rows={3}
            error={errors.learningGoals?.message}
            {...register("learningGoals", { maxLength: { value: 500, message: "Learning goals cannot exceed 500 characters." } })}
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

export default StudentProfilePage;
