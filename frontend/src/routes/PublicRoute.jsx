import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FullPageLoader } from "../components/ui/Loader";

/**
 * Login / signup. An already-authenticated user has no reason to be here,
 * so send them on to wherever they were originally headed.
 */
export default function PublicRoute() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  return <Outlet />;
}
