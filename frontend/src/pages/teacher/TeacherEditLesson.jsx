import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown, UploadCloud, Mic, Info, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ContentModeSelector from "../../components/ui/ContentModeSelector.jsx";
import DocumentUploader from "../../components/ui/DocumentUploader.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  getLesson,
  updateLesson,
  publishLesson,
  archiveLesson,
  uploadCoverImage,
  uploadStepImage,
  uploadStepAudio,
} from "../../services/lessonService.js";

const STATUS_BADGE = {
  draft: { variant: "neutral", label: "Draft" },
  published: { variant: "secondary", label: "Published" },
  archived: { variant: "danger", label: "Archived" },
};

/** Simple inline file upload button. */
const UploadButton = ({ accept, label, icon: Icon, onFile, disabled }) => {
  const id = `upload-${Math.random().toString(36).slice(2)}`;
  return (
    <label
      htmlFor={id}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-2.5 text-small font-medium text-text-muted transition-colors hover:border-primary hover:text-primary ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  );
};

const TeacherEditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSteps, setUploadingSteps] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null });
  const [contentMode, setContentMode] = useState("text");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm();

  const { fields, append, remove, swap } = useFieldArray({ control, name: "drawingSteps" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLesson(id);
        const l = res.data.lesson;
        setLesson(l);
        setContentMode(l.contentMode || "text");
        reset({
          title: l.title ?? "",
          description: l.description ?? "",
          content: l.content ?? "",
          drawingSteps: l.drawingSteps?.map((s) => ({
            _id: s._id,
            title: s.title ?? "",
            description: s.description ?? "",
            image: s.image,
            audio: s.audio,
          })) ?? [],
        });
      } catch {
        setFetchError("Unable to load this lesson. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id, reset]);

  const onSave = async (values) => {
    setIsSaving(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        contentMode,
      };
      if (lesson.type === "note") {
        payload.content = values.content;
      } else if (lesson.type === "drawing") {
        payload.drawingSteps = values.drawingSteps.map((step, idx) => ({
          ...(step._id ? { _id: step._id } : {}),
          stepNumber: idx + 1,
          title: step.title || null,
          description: step.description || null,
          image: step.image,
          audio: step.audio,
        }));
      }
      const res = await updateLesson(id, payload);
      setLesson(res.data.lesson);
      reset(values);
      toast.success("Lesson saved.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save lesson.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishLesson(id);
      toast.success("Lesson published.");
      navigate("/teacher/lessons");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to publish lesson.");
    }
    setConfirmModal({ open: false, action: null });
  };

  const handleArchive = async () => {
    try {
      await archiveLesson(id);
      toast.success("Lesson archived.");
      navigate("/teacher/lessons");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to archive lesson.");
    }
    setConfirmModal({ open: false, action: null });
  };

  // Cover image upload
  const handleCoverUpload = async (file) => {
    try {
      const res = await uploadCoverImage(id, file);
      setLesson((prev) => ({ ...prev, coverImage: res.data.coverImage }));
      toast.success("Cover image updated.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Cover image upload failed.");
    }
  };

  // Drawing step uploads
  const handleStepImageUpload = async (stepId, file) => {
    setUploadingSteps((prev) => ({ ...prev, [`${stepId}-img`]: true }));
    try {
      await uploadStepImage(id, stepId, file);
      // Refresh lesson to get updated step data
      const res = await getLesson(id);
      setLesson(res.data.lesson);
      toast.success("Step image uploaded.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Step image upload failed.");
    } finally {
      setUploadingSteps((prev) => ({ ...prev, [`${stepId}-img`]: false }));
    }
  };

  const handleStepAudioUpload = async (stepId, file) => {
    setUploadingSteps((prev) => ({ ...prev, [`${stepId}-audio`]: true }));
    try {
      await uploadStepAudio(id, stepId, file);
      const res = await getLesson(id);
      setLesson(res.data.lesson);
      toast.success("Step audio uploaded.");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Step audio upload failed.");
    } finally {
      setUploadingSteps((prev) => ({ ...prev, [`${stepId}-audio`]: false }));
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
        <Button variant="outline" to="/teacher/lessons">Back to lessons</Button>
      </div>
    );
  }

  const isArchived = lesson.status === "archived";
  const isPublished = lesson.status === "published";
  const isDraft = lesson.status === "draft";
  const statusConfig = STATUS_BADGE[lesson.status] ?? STATUS_BADGE.draft;

  return (
    <div>
      <PageHeader
        title="Edit Lesson"
        description={lesson.title}
        action={
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            {isDraft && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmModal({ open: true, action: "publish" })}
              >
                Publish
              </Button>
            )}
            {isPublished && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmModal({ open: true, action: "archive" })}
              >
                Archive
              </Button>
            )}
          </div>
        }
      />

      {isArchived && (
        <div className="mb-6 rounded-xl border border-border bg-surface-muted p-4">
          <p className="text-small text-text-muted">This lesson is archived and not visible to students.</p>
        </div>
      )}

      {/* Cover image */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-h4">Cover Image</h2>
            {lesson.coverImage ? (
              <div className="mt-3 flex items-center gap-2 text-secondary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-small">Cover image uploaded</span>
              </div>
            ) : (
              <p className="text-small mt-1 text-text-muted">No cover image yet.</p>
            )}
          </div>
          {lesson.coverImage?.url && (
            <img
              src={lesson.coverImage.url}
              alt="Lesson cover"
              className="h-20 w-32 rounded-xl object-cover"
            />
          )}
          {!isArchived && (
            <UploadButton
              accept="image/jpeg,image/jpg,image/png,image/webp"
              label="Upload cover"
              icon={UploadCloud}
              onFile={handleCoverUpload}
            />
          )}
        </div>
      </Card>

      {/* Main form */}
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit(onSave)} noValidate>
          <Input
            id="title"
            label="Lesson title"
            required
            error={errors.title?.message}
            disabled={isArchived}
            {...register("title", {
              required: "A title is required.",
              maxLength: { value: 300, message: "Title cannot exceed 300 characters." },
            })}
          />

          <Textarea
            id="description"
            label="Description"
            rows={3}
            error={errors.description?.message}
            disabled={isArchived}
            {...register("description", {
              maxLength: { value: 1000, message: "Description cannot exceed 1000 characters." },
            })}
          />

          {/* Note content — dual mode: type OR upload document */}
          {lesson.type === "note" && (
            <>
              {/* Content mode selector */}
              {!isArchived && (
                <ContentModeSelector
                  value={contentMode}
                  onChange={(mode) => {
                    setContentMode(mode);
                  }}
                />
              )}

              {/* Type mode — plain text editor */}
              {contentMode === "text" && (
                <>
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-small text-primary">
                      Smart Bionote Reader reads this content aloud to students automatically using a built-in reading voice. No audio upload needed.
                    </p>
                  </div>
                  <Textarea
                    id="content"
                    label="Lesson content"
                    rows={16}
                    required
                    error={errors.content?.message}
                    disabled={isArchived}
                    {...register("content", {
                      required: contentMode === "text" ? "Note content is required." : false,
                      maxLength: { value: 100000, message: "Content is too long." },
                    })}
                  />
                </>
              )}

              {/* Document mode — upload Word / PDF */}
              {contentMode === "document" && (
                <>
                  <DocumentUploader
                    lessonId={id}
                    currentDocument={lesson.document}
                    disabled={isArchived}
                    onSuccess={(data) => {
                      setLesson((prev) => ({
                        ...prev,
                        document: data.document,
                        contentMode: data.contentMode,
                        content: data.document?.plainText || prev.content,
                      }));
                      toast.success("Document uploaded and processed.");
                    }}
                  />

                  {/* Plain text fallback for PDF or voice override */}
                  <div>
                    <Textarea
                      id="content"
                      label={lesson.document?.type === "pdf"
                        ? "Plain text for voice reader (required for PDF)"
                        : "Plain text for voice reader (auto-extracted from Word doc — you can edit)"}
                      rows={8}
                      error={errors.content?.message}
                      disabled={isArchived}
                      {...register("content")}
                    />
                    <p className="text-caption mt-1 text-text-muted">
                      This text is what the Smart Reader speaks aloud. It was extracted from your document automatically.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Drawing steps */}
          {lesson.type === "drawing" && (
            <div className="space-y-4">
              <h3 className="text-h4">Drawing Steps</h3>
              {fields.map((field, index) => {
                // Find the saved step data from the lesson for media display
                const savedStep = lesson.drawingSteps?.[index];
                const stepId = savedStep?._id;
                const isUploadingImg = uploadingSteps[`${stepId}-img`];
                const isUploadingAudio = uploadingSteps[`${stepId}-audio`];

                return (
                  <div key={field.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-small font-semibold text-text-strong">Step {index + 1}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => index > 0 && swap(index, index - 1)} disabled={index === 0} aria-label="Move up">
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => index < fields.length - 1 && swap(index, index + 1)} disabled={index === fields.length - 1} aria-label="Move down">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} aria-label="Remove step" className="text-danger hover:text-danger" disabled={isArchived}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        id={`drawingSteps.${index}.title`}
                        label="Step title"
                        placeholder="e.g. Draw the cell wall"
                        disabled={isArchived}
                        error={errors?.drawingSteps?.[index]?.title?.message}
                        {...register(`drawingSteps.${index}.title`, {
                          maxLength: { value: 200, message: "Step title is too long." },
                        })}
                      />
                      <Textarea
                        id={`drawingSteps.${index}.description`}
                        label="Step description"
                        placeholder="What should the student draw or do in this step?"
                        rows={3}
                        disabled={isArchived}
                        error={errors?.drawingSteps?.[index]?.description?.message}
                        {...register(`drawingSteps.${index}.description`, {
                          maxLength: { value: 2000, message: "Step description is too long." },
                        })}
                      />

                      {/* Media uploads — only available once the lesson has a real stepId */}
                      {stepId && !isArchived && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          <div className="flex flex-col gap-1">
                            {savedStep?.image?.url ? (
                              <div className="flex items-center gap-2 text-secondary">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs">Image uploaded</span>
                              </div>
                            ) : null}
                            <UploadButton
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              label={isUploadingImg ? "Uploading…" : (savedStep?.image ? "Replace image" : "Upload image")}
                              icon={UploadCloud}
                              disabled={isUploadingImg}
                              onFile={(file) => handleStepImageUpload(stepId, file)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            {savedStep?.audio?.url ? (
                              <div className="flex items-center gap-2 text-secondary">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs">Audio uploaded</span>
                              </div>
                            ) : null}
                            <UploadButton
                              accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac"
                              label={isUploadingAudio ? "Uploading…" : (savedStep?.audio ? "Replace audio" : "Upload your voice")}
                              icon={Mic}
                              disabled={isUploadingAudio}
                              onFile={(file) => handleStepAudioUpload(stepId, file)}
                            />
                          </div>
                        </div>
                      )}
                      {!stepId && (
                        <p className="text-xs text-text-muted pt-1">Save the lesson first to enable image and audio uploads for this step.</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {!isArchived && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ title: "", description: "" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              )}
            </div>
          )}

          {/* Questions placeholder */}
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-small font-medium text-text-body">Questions</p>
            <p className="text-small mt-1 text-text-muted">
              The question builder will be available in a future update. Questions will appear here.
            </p>
          </div>

          {!isArchived && (
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={isSaving} disabled={!isDirty || isSaving}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Confirm publish modal */}
      <Modal
        open={confirmModal.open && confirmModal.action === "publish"}
        onClose={() => setConfirmModal({ open: false, action: null })}
        title="Publish lesson"
      >
        <p className="text-body text-text-body">
          This will make the lesson visible to students. Make sure the content is complete and ready.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmModal({ open: false, action: null })}>Cancel</Button>
          <Button variant="secondary" onClick={handlePublish}>Publish</Button>
        </div>
      </Modal>

      {/* Confirm archive modal */}
      <Modal
        open={confirmModal.open && confirmModal.action === "archive"}
        onClose={() => setConfirmModal({ open: false, action: null })}
        title="Archive lesson"
      >
        <p className="text-body text-text-body">
          Archiving will hide this lesson from students. You can still view and edit it here.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmModal({ open: false, action: null })}>Cancel</Button>
          <Button variant="ghost" onClick={handleArchive}>Archive</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherEditLesson;
