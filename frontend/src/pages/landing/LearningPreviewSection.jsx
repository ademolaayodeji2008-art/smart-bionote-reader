import { Flame, Sparkles, BookOpen, CheckCircle2, Headphones, Volume2 } from "lucide-react";
import Section from "../../components/layout/Section.jsx";
import Card from "../../components/ui/Card.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

/** Animated TTS waveform */
const LiveWaveform = () => (
  <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
    {[30, 60, 45, 80, 55, 90, 40, 70, 50, 65, 85, 35, 75, 50, 60].map((pct, i) => (
      <span
        key={i}
        className="inline-block w-1 rounded-full bg-secondary animate-waveform"
        style={{
          height: `${pct}%`,
          animationDelay: `${i * 60}ms`,
          animationDuration: `${0.5 + (i % 4) * 0.15}s`,
        }}
      />
    ))}
  </div>
);

/** Highlighted sentence with a "currently spoken" word */
const HighlightedText = () => (
  <p className="text-small leading-7 text-text-body select-none" aria-hidden="true">
    Photosynthesis is the process by which green plants use{" "}
    <span className="rounded bg-primary/20 px-1 py-0.5 font-semibold text-primary text-[0.95em] transition-all">
      sunlight
    </span>
    {" "}to convert carbon dioxide and water into glucose and oxygen.
  </p>
);

const LearningPreviewSection = () => {
  const ref = useScrollReveal();

  return (
    <Section
      eyebrow="Learning Experience Preview"
      title="What studying actually looks like"
      description="A glimpse of what students experience inside Smart Bionote Reader."
    >
      <div ref={ref} className="mx-auto max-w-2xl">
        {/* Browser chrome mockup */}
        <div className="reveal overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/50" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/50" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary/50" aria-hidden="true" />
            <div className="ml-3 flex-1 flex items-center gap-2">
              <div className="h-4 w-4/5 max-w-xs rounded-full bg-surface-muted/80" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">

            {/* Smart Reader card */}
            <Card className="sm:col-span-2 reveal reveal-delay-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption">Now Reading</span>
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-secondary" aria-hidden="true" />
                  </div>
                  <h3 className="text-h4 truncate">Photosynthesis — SS2 Biology</h3>

                  {/* Highlighted text */}
                  <div className="mt-3">
                    <HighlightedText />
                  </div>

                  {/* Reading progress */}
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full w-3/5 rounded-full bg-primary transition-all duration-1000" />
                  </div>
                  <p className="mt-1 text-right text-caption">60% read</p>
                </div>
              </div>

              {/* Audio controls */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30">
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-strong">Smart Reader Active</p>
                    <LiveWaveform />
                  </div>
                </div>
                <div className="flex gap-2">
                  {["0.75×", "1×", "1.5×"].map((s, i) => (
                    <span
                      key={s}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        i === 1 ? "bg-primary text-white" : "bg-surface text-text-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Streak card */}
            <Card className="flex items-center gap-3 reveal reveal-delay-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent animate-bounce-subtle" aria-hidden="true">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-caption">Study streak</p>
                <p className="text-h4 mt-0.5">7 days 🔥</p>
              </div>
            </Card>

            {/* XP card */}
            <Card className="flex items-center gap-3 reveal reveal-delay-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary animate-float" aria-hidden="true">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-caption">Total XP</p>
                <p className="text-h4 mt-0.5">1,240 XP</p>
              </div>
            </Card>

          </div>
        </div>

        {/* Caption */}
        <p className="mt-5 text-center text-small text-text-muted">
          The Smart Reader highlights each sentence as it reads aloud — no teacher audio upload needed for notes.
        </p>
      </div>
    </Section>
  );
};

export default LearningPreviewSection;
