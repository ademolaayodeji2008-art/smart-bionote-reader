import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Flame, Sparkles, Trophy, BookOpen } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

const BENEFITS = [
  "Read Biology notes with the Smart Reader's built-in voice",
  "Learn drawings step by step with teacher-recorded explanations",
  "Check your understanding with bite-sized quizzes",
  "Build streaks and earn XP as you keep learning",
  "Download lessons to study offline, anywhere",
];

/** Counts up from 0 to `target` when the element enters the viewport */
const AnimatedCounter = ({ target, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1500;
          const step = Math.ceil(target / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

/** Mock student dashboard preview card */
const StudentPreview = () => (
  <div className="animate-fade-in-up relative mx-auto max-w-sm" aria-hidden="true">
    {/* Glow */}
    <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />

    <div className="relative rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
      {/* Mock browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary/50" />
        <div className="ml-3 h-4 flex-1 rounded-full bg-surface-muted/80" />
      </div>

      <div className="p-5 space-y-4">
        {/* Continue reading card */}
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Continue reading</p>
              <p className="text-sm font-bold text-text-strong mt-0.5">Photosynthesis & Light Reactions</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: "67%", transition: "width 1.5s ease 0.3s" }}
            />
          </div>
          <p className="text-[10px] mt-1 text-right text-text-muted">67% complete</p>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <Flame className="mx-auto h-5 w-5 text-accent mb-1" />
            <p className="text-sm font-bold text-text-strong">7</p>
            <p className="text-[10px] text-text-muted">Day streak</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-sm font-bold text-text-strong">1,240</p>
            <p className="text-[10px] text-text-muted">XP earned</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <Trophy className="mx-auto h-5 w-5 text-secondary mb-1" />
            <p className="text-sm font-bold text-text-strong">#12</p>
            <p className="text-[10px] text-text-muted">Rank</p>
          </div>
        </div>

        {/* Lesson items */}
        {["Cell Division", "Osmosis & Diffusion"].map((title, i) => (
          <div key={title} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-strong truncate">{title}</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: i === 0 ? "100%" : "34%" }}
                />
              </div>
            </div>
            {i === 0 && <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ForStudentsSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — animated preview (visible on desktop left, mobile top) */}
          <div className="order-2 lg:order-1">
            <StudentPreview />
          </div>

          {/* Right — copy with reveal */}
          <div ref={ref} className="order-1 lg:order-2">
            <div className="reveal">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                For Students
              </span>
              <h2 className="text-h2 mt-4">Study your way, at your pace</h2>
              <p className="text-body mt-4 text-text-muted">
                Everything you need to make sense of a lesson — reading, listening, and practising —
                lives in one friendly, distraction-free place built for Nigerian students.
              </p>
            </div>

            {/* Animated counter stats */}
            <div className="reveal reveal-delay-1 mt-6 flex flex-wrap gap-6">
              {[
                { target: 5, suffix: " subjects", label: "Available" },
                { target: 100, suffix: "%", label: "Browser-based TTS" },
                { target: 48, suffix: "h", label: "Offline access" },
              ].map(({ target, suffix, label }) => (
                <div key={label} className="text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-primary">
                    <AnimatedCounter target={target} suffix={suffix} />
                  </p>
                  <p className="text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </div>

            <ul className="reveal reveal-delay-2 mt-6 space-y-3">
              {BENEFITS.map((benefit, i) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <span className="text-body text-text-body">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="reveal reveal-delay-3 mt-8">
              <Button to="/register" variant="primary" size="lg" className="group relative overflow-hidden">
                <span className="relative z-10">Start Learning Today</span>
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default ForStudentsSection;
