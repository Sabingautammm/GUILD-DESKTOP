import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes({ isAuthenticated = true }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
