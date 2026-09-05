import { CheckCircle2, FilePlus, BarChart3, Users, Mic } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

const BENEFITS = [
  "Publish notes, drawing lessons, and quizzes in one place",
  "Record your voice for each drawing step — students hear you explain",
  "See how your class is progressing at a glance",
  "Keep students motivated with streaks and leaderboards",
];

/** Teacher dashboard mini-mockup */
const TeacherPreview = () => (
  <div className="animate-fade-in-up relative mx-auto max-w-xs" aria-hidden="true">
    <div className="absolute -inset-4 rounded-3xl bg-secondary/10 blur-2xl" />
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      {/* Header */}
      <div className="border-b border-border bg-surface-muted px-4 py-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-danger/40" />
        <span className="h-2 w-2 rounded-full bg-accent/40" />
        <span className="h-2 w-2 rounded-full bg-secondary/40" />
        <span className="ml-2 text-xs font-semibold text-text-muted">Teacher Dashboard</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Lessons", value: "12", icon: FilePlus, color: "text-primary" },
            { label: "Students", value: "34", icon: Users, color: "text-secondary" },
            { label: "Avg Score", value: "78%", icon: BarChart3, color: "text-accent" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl bg-surface-muted p-2.5 text-center">
              <Icon className={`mx-auto h-4 w-4 ${color} mb-1`} />
              <p className="text-sm font-bold text-text-strong">{value}</p>
              <p className="text-[10px] text-text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent lessons */}
        {[
          { title: "Photosynthesis", type: "Note", status: "Published" },
          { title: "Cell Division", type: "Drawing", status: "Draft" },
        ].map(({ title, type, status }) => (
          <div key={title} className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-xs font-semibold text-text-strong">{title}</p>
              <p className="text-[10px] text-text-muted">{type}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              status === "Published" ? "bg-secondary/10 text-secondary" : "bg-surface-muted text-text-muted"
            }`}>
              {status}
            </span>
          </div>
        ))}

        {/* Drawing audio note */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <Mic className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-[10px] text-primary font-medium">
            Record your voice for drawing lesson steps
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ForTeachersSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="bg-surface-muted/40 px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — copy */}
          <div ref={ref}>
            <div className="reveal">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
                For Teachers
              </span>
              <h2 className="text-h2 mt-4">Create once, teach every student</h2>
              <p className="text-body mt-4 text-text-muted">
                Spend less time repeating explanations and more time teaching. Publish a lesson
                once and let Smart Bionote Reader guide every student through it — day or night.
              </p>
            </div>

            <ul className="reveal reveal-delay-1 mt-6 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <span className="text-body text-text-body">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="reveal reveal-delay-2 mt-8">
              <p className="text-small text-text-muted mb-4">
                Teachers are invited by admins — no public signup required.
              </p>
              <Button to="/login" variant="secondary" size="lg" className="group relative overflow-hidden">
                <span className="relative z-10">Teacher Login</span>
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Right — animated teacher dashboard mockup */}
          <div className="flex justify-center">
            <TeacherPreview />
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default ForTeachersSection;
