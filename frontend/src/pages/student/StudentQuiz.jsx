import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { getQuestions, submitQuiz } from "../../services/quizService.js";
import { useToast } from "../../hooks/useToast.js";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";

const LETTER = ["A", "B", "C", "D", "E"];

const StudentQuiz = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getQuestions(lessonId)
      .then((r) => setQuestions(r.data.questions))
      .catch(() => setError("Unable to load quiz questions."))
      .finally(() => setIsLoading(false));
  }, [lessonId]);

  const setAnswer = (questionId, answer) =>
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await submitQuiz(lessonId, payload);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>
  );
  if (error) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-body text-danger">{error}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );

  // ── Results view ──────────────────────────────────────────────────────────
  if (result) {
    const { summary, gradedQuestions } = result;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Card className="text-center mb-6">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
            summary.passed ? "bg-secondary/10 text-secondary" : "bg-danger/10 text-danger"
          }`}>
            {summary.passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <h2 className="text-h2">{summary.passed ? "Well done!" : "Keep practising!"}</h2>
          <p className="text-h1 mt-2 font-bold text-primary">{summary.percentage}%</p>
          <p className="text-body mt-1 text-text-muted">
            {summary.correctAnswers} of {summary.totalQuestions} correct
            {" · "}Attempt #{summary.attemptNumber}
          </p>
          <ProgressBar value={summary.percentage} showValue color={summary.passed ? "secondary" : "accent"} className="mt-4" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>Back to lesson</Button>
            <Button variant="ghost" onClick={() => { setResult(null); setAnswers({}); }}>
              Try again
            </Button>
          </div>
        </Card>

        {/* Detailed review */}
        <div className="space-y-4">
          <h3 className="text-h3">Review</h3>
          {gradedQuestions.map((q, idx) => (
            <Card key={q.questionId} className={`border-l-4 ${q.isCorrect ? "border-l-secondary" : "border-l-danger"}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${q.isCorrect ? "text-secondary" : "text-danger"}`}>
                  {q.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-text-strong">
                    Q{idx + 1}. {q.questionText}
                  </p>
                  <p className="text-small mt-1 text-text-muted">
                    Your answer: <span className={q.isCorrect ? "text-secondary font-semibold" : "text-danger font-semibold"}>
                      {q.studentAnswer ?? "(no answer)"}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-small mt-0.5 text-secondary">
                      Correct: <span className="font-semibold">{q.correctAnswer}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-small mt-2 rounded-lg bg-surface-muted p-3 text-text-muted">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz taking view ──────────────────────────────────────────────────────
  const answered = Object.keys(answers).length;
  const pct = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />Back
        </Button>
        <h1 className="text-h2">Quiz</h1>
      </div>

      <div className="mb-6">
        <p className="text-small text-text-muted mb-2">{answered} of {questions.length} answered</p>
        <ProgressBar value={pct} color="primary" />
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => {
          const selected = answers[q._id];
          return (
            <Card key={q._id}>
              <p className="text-body font-semibold text-text-strong">
                Q{idx + 1}. {q.questionText}
              </p>
              <div className="mt-3 space-y-2">
                {q.type === "true-false" && !q.options?.length
                  ? ["True", "False"].map((opt) => (
                      <OptionButton key={opt} label={opt} value={opt}
                        selected={selected === opt} onSelect={() => setAnswer(q._id, opt)} />
                    ))
                  : q.options?.length > 0
                  ? q.options.map((opt, oi) => (
                      <OptionButton key={oi} label={`${LETTER[oi]}. ${opt}`} value={opt}
                        selected={selected === opt} onSelect={() => setAnswer(q._id, opt)} />
                    ))
                  : (
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      value={selected ?? ""}
                      onChange={(e) => setAnswer(q._id, e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-body text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

const OptionButton = ({ label, value, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-small transition-colors ${
      selected
        ? "border-primary bg-primary/5 font-semibold text-primary"
        : "border-border bg-surface text-text-body hover:border-primary/40 hover:bg-surface-muted"
    }`}
    aria-pressed={selected}
  >
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
      selected ? "border-primary bg-primary" : "border-border"
    }`}>
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
    {label}
  </button>
);

export default StudentQuiz;
