import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { getRoleHomePath } from "../utils/roleNavigation.js";
import FullPageLoader from "../components/ui/FullPageLoader.jsx";

/** Keeps already-authenticated users off login/register by sending them to their dashboard. */
const GuestRoute = () => {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  if (!isInitialized) {
    return <FullPageLoader label="Checking your session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
