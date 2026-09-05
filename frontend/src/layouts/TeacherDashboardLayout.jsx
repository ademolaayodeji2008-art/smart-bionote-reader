import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { TEACHER_NAV_ITEMS } from "../utils/navConfig.js";

const TeacherDashboardLayout = () => (
  <DashboardLayout roleLabel="Teacher" navItems={TEACHER_NAV_ITEMS} />
);

export default TeacherDashboardLayout;
