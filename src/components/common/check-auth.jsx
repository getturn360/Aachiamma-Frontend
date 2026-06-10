import { Navigate, useLocation } from "react-router-dom";
import { ROUTES, isAdminUser } from "@/config/routes";

function CheckAuth({ isAuthenticated, user, children, loading = false }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Logged-in admins visiting the storefront home go to the admin dashboard
  if (pathname === "/" && isAuthenticated && user && isAdminUser(user) && !loading) {
    return <Navigate to={ROUTES.adminDashboard} replace />;
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      if (loading) {
        return <>{children}</>;
      }
      return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
    }

    if (isAuthenticated && !user) {
      return <>{children}</>;
    }

    if (user && !isAdminUser(user)) {
      return <Navigate to={ROUTES.unauth} replace />;
    }
  }

  if (
    isAuthenticated &&
    (pathname.includes("/login") || pathname.includes("/register")) &&
    !loading
  ) {
    if (isAdminUser(user)) {
      return <Navigate to={ROUTES.adminDashboard} replace />;
    }
    return <Navigate to={ROUTES.home} replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
