import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import api from "../../services/api.js";

const TeacherStudents = () => {
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/classes/my-classes")
      .then((res) => {
        const cls = res.data.data.classes ?? [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClass(cls[0]._id);
      })
      .catch(() => setError("Unable to load classes."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setIsLoading(true);
    api.get(`/enrollments/class/${selectedClass}`)
      .then((res) => setEnrollments(res.data.data.enrollments ?? []))
      .catch(() => setEnrollments([]))
      .finally(() => setIsLoading(false));
  }, [selectedClass]);

  return (
    <div>
      <PageHeader title="Students" description="Students enrolled in your classes." />

      {/* Class selector */}
      {classes.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {classes.map((cls) => (
            <button key={cls._id}
              onClick={() => setSelectedClass(cls._id)}
              className={`rounded-xl px-4 py-2 text-small font-semibold transition-colors ${
                selectedClass === cls._id
                  ? "bg-primary text-white"
                  : "bg-surface-muted text-text-muted hover:text-text-strong"
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <Card className="py-10 text-center">
          <p className="text-body text-danger">{error}</p>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">No classes yet</p>
          <p className="text-small mt-1 text-text-muted">Create a class to start managing students.</p>
        </Card>
      ) : enrollments.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-body text-text-muted">No students enrolled in this class yet.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-border text-caption">
                <th scope="col" className="px-5 py-3 font-semibold">Student</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={enrollment.student?.fullName} src={enrollment.student?.profileImage} size="sm" />
                    <div>
                      <p className="text-body font-medium text-text-strong">
                        {enrollment.student?.fullName ?? "—"}
                      </p>
                      <p className="text-caption">{enrollment.student?.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={enrollment.status === "active" ? "secondary" : "neutral"}>
                      {enrollment.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-body text-text-muted">
                    {enrollment.enrolledAt
                      ? new Date(enrollment.enrolledAt).toLocaleDateString("en-NG")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default TeacherStudents;
