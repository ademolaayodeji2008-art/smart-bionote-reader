import { Sparkles, ArrowRight } from "lucide-react";
import Section from "../../components/layout/Section.jsx";
import Button from "../../components/ui/Button.jsx";
import useScrollReveal from "../../hooks/useScrollReveal.js";

const CTASection = () => {
  const ref = useScrollReveal();

  return (
    <Section>
      <div ref={ref} className="reveal relative overflow-hidden rounded-3xl p-px">
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-3xl animate-gradient-x"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-primary))",
            backgroundSize: "300% 300%",
          }}
          aria-hidden="true"
        />

        <div className="relative rounded-3xl bg-surface px-8 py-14 text-center sm:px-14 overflow-hidden">
          {/* Subtle background blobs */}
          <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-2xl" aria-hidden="true" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Ready to get started?
            </span>

            <h2 className="text-h2 mx-auto max-w-2xl">
              Transform how you{" "}
              <span
                className="animate-gradient-x bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                style={{ backgroundSize: "200% auto" }}
              >
                study Biology
              </span>{" "}
              today
            </h2>

            <p className="text-body mx-auto mt-4 max-w-lg text-text-muted">
              Join Smart Bionote Reader and experience a smarter, more enjoyable way to read,
              listen, and grow. Plans start from ₦1,500/month.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button to="/register" variant="primary" size="lg" className="group w-full sm:w-auto relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Create Your Free Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
              </Button>
              <Button to="/login" variant="outline" size="lg" className="w-full sm:w-auto">
                I already have an account
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-small text-text-muted">
              {["No setup required", "Cancel anytime", "Nigerian Naira pricing", "Works offline"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CTASection;
