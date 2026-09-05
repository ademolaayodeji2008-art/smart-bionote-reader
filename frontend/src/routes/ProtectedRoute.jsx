import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { getRoleHomePath } from "../utils/roleNavigation.js";
import FullPageLoader from "../components/ui/FullPageLoader.jsx";

/**
 * Gates a route subtree behind authentication, and optionally a specific
 * set of roles. Unauthenticated users are sent to /login; authenticated
 * users with the wrong role are sent to their own dashboard rather than
 * an error page or login (they're already signed in — just in the wrong
 * place).
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return <FullPageLoader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
