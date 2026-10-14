import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // not logged in
  if (!user?.isLogin)
    return <Navigate to="/login" state={{ from: location }} replace />;

  // Force application form if not completed
  if (!user.applicationCompleted && location.pathname !== "/application-form") {
    return <Navigate to="/application-form" replace />;
  }

  // role check
  if (allowedRole && user.role !== allowedRole)
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
