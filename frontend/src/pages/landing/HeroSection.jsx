import { BookOpen, Headphones, Sparkles, Dna, Microscope, FlaskConical, Brain, Zap } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { APP_SLOGAN } from "../../utils/constants.js";

/** Floating Biology particle — small themed icon that drifts */
const FloatingParticle = ({ icon: Icon, color, style, delay = 0 }) => (
  <div
    className="animate-float-slow pointer-events-none absolute opacity-20"
    style={{ animationDelay: `${delay}ms`, ...style }}
    aria-hidden="true"
  >
    <Icon className={`h-8 w-8 ${color}`} />
  </div>
);

/** Animated waveform bars representing the TTS audio reader */
const AudioWaveform = () => (
  <div className="flex items-end gap-1" aria-hidden="true">
    {[40, 70, 55, 90, 60, 80, 45, 75, 55, 65, 85, 50].map((pct, i) => (
      <span
        key={i}
        className="inline-block w-1.5 rounded-full bg-secondary animate-waveform"
        style={{
          height: `${pct}%`,
          maxHeight: "28px",
          minHeight: "4px",
          animationDelay: `${i * 80}ms`,
          animationDuration: `${0.6 + (i % 3) * 0.2}s`,
        }}
      />
    ))}
  </div>
);

/** Floating card — Biology note reader mockup with a typing cursor */
const NoteCard = () => (
  <div
    className="animate-fade-in-up absolute left-0 top-4 w-52 rounded-2xl border border-border bg-surface p-4 shadow-xl"
    style={{ animationDelay: "100ms" }}
    aria-hidden="true"
  >
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookOpen className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-semibold text-text-strong">Biology Note</span>
    </div>
    <div className="space-y-1.5">
      {/* Highlighted "currently reading" line */}
      <div className="flex items-center gap-1">
        <div className="h-2 w-full rounded-full bg-primary/25" />
      </div>
      <div className="h-2 w-4/5 rounded-full bg-surface-muted" />
      <div className="h-2 w-3/5 rounded-full bg-surface-muted" />
      {/* Cursor blink */}
      <div className="flex items-center gap-1">
        <div className="h-2 w-2/5 rounded-full bg-surface-muted" />
        <span
          className="inline-block h-3 w-0.5 bg-primary"
          style={{ animation: "cursor-blink 1s step-end infinite" }}
        />
      </div>
    </div>
    {/* Reading progress mini-bar */}
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-muted">
      <div className="h-full w-3/5 rounded-full bg-primary" />
    </div>
    <p className="mt-1 text-right text-[10px] text-text-muted">60% read</p>
  </div>
);

/** Floating card — audio / voice reader */
const AudioCard = () => (
  <div
    className="animate-fade-in-up absolute bottom-6 right-0 w-44 rounded-2xl border border-border bg-surface p-4 shadow-xl"
    style={{ animationDelay: "200ms" }}
    aria-hidden="true"
  >
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
        <Headphones className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-semibold text-text-strong">Smart Reader</span>
    </div>
    <div className="h-8">
      <AudioWaveform />
    </div>
    <p className="mt-2 text-[10px] text-text-muted">Reading aloud…</p>
  </div>
);

/** Floating card — XP / gamification */
const XPCard = () => (
  <div
    className="animate-float absolute -right-4 top-8 w-36 rounded-2xl border border-border bg-surface p-3.5 shadow-xl"
    style={{ animationDelay: "300ms" }}
    aria-hidden="true"
  >
    <div className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-accent" />
      <span className="text-xs font-semibold text-text-strong">+50 XP earned!</span>
    </div>
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: "68%", transition: "width 1s ease" }}
      />
    </div>
    <p className="mt-1 text-[10px] text-text-muted">Level 4 — 68%</p>
  </div>
);

/** Orbit ring with a small Biology icon */
const OrbitIcon = ({ icon: Icon, delay = 0 }) => (
  <div
    className="pointer-events-none absolute inset-0 flex items-center justify-center"
    aria-hidden="true"
  >
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border shadow-md"
      style={{ animation: `orbit 10s linear ${delay}ms infinite` }}
    >
      <Icon className="h-4 w-4 text-primary" />
    </div>
  </div>
);

const HeroSection = () => (
  <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8">
    {/* Background gradient */}
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(var(--color-primary), 0.12) 0%, transparent 70%)",
      }}
    />

    {/* Floating Biology particles in background */}
    <FloatingParticle icon={Dna}         color="text-primary"   style={{ top: "8%",  left: "5%" }}  delay={0}    />
    <FloatingParticle icon={Microscope}  color="text-secondary" style={{ top: "15%", right: "8%" }} delay={600}  />
    <FloatingParticle icon={FlaskConical}color="text-accent"    style={{ bottom: "18%", left: "8%" }} delay={1200} />
    <FloatingParticle icon={Brain}       color="text-primary"   style={{ bottom: "10%", right: "6%" }} delay={400} />
    <FloatingParticle icon={Zap}         color="text-accent"    style={{ top: "40%", left: "2%" }}  delay={800}  />

    <PageContainer>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

        {/* Left — copy */}
        <div className="text-center lg:text-left">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {APP_SLOGAN}
          </span>

          <h1 className="text-display animate-fade-in-up mt-6">
            The smartest way to{" "}
            <span
              className="animate-gradient-x bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
              style={{ backgroundSize: "200% auto" }}
            >
              study Biology
            </span>
          </h1>

          <p className="text-body animate-fade-in-up mx-auto mt-6 max-w-xl text-text-muted lg:mx-0" style={{ animationDelay: "100ms" }}>
            Smart Bionote Reader reads your lessons aloud, highlights every word as it speaks,
            and keeps you motivated with quizzes, streaks, and XP — all built for Nigerian students.
          </p>

          {/* Social proof numbers */}
          <div className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start" style={{ animationDelay: "150ms" }}>
            {[
              { value: "10×", label: "faster revision" },
              { value: "5 plans", label: "from ₦1,500/mo" },
              { value: "100%", label: "Biology focused" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-primary">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start" style={{ animationDelay: "200ms" }}>
            <Button to="/register" variant="primary" size="lg" className="group w-full sm:w-auto relative overflow-hidden">
              <span className="relative z-10">Start Learning Free</span>
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
            </Button>
            <Button to="/features" variant="outline" size="lg" className="w-full sm:w-auto">
              See How It Works
            </Button>
          </div>
        </div>

        {/* Right — animated visual */}
        <div className="relative mx-auto flex h-80 w-full max-w-sm items-center justify-center sm:h-96" aria-hidden="true">
          {/* Outer glow ring */}
          <div className="absolute h-64 w-64 rounded-full bg-primary/8 blur-3xl" />

          {/* Pulsing ring around centre */}
          <div className="absolute h-44 w-44 rounded-full border-2 border-primary/20 animate-pulse" />

          {/* Orbit ring */}
          <div className="absolute h-44 w-44 rounded-full">
            <OrbitIcon icon={Dna} delay={0} />
          </div>
          <div className="absolute h-44 w-44 rounded-full">
            <OrbitIcon icon={FlaskConical} delay={-5000} />
          </div>

          {/* Centre DNA / Biology icon */}
          <div className="animate-float relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30">
            <Dna className="h-12 w-12 text-white" />
          </div>

          {/* Floating UI cards */}
          <NoteCard />
          <AudioCard />
          <XPCard />
        </div>
      </div>
    </PageContainer>
  </section>
);

export default HeroSection;
