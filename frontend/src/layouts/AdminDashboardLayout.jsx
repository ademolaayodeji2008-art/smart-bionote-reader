import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { ADMIN_NAV_ITEMS } from "../utils/navConfig.js";

const AdminDashboardLayout = () => (
  <DashboardLayout roleLabel="Admin" navItems={ADMIN_NAV_ITEMS} />
);

export default AdminDashboardLayout;
