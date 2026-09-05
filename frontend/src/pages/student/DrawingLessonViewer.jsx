/**
 * DrawingLessonViewer — Phase 6/8
 *
 * Displays a drawing lesson step-by-step.
 * Each step has an image and teacher-recorded audio (streamed from Cloudinary).
 * Audio is NOT downloaded automatically — the student presses play.
 * Normal Biology notes are NOT affected; they use SmartReader (SpeechSynthesis).
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, Volume2,
  BookmarkPlus, BookmarkCheck, CheckCircle2, ZoomIn, ZoomOut,
} from "lucide-react";
import { getLesson } from "../../services/lessonService.js";
import { updateProgress } from "../../services/progressService.js";
import { addBookmark, removeBookmark } from "../../services/bookmarkService.js";
import { useToast } from "../../hooks/useToast.js";
import { useAuthStore } from "../../stores/authStore.js";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import ProtectedContent from "../../components/ui/ProtectedContent.jsx";

const DrawingLessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [zoom, setZoom] = useState(1);

  const audioRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLesson(id);
        setLesson(res.data.lesson);
      } catch {
        setError("Unable to load this lesson.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Pause audio when step changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [currentStepIdx]);

  // Save progress when step changes
  useEffect(() => {
    if (!lesson) return;
    const pct = Math.round(((currentStepIdx + 1) / lesson.drawingSteps.length) * 100);
    updateProgress(id, { progressPercentage: pct, lastPosition: currentStepIdx + 1 }).catch(() => {});
  }, [currentStepIdx, lesson, id]);

  const handleStepComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStepIdx]));
    if (currentStepIdx < (lesson?.drawingSteps.length ?? 1) - 1) {
      setCurrentStepIdx((i) => i + 1);
    }
  };

  const handleLessonComplete = async () => {
    await updateProgress(id, { progressPercentage: 100, lastPosition: lesson.drawingSteps.length });
    toast.success("Drawing lesson completed!");
    navigate(-1);
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) { await removeBookmark(id); setIsBookmarked(false); toast.info("Bookmark removed."); }
      else { await addBookmark(id); setIsBookmarked(true); toast.success("Lesson bookmarked."); }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update bookmark.");
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>
  );
  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <p className="text-body text-danger">{error}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
    </div>
  );

  const steps = lesson.drawingSteps ?? [];
  const step = steps[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === steps.length - 1;
  const progress = steps.length > 0 ? Math.round(((currentStepIdx + 1) / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
          <div className="text-center">
            <p className="text-small font-semibold text-text-strong truncate max-w-[180px] sm:max-w-xs">
              {lesson.title}
            </p>
            <p className="text-caption">
              Step {currentStepIdx + 1} of {steps.length}
            </p>
          </div>
          <button onClick={handleBookmark} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            className="rounded-xl p-2 text-text-muted hover:text-primary transition-colors">
            {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <BookmarkPlus className="h-5 w-5" />}
          </button>
        </div>
        <ProgressBar value={progress} className="h-1 rounded-none bg-surface-muted" />
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 pb-24">
        {/* Step indicator dots */}
        <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
          {steps.map((_, idx) => (
            <button key={idx}
              onClick={() => setCurrentStepIdx(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                idx === currentStepIdx
                  ? "scale-125 bg-primary"
                  : completedSteps.has(idx)
                  ? "bg-secondary"
                  : "bg-border hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        {step && (
          <ProtectedContent email={user?.email}>
            <div className="space-y-5">
            {/* Step title */}
            {step.title && (
              <div className="flex items-center gap-3">
                <Badge variant="primary">Step {currentStepIdx + 1}</Badge>
                <h2 className="text-h3">{step.title}</h2>
              </div>
            )}

            {/* Drawing image */}
            {step.image?.url ? (
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-muted">
                <div className="absolute right-3 top-3 z-10 flex gap-1">
                  <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in"
                    className="rounded-lg bg-surface/80 p-2 backdrop-blur-sm hover:bg-surface transition-colors">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} aria-label="Zoom out"
                    className="rounded-lg bg-surface/80 p-2 backdrop-blur-sm hover:bg-surface transition-colors">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-auto">
                  <img
                    src={step.image.url}
                    alt={step.title ?? `Step ${currentStepIdx + 1}`}
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s" }}
                    className="w-full max-h-[60vh] object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted text-text-muted">
                No image for this step
              </div>
            )}

            {/* Step description */}
            {step.description && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-body leading-relaxed text-text-body">{step.description}</p>
              </div>
            )}

            {/* Teacher audio — drawing step only */}
            {step.audio?.url && (
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                <div className="flex items-center gap-3">
                  <button onClick={toggleAudio} aria-label={isPlaying ? "Pause audio" : "Play teacher explanation"}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-md shadow-secondary/25 hover:bg-secondary-hover transition-colors">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-semibold text-secondary">Teacher Explanation</p>
                    {step.audio.duration && (
                      <p className="text-caption">{Math.round(step.audio.duration)}s</p>
                    )}
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                </div>
                <audio
                  ref={audioRef}
                  src={step.audio.url}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="mt-3 w-full"
                  controls
                />
              </div>
            )}
          </div>
          </ProtectedContent>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setCurrentStepIdx((i) => i - 1)} disabled={isFirst}>
            <ChevronLeft className="h-4 w-4" />Previous
          </Button>

          {isLast ? (
            <Button variant="secondary" onClick={handleLessonComplete}>
              <CheckCircle2 className="h-4 w-4" />
              Complete Lesson
            </Button>
          ) : (
            <Button variant="primary" onClick={handleStepComplete}>
              Next Step<ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default DrawingLessonViewer;
