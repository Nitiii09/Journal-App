import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FullPageLoader } from "../components/ui/Loader";

/**
 * Gate for authenticated areas. Waits for the auth context to finish reading
 * storage before deciding, so a refresh never flashes the login screen, and
 * remembers where the user was headed so they land there after signing in.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return <FullPageLoader message="Opening your journal…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
