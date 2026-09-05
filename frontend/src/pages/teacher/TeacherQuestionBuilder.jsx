import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  getQuestionsWithAnswers, createQuestion, updateQuestion,
  deleteQuestion, reorderQuestions,
} from "../../services/quizService.js";
import { useToast } from "../../hooks/useToast.js";

const TYPE_OPTIONS = [
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short answer" },
];

const QuestionForm = ({ initial, onSave, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initial ?? {
      questionText: "", type: "multiple-choice",
      options: ["", "", "", ""], correctAnswer: "", explanation: "", marks: 1,
    },
  });
  const type = watch("type");

  const onSubmit = (values) => {
    const data = {
      questionText: values.questionText,
      type: values.type,
      correctAnswer: values.correctAnswer,
      explanation: values.explanation || null,
      marks: Number(values.marks) || 1,
    };
    if (type === "multiple-choice") {
      data.options = values.options.filter(Boolean);
    } else if (type === "true-false") {
      data.options = ["True", "False"];
    } else {
      data.options = [];
    }
    onSave(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Textarea id="questionText" label="Question" required rows={3}
        error={errors.questionText?.message}
        {...register("questionText", { required: "Question text is required." })} />

      <div className="grid grid-cols-2 gap-4">
        <Select id="type" label="Type" required options={TYPE_OPTIONS}
          {...register("type")} />
        <Input id="marks" label="Marks" type="number" min={0} max={100}
          {...register("marks")} />
      </div>

      {type === "multiple-choice" && (
        <div className="space-y-2">
          <p className="text-small font-medium text-text-strong">Options</p>
          {[0, 1, 2, 3].map((i) => (
            <Input key={i} id={`options.${i}`} placeholder={`Option ${String.fromCharCode(65 + i)}`}
              {...register(`options.${i}`)} />
          ))}
        </div>
      )}

      <Input id="correctAnswer" label="Correct answer" required
        placeholder={type === "multiple-choice" ? "Paste the exact option text" : type === "true-false" ? "True or False" : "Expected answer"}
        error={errors.correctAnswer?.message}
        {...register("correctAnswer", { required: "Correct answer is required." })} />

      <Textarea id="explanation" label="Explanation (shown after submission)" rows={2}
        {...register("explanation")} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">Save Question</Button>
      </div>
    </form>
  );
};

const TeacherQuestionBuilder = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getQuestionsWithAnswers(lessonId);
      setQuestions(res.data.questions);
    } catch { toast.error("Could not load questions."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      if (editingId) {
        await updateQuestion(lessonId, editingId, data);
        toast.success("Question updated.");
      } else {
        data.order = questions.length;
        await createQuestion(lessonId, data);
        toast.success("Question added.");
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestion(lessonId, deleteModal.id);
      toast.success("Question deleted.");
      setDeleteModal({ open: false, id: null });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete question.");
    }
  };

  const moveQuestion = async (idx, dir) => {
    const newQs = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= newQs.length) return;
    [newQs[idx], newQs[target]] = [newQs[target], newQs[idx]];
    setQuestions(newQs);
    const ordering = newQs.map((q, i) => ({ id: q._id, order: i }));
    await reorderQuestions(lessonId, ordering).catch(() => {});
  };

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Question Builder"
        description="Add and manage questions for this lesson's quiz."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>Back to lesson</Button>
            <Button variant="primary" onClick={() => { setEditingId(null); setShowForm(true); }}>
              <Plus className="h-4 w-4" />Add Question
            </Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-h4 mb-4">{editingId ? "Edit Question" : "New Question"}</h2>
          <QuestionForm
            initial={editingId ? questions.find((q) => q._id === editingId) : null}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
          />
        </Card>
      )}

      {questions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-body text-text-muted">No questions yet. Add your first question above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <Card key={q._id} className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1} aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text-strong">Q{idx + 1}. {q.questionText}</p>
                <p className="text-caption mt-1">{q.type} · {q.marks} mark{q.marks !== 1 ? "s" : ""}</p>
                {q.options?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <li key={oi} className="text-small text-text-muted">
                        {String.fromCharCode(65 + oi)}. {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(q._id); setShowForm(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger hover:text-danger"
                  onClick={() => setDeleteModal({ open: true, id: q._id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Delete question">
        <p className="text-body text-text-body">This question will be permanently deleted. This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherQuestionBuilder;
