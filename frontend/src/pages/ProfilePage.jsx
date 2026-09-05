import { CheckCircle2, XCircle } from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import Card from "../components/ui/Card.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Badge from "../components/ui/Badge.jsx";
import { useAuthStore } from "../stores/authStore.js";

const ROLE_LABELS = { student: "Student", teacher: "Teacher", admin: "Admin" };

/** Read-only profile summary for the current authenticated user. Editing comes in a later phase. */
const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <PageContainer className="max-w-2xl py-12">
      <Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar name={user.fullName} src={user.profileImage} size="lg" />
        <div>
          <h1 className="text-h3">{user.fullName}</h1>
          <p className="text-small mt-1 text-text-muted">{user.email}</p>
          <Badge variant="primary" className="mt-2">
            {ROLE_LABELS[user.role] || user.role}
          </Badge>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-h4 mb-4">Account status</h2>
        <div className="flex items-center gap-3">
          {user.isEmailVerified ? (
            <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 text-accent" aria-hidden="true" />
          )}
          <span className="text-body text-text-body">
            {user.isEmailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
