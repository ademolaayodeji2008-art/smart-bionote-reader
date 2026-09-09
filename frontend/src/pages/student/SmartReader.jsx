/**
 * Smart Biology Reader — Phase 7
 *
 * Uses browser SpeechSynthesis to read note lessons aloud.
 * The teacher does NOT upload audio for notes — the student's device provides the voice.
 *
 * Key architecture decisions:
 * - Content is split into sentences. Each sentence becomes its own SpeechSynthesisUtterance.
 * - onboundary (word) events drive word-level highlighting where the browser supports it.
 * - Falls back to sentence-level only when word boundary events are unavailable.
 * - Progress is saved via a debounced API call every ~3 seconds.
 * - "Continue from where you left off" is shown if prior progress exists.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, Square,
  Volume2, Gauge, Mic2, BookmarkPlus, BookmarkCheck, CheckCircle2, ChevronDown,
} from "lucide-react";
import { getLesson } from "../../services/lessonService.js";
import { getProgressForLesson, updateProgress } from "../../services/progressService.js";
import { addBookmark, removeBookmark } from "../../services/bookmarkService.js";
import { useSpeechReader } from "../../hooks/useSpeechReader.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useToast } from "../../hooks/useToast.js";
import { useAuthStore } from "../../stores/authStore.js";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ProtectedContent from "../../components/ui/ProtectedContent.jsx";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

/** Renders lesson text with sentence + word highlighting. */
const RenderedContent = ({ sentences, activeSentenceIdx, activeWordRange, sentenceRefs }) => (
  <div className="leading-relaxed">
    {sentences.map((sentence, idx) => {
      const isActive = idx === activeSentenceIdx;
      let displaySentence;

      if (isActive && activeWordRange) {
        const { start, end } = activeWordRange;
        const before = sentence.slice(0, start);
        const word = sentence.slice(start, end || start + 1);
        const after = sentence.slice(end || start + 1);
        displaySentence = (
          <>
            {before}
            <mark className="animate-scale-in rounded bg-accent/30 px-0.5 text-[1.08em] font-semibold text-text-strong">
              {word}
            </mark>
            {after}
          </>
        );
      } else {
        displaySentence = sentence;
      }

      return (
        <span
          key={idx}
          ref={(el) => { if (sentenceRefs.current) sentenceRefs.current[idx] = el; }}
          className={`transition-all duration-200 ${
            isActive
              ? "rounded bg-primary/10 px-1 text-text-strong"
              : "text-text-body"
          }`}
        >
          {displaySentence}{" "}
        </span>
      );
    })}
  </div>
);

const SmartReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);
  const [followReading, setFollowReading] = useState(true);

  const sentenceRefs = useRef([]);
  const contentScrollRef = useRef(null);

  const reader = useSpeechReader(lesson?.content ?? "");
  const user = useAuthStore((s) => s.user);

  // ── Load lesson + prior progress ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [lessonRes, progressRes] = await Promise.allSettled([
          getLesson(id),
          getProgressForLesson(id),
        ]);
        if (lessonRes.status === "fulfilled") {
          setLesson(lessonRes.value.data.lesson);
        } else {
          setError("Unable to load this lesson.");
          return;
        }
        if (progressRes.status === "fulfilled" && progressRes.value?.data?.progress) {
          const p = progressRes.value.data.progress;
          if (p.lastPosition > 0 && !p.completed) {
            setSavedPosition(p.lastPosition);
            setShowResumeModal(true);
          }
        }
      } catch {
        setError("Unable to load this lesson.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Auto-scroll to active sentence ───────────────────────────────────────
  useEffect(() => {
    if (!followReading || reader.activeSentenceIdx < 0) return;
    const el = sentenceRefs.current[reader.activeSentenceIdx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [reader.activeSentenceIdx, followReading]);

  // ── Save progress (debounced, every 3s) ──────────────────────────────────
  const saveProgress = useDebounce(async (pct, pos) => {
    try {
      await updateProgress(id, { progressPercentage: pct, lastPosition: pos });
    } catch {
      // Non-critical
    }
  }, 3000);

  useEffect(() => {
    if (reader.isPlaying) {
      saveProgress(reader.progress, reader.currentSentenceIdx);
    }
  }, [reader.progress, reader.currentSentenceIdx, reader.isPlaying, saveProgress]);

  // ── Mark complete when reading finishes ──────────────────────────────────
  useEffect(() => {
    if (reader.progress >= 100 && !reader.isPlaying) {
      updateProgress(id, { progressPercentage: 100, lastPosition: 0 }).catch(() => {});
    }
  }, [reader.progress, reader.isPlaying, id]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
        toast.info("Bookmark removed.");
      } else {
        await addBookmark(id);
        setIsBookmarked(true);
        toast.success("Lesson bookmarked.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not update bookmark.");
    }
  };

  const handleMarkComplete = async () => {
    await updateProgress(id, { progressPercentage: 100, lastPosition: 0 });
    toast.success("Lesson marked as complete.");
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>
  );
  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center p-4">
      <p className="text-body text-danger">{error}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => { reader.stop(); navigate(-1); }}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-small truncate font-semibold text-text-strong">{lesson.title}</p>
            {lesson.subject && <p className="text-caption">{lesson.subject.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="rounded-xl p-2 text-text-muted hover:text-primary transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <BookmarkPlus className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Reading progress bar */}
        <div className="h-1 bg-surface-muted">
          <div
            className="h-full bg-primary transition-[width] duration-500"
            style={{ width: `${reader.progress}%` }}
          />
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" ref={contentScrollRef}>
        <div className="mb-6">
          <h1 className="text-h2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-body mt-2 text-text-muted">{lesson.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lesson.subject && <Badge variant="primary">{lesson.subject.name}</Badge>}
            {lesson.teacher && <span className="text-caption">{lesson.teacher.fullName}</span>}
          </div>
        </div>

        {!reader.isSpeechSupported && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-small text-accent">
              Your browser does not support the Web Speech API. You can still read the content below, but audio reading is not available.
            </p>
          </div>
        )}

        {/* Auto-scroll toggle */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-small text-text-muted">
            <input
              type="checkbox"
              checked={followReading}
              onChange={(e) => setFollowReading(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Follow reading
          </label>
        </div>

        {/* Lesson content — switches between document HTML, PDF embed, or plain text */}
        {lesson.contentMode === "document" && lesson.document ? (
          lesson.document.type === "pdf" ? (
            /* PDF viewer */
            <ProtectedContent email={user?.email}>
              <div className="mb-6 rounded-xl overflow-hidden border border-border">
                <iframe
                  src={lesson.document.url}
                  title={lesson.title}
                  className="w-full"
                  style={{ height: "75vh", minHeight: "500px" }}
                  aria-label="Lesson PDF document"
                />
              </div>
            </ProtectedContent>
          ) : (
            /* Word document — render extracted HTML */
            <ProtectedContent email={user?.email}>
              <article
                className="prose-custom text-body leading-8 text-text-body doc-content"
                dangerouslySetInnerHTML={{ __html: lesson.document.html || "" }}
              />
            </ProtectedContent>
          )
        ) : (
          /* Plain text mode — highlighted by TTS */
          <ProtectedContent email={user?.email}>
            <article className="prose-custom text-body leading-8 text-text-body">
              {lesson.content ? (
                <RenderedContent
                  sentences={reader.sentences}
                  activeSentenceIdx={reader.activeSentenceIdx}
                  activeWordRange={reader.activeWordRange}
                  sentenceRefs={sentenceRefs}
                />
              ) : (
                <p className="text-text-muted italic">No content available.</p>
              )}
            </article>
          </ProtectedContent>
        )}

        {/* Mark complete */}
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={handleMarkComplete}>
            <CheckCircle2 className="h-4 w-4" />
            Mark as Complete
          </Button>
        </div>
      </main>

      {/* ── Reader controls ──────────────────────────────────────────────── */}
      {reader.isSpeechSupported && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface shadow-2xl">
          <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
            {/* Main controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button onClick={reader.prevSentence} aria-label="Previous sentence"
                className="rounded-xl p-2.5 text-text-muted hover:bg-surface-muted hover:text-text-strong disabled:opacity-40 transition-colors"
                disabled={!reader.isPlaying && !reader.isPaused}>
                <SkipBack className="h-5 w-5" />
              </button>

              <button onClick={reader.restart} aria-label="Restart"
                className="rounded-xl p-2.5 text-text-muted hover:bg-surface-muted hover:text-text-strong transition-colors">
                <RotateCcw className="h-5 w-5" />
              </button>

              {/* Play / Pause / Resume */}
              {!reader.isPlaying && !reader.isPaused ? (
                <button onClick={() => reader.play()} aria-label="Play"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors">
                  <Play className="h-5 w-5 translate-x-0.5" />
                </button>
              ) : reader.isPaused ? (
                <button onClick={reader.resume} aria-label="Resume"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors">
                  <Play className="h-5 w-5 translate-x-0.5" />
                </button>
              ) : (
                <button onClick={reader.pause} aria-label="Pause"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors">
                  <Pause className="h-5 w-5" />
                </button>
              )}

              <button onClick={reader.stop} aria-label="Stop"
                className="rounded-xl p-2.5 text-text-muted hover:bg-surface-muted hover:text-text-strong disabled:opacity-40 transition-colors"
                disabled={!reader.isPlaying && !reader.isPaused}>
                <Square className="h-5 w-5" />
              </button>

              <button onClick={reader.nextSentence} aria-label="Next sentence"
                className="rounded-xl p-2.5 text-text-muted hover:bg-surface-muted hover:text-text-strong disabled:opacity-40 transition-colors"
                disabled={!reader.isPlaying && !reader.isPaused}>
                <SkipForward className="h-5 w-5" />
              </button>

              {/* Settings toggle */}
              <button onClick={() => setShowVoicePanel((v) => !v)} aria-label="Voice settings"
                className={`ml-2 rounded-xl p-2.5 transition-colors hover:bg-surface-muted ${showVoicePanel ? "text-primary" : "text-text-muted"}`}>
                <Mic2 className="h-5 w-5" />
              </button>
            </div>

            {/* Speed selector */}
            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
              {SPEED_OPTIONS.map((s) => (
                <button key={s}
                  onClick={() => reader.updateSettings({ rate: s })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    reader.settings.rate === s
                      ? "bg-primary text-white"
                      : "bg-surface-muted text-text-muted hover:text-text-strong"
                  }`}
                  aria-label={`${s}x speed`}
                  aria-pressed={reader.settings.rate === s}
                >
                  {s}×
                </button>
              ))}
            </div>

            {/* Voice panel */}
            {showVoicePanel && (
              <div className="mt-3 border-t border-border pt-3 space-y-3">
                {/* Voice selector */}
                <div>
                  <p className="text-caption mb-1">Voice</p>
                  {!reader.voicesReady ? (
                    <p className="text-small text-text-muted">Loading voices…</p>
                  ) : reader.voices.length === 0 ? (
                    <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                      <p className="text-small text-accent font-semibold">No voices found</p>
                      <p className="text-small text-text-muted mt-1">
                        Your browser has no TTS voices installed. On Android, go to <strong>Settings → General Management → Text-to-speech → Install voice data</strong>. On iPhone, go to <strong>Settings → Accessibility → Spoken Content → Voices</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto rounded-xl border border-border bg-surface">
                      {reader.voices.map((v) => (
                        <button key={v.voiceURI}
                          onClick={() => reader.updateSettings({ voiceURI: v.voiceURI })}
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-small transition-colors hover:bg-surface-muted ${
                            reader.settings.voiceURI === v.voiceURI ? "font-semibold text-primary" : "text-text-body"
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="text-caption">{v.lang}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {/* Pitch */}
                  <div>
                    <label className="text-caption mb-1 block">
                      Pitch
                    </label>
                    <input type="range" min="0.5" max="2" step="0.1"
                      value={reader.settings.pitch}
                      onChange={(e) => reader.updateSettings({ pitch: parseFloat(e.target.value) })}
                      className="w-full accent-primary" aria-label="Pitch" />
                    <p className="text-caption mt-0.5 text-right">{reader.settings.pitch.toFixed(1)}</p>
                  </div>
                  {/* Volume */}
                  <div>
                    <label className="text-caption mb-1 block">
                      <Volume2 className="mr-1 inline h-3 w-3" />Volume
                    </label>
                    <input type="range" min="0" max="1" step="0.05"
                      value={reader.settings.volume}
                      onChange={(e) => reader.updateSettings({ volume: parseFloat(e.target.value) })}
                      className="w-full accent-primary" aria-label="Volume" />
                    <p className="text-caption mt-0.5 text-right">{Math.round(reader.settings.volume * 100)}%</p>
                  </div>
                  {/* Progress indicator */}
                  <div className="flex flex-col justify-center">
                    <p className="text-caption">Progress</p>
                    <p className="text-h4 text-primary">{reader.progress}%</p>
                    <p className="text-caption">{reader.currentSentenceIdx}/{reader.totalSentences} sentences</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Resume modal ─────────────────────────────────────────────────── */}
      <Modal open={showResumeModal} onClose={() => setShowResumeModal(false)} title="Continue reading?">
        <p className="text-body text-text-body">
          You previously stopped reading this lesson. Would you like to continue from where you left off?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowResumeModal(false)}>Start again</Button>
          <Button variant="primary" onClick={() => {
            setShowResumeModal(false);
            reader.play(savedPosition);
          }}>
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SmartReader;
