import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown, BookOpen, PenLine, Info } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import ContentModeSelector from "../../components/ui/ContentModeSelector.jsx";
import { useToast } from "../../hooks/useToast.js";
import { createLesson, publishLesson } from "../../services/lessonService.js";
import { getSubjects } from "../../services/subjectService.js";

const STEPS = ["Basic Info", "Content", "Review"];

const StepIndicator = ({ steps, current }) => (
  <nav aria-label="Form steps" className="mb-8">
    <ol className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                  ${isDone ? "bg-secondary text-white" : isActive ? "bg-primary text-white" : "bg-surface-muted text-text-muted"}`}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-text-muted"}`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mb-5 h-px flex-1 ${isDone ? "bg-secondary" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/** Shown in the Note content step — explains SpeechSynthesis architecture. */
const NoteTTSNotice = () => (
  <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
    <p className="text-small text-primary">
      <span className="font-semibold">Smart Bionote Reader reads notes aloud automatically.</span>
      {" "}When students open this lesson, the app will use a built-in reading voice to narrate your content.
      You don't need to record or upload any audio for a note lesson.
    </p>
  </div>
);

/** Drawing step builder row. */
const DrawingStepRow = ({ index, register, errors, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) => (
  <div className="rounded-xl border border-border bg-surface p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="text-small font-semibold text-text-strong">Step {index + 1}</span>
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={onMoveUp} disabled={isFirst} aria-label="Move step up">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onMoveDown} disabled={isLast} aria-label="Move step down">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label="Remove step" className="text-danger hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div className="space-y-3">
      <Input
        id={`drawingSteps.${index}.title`}
        label="Step title"
        placeholder="e.g. Draw the cell membrane"
        error={errors?.drawingSteps?.[index]?.title?.message}
        {...register(`drawingSteps.${index}.title`, {
          maxLength: { value: 200, message: "Step title is too long." },
        })}
      />
      <Textarea
        id={`drawingSteps.${index}.description`}
        label="Step description / instructions"
        placeholder="Describe what to draw in this step..."
        rows={3}
        error={errors?.drawingSteps?.[index]?.description?.message}
        {...register(`drawingSteps.${index}.description`, {
          maxLength: { value: 2000, message: "Step description is too long." },
        })}
      />
      <div className="rounded-lg border border-dashed border-border p-3 text-center">
        <p className="text-small text-text-muted">
          <span className="font-medium text-text-body">Step image & teacher audio</span>
          {" "}can be uploaded after saving the lesson.
        </p>
      </div>
    </div>
  </div>
);

/** Review summary card. */
const ReviewSummary = ({ values, subjects }) => {
  const subject = subjects.find((s) => s._id === values.subjectId);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-caption">Title</p>
          <p className="text-body mt-1 font-medium text-text-strong">{values.title || "—"}</p>
        </div>
        <div>
          <p className="text-caption">Type</p>
          <div className="mt-1">
            <Badge variant={values.type === "note" ? "primary" : "accent"}>
              {values.type === "note" ? "Note" : "Drawing"}
            </Badge>
          </div>
        </div>
        <div>
          <p className="text-caption">Subject</p>
          <p className="text-body mt-1 text-text-strong">{subject?.name || "—"}</p>
        </div>
        <div>
          <p className="text-caption">Status after saving</p>
          <Badge variant="neutral" className="mt-1">Draft</Badge>
        </div>
      </div>
      {values.description && (
        <div>
          <p className="text-caption">Description</p>
          <p className="text-body mt-1 text-text-body">{values.description}</p>
        </div>
      )}
      {values.type === "note" && values.content && (
        <div>
          <p className="text-caption">Content preview</p>
          <p className="text-small mt-1 line-clamp-4 text-text-body">{values.content}</p>
        </div>
      )}
      {values.type === "drawing" && (
        <div>
          <p className="text-caption">Drawing steps</p>
          <p className="text-body mt-1 text-text-strong">{values.drawingSteps?.length ?? 0} step(s)</p>
        </div>
      )}
    </div>
  );
};

const TeacherCreateLesson = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "note",
      subjectId: "",
      contentMode: "text",
      content: "",
      drawingSteps: [{ title: "", description: "" }],
    },
  });

  const { fields, append, remove, swap } = useFieldArray({ control, name: "drawingSteps" });
  const lessonType = watch("type");
  const contentMode = watch("contentMode");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSubjects();
        setSubjects(res.data.subjects);
      } catch {
        toast.error("Unable to load subjects. Please refresh.");
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetch();
  }, [toast]);

  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));

  const goToStep = async (target) => {
    if (target > currentStep) {
      // Validate current step's fields before advancing
      const stepFields = {
        1: ["title", "type", "subjectId"],
        2: lessonType === "note" ? ["content"] : [],
      };
      const valid = await trigger(stepFields[currentStep] ?? []);
      if (!valid) return;
    }
    setCurrentStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAsDraft = async (values) => {
    setIsSaving(true);
    try {
      const payload = buildPayload(values);
      const res = await createLesson(payload);
      toast.success("Lesson saved as draft.");
      navigate(`/teacher/lessons/${res.data.lesson._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save lesson.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndPublish = async (values) => {
    setIsPublishing(true);
    try {
      const payload = buildPayload(values);
      const createRes = await createLesson(payload);
      const lessonId = createRes.data.lesson._id;
      await publishLesson(lessonId);
      toast.success("Lesson published successfully.");
      navigate("/teacher/lessons");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to publish lesson.");
    } finally {
      setIsPublishing(false);
    }
  };

  const buildPayload = (values) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      type: values.type,
      subjectId: values.subjectId,
      contentMode: values.contentMode || "text",
    };
    if (values.type === "note") {
      // If document mode, content can be empty at creation — teacher uploads doc after saving
      payload.content = values.contentMode === "document" ? " " : values.content;
    } else {
      payload.drawingSteps = values.drawingSteps.map((step, idx) => ({
        stepNumber: idx + 1,
        title: step.title || null,
        description: step.description || null,
      }));
    }
    return payload;
  };

  if (subjectsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Create Lesson" description="Build a new lesson for your students." />

      <StepIndicator steps={STEPS} current={currentStep} />

      <Card>
        {/* ── Step 1: Basic Information ─────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-h4">Basic Information</h2>

            <Input
              id="title"
              label="Lesson title"
              placeholder="e.g. Photosynthesis and Cellular Respiration"
              required
              error={errors.title?.message}
              {...register("title", {
                required: "A title is required.",
                maxLength: { value: 300, message: "Title cannot exceed 300 characters." },
              })}
            />

            <Textarea
              id="description"
              label="Description"
              placeholder="A short summary of what students will learn..."
              rows={3}
              error={errors.description?.message}
              {...register("description", {
                maxLength: { value: 1000, message: "Description cannot exceed 1000 characters." },
              })}
            />

            <Select
              id="subjectId"
              label="Subject"
              placeholder="Select a subject"
              required
              options={subjectOptions}
              error={errors.subjectId?.message}
              {...register("subjectId", { required: "Please select a subject." })}
            />

            {/* Lesson type selector */}
            <div>
              <p className="mb-3 text-sm font-medium text-text-strong">
                Lesson type <span className="text-danger ml-1" aria-hidden="true">*</span>
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "note",
                    icon: BookOpen,
                    label: "Note",
                    desc: "Write educational content. The app reads it aloud to students automatically.",
                  },
                  {
                    value: "drawing",
                    icon: PenLine,
                    label: "Drawing",
                    desc: "Step-by-step drawing guide with images and your recorded voice per step.",
                  },
                ].map(({ value, icon: Icon, label, desc }) => {
                  const isSelected = lessonType === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors
                        ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <input
                        type="radio"
                        value={value}
                        className="sr-only"
                        {...register("type")}
                      />
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                        ${isSelected ? "bg-primary text-white" : "bg-surface-muted text-text-muted"}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-text-strong"}`}>
                          {label}
                        </p>
                        <p className="text-xs mt-0.5 text-text-muted">{desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" onClick={() => goToStep(2)}>
                Next: Content
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Content ───────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-h4">
              {lessonType === "note" ? "Note Content" : "Drawing Steps"}
            </h2>

            {lessonType === "note" && (
              <>
                {/* Content mode selector */}
                <ContentModeSelector
                  value={contentMode}
                  onChange={(mode) => setValue("contentMode", mode)}
                />

                {contentMode === "text" && (
                  <>
                    <NoteTTSNotice />
                    <Textarea
                      id="content"
                      label="Lesson content"
                      placeholder="Write your Biology lesson here. Use headings, paragraphs, and lists to structure it clearly..."
                      rows={14}
                      required
                      error={errors.content?.message}
                      {...register("content", {
                        required: "Note content is required.",
                        maxLength: { value: 100000, message: "Content is too long." },
                      })}
                    />
                  </>
                )}

                {contentMode === "document" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
                      <Info className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="text-body font-semibold text-text-strong">Save first, then upload your document</p>
                    <p className="text-small text-text-muted">
                      Click <strong>Save as Draft</strong> below to create the lesson. Once saved, you'll be taken to the lesson editor where you can upload your Word (.docx) or PDF document.
                    </p>
                    <p className="text-caption text-text-muted">
                      The document upload requires a lesson ID which is generated when you save.
                    </p>
                  </div>
                )}
              </>
            )}

            {lessonType === "drawing" && (
              <div className="space-y-4">
                <p className="text-small text-text-muted">
                  Add the steps for your drawing lesson. You can upload step images and teacher audio recordings after saving.
                </p>

                {fields.map((field, index) => (
                  <DrawingStepRow
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                    onRemove={() => fields.length > 1 && remove(index)}
                    onMoveUp={() => index > 0 && swap(index, index - 1)}
                    onMoveDown={() => index < fields.length - 1 && swap(index, index + 1)}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ title: "", description: "" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="ghost" onClick={() => goToStep(1)}>
                Back
              </Button>
              <Button type="button" variant="primary" onClick={() => goToStep(3)}>
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Save ─────────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-h4">Review Your Lesson</h2>
            <ReviewSummary values={getValues()} subjects={subjects} />

            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <p className="text-small text-text-muted">
                <span className="font-semibold text-text-body">Questions</span> — You can add questions to this lesson after saving. The quiz builder will be available in a future update.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => goToStep(2)}>
                Back
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  loading={isSaving}
                  disabled={isSaving || isPublishing}
                  onClick={handleSubmit(saveAsDraft)}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={isPublishing}
                  disabled={isSaving || isPublishing}
                  onClick={handleSubmit(saveAndPublish)}
                >
                  Save & Publish
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherCreateLesson;
