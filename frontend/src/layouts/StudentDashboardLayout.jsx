import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { STUDENT_NAV_ITEMS, STUDENT_BOTTOM_NAV_ITEMS } from "../utils/navConfig.js";

const StudentDashboardLayout = () => (
  <DashboardLayout
    roleLabel="Student"
    navItems={STUDENT_NAV_ITEMS}
    bottomNavItems={STUDENT_BOTTOM_NAV_ITEMS}
  />
);

export default StudentDashboardLayout;
