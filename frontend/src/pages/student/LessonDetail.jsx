/**
 * LessonDetail — gateway page for /student/lessons/:id
 *
 * Loads the lesson and routes to the correct viewer:
 *   note    → SmartReader (SpeechSynthesis)
 *   drawing → DrawingLessonViewer (teacher audio per step)
 *
 * If accessed directly (URL bar), it redirects immediately.
 * If accessed via the lesson list it shows a brief summary with an Open button.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, PenLine, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getLesson } from "../../services/lessonService.js";
import { getProgressForLesson } from "../../services/progressService.js";
import { addBookmark, removeBookmark } from "../../services/bookmarkService.js";
import { useToast } from "../../hooks/useToast.js";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Card from "../../components/ui/Card.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonRes, progressRes] = await Promise.allSettled([
          getLesson(id),
          getProgressForLesson(id),
        ]);
        if (lessonRes.status === "fulfilled") setLesson(lessonRes.value.data.lesson);
        else { setError("Lesson not found."); return; }
        if (progressRes.status === "fulfilled") setProgress(progressRes.value?.data?.progress);
      } catch {
        setError("Unable to load this lesson.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleOpen = () => {
    if (lesson.type === "note") navigate(`/student/read/${id}`);
    else navigate(`/student/drawing/${id}`);
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) { await removeBookmark(id); setIsBookmarked(false); toast.info("Bookmark removed."); }
      else { await addBookmark(id); setIsBookmarked(true); toast.success("Lesson bookmarked."); }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update bookmark.");
    }
  };

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>
  );
  if (error) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-body text-danger">{error}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Back to lessons</Button>
    </div>
  );

  const Icon = lesson.type === "note" ? BookOpen : PenLine;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Cover */}
      {lesson.coverImage?.url ? (
        <img src={lesson.coverImage.url} alt={lesson.title}
          className="mb-6 h-52 w-full rounded-2xl object-cover shadow-md" />
      ) : (
        <div className="mb-6 flex h-52 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-md">
          <Icon className="h-14 w-14" aria-hidden="true" />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={lesson.type === "note" ? "primary" : "accent"}>
              {lesson.type === "note" ? "Note" : "Drawing"}
            </Badge>
            {lesson.subject && <Badge variant="neutral">{lesson.subject.name}</Badge>}
          </div>
          <button onClick={handleBookmark} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
            className="rounded-xl p-2 text-text-muted hover:text-primary transition-colors">
            {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <BookmarkPlus className="h-5 w-5" />}
          </button>
        </div>

        <h1 className="text-h2 mt-4">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-body mt-2 text-text-muted">{lesson.description}</p>
        )}
        {lesson.teacher && (
          <p className="text-caption mt-3">By {lesson.teacher.fullName}</p>
        )}

        {/* Progress */}
        {progress && !progress.completed && (
          <div className="mt-5">
            <p className="text-small mb-1 text-text-muted">Your progress</p>
            <ProgressBar value={progress.progressPercentage} showValue color="primary" />
          </div>
        )}
        {progress?.completed && (
          <div className="mt-4 flex items-center gap-2 text-secondary">
            <span className="text-sm font-semibold">Completed ✓</span>
          </div>
        )}

        {/* Type-specific info */}
        {lesson.type === "note" && (
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-small text-primary">
              <span className="font-semibold">Smart reading enabled.</span> Tap "Read Lesson" below to have the app read this Biology note aloud using your device's built-in voice. You can control speed, pitch, and voice selection.
            </p>
          </div>
        )}
        {lesson.type === "drawing" && (
          <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-small text-accent">
              <span className="font-semibold">Step-by-step drawing lesson</span> with {lesson.drawingSteps?.length ?? 0} steps. Each step includes a drawing image and your teacher's recorded explanation.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" className="flex-1" onClick={handleOpen}>
            <Icon className="h-4 w-4" />
            {lesson.type === "note"
              ? (progress?.lastPosition > 0 && !progress?.completed ? "Continue Reading" : "Read Lesson")
              : (progress?.lastPosition > 0 && !progress?.completed ? "Continue Drawing" : "Start Drawing Lesson")}
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Card>

      {/* Questions section foundation */}
      {lesson.questions && lesson.questions.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-h4">Quiz</h2>
          <p className="text-small mt-1 text-text-muted">
            {lesson.questions.length} question{lesson.questions.length !== 1 ? "s" : ""} available. Take the quiz after reading this lesson.
          </p>
          <Button to={`/student/lessons/${id}/quiz`} variant="outline" className="mt-4">
            Take Quiz
          </Button>
        </Card>
      )}
    </div>
  );
};

export default LessonDetail;
