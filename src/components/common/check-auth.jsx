import { Navigate, useLocation } from "react-router-dom";
import { ROUTES, isAdminUser } from "@/config/routes";
import { PremiumLoader } from "@/components/common/Loader";

function CheckAuth({ isAuthenticated, user, children, loading = false }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Logged-in admins visiting the storefront home go to the admin dashboard
  if (pathname === "/" && isAuthenticated && user && isAdminUser(user) && !loading) {
    return <Navigate to={ROUTES.adminDashboard} replace />;
  }

  if (pathname.startsWith("/admin")) {
    if (loading) {
      return <PremiumLoader message="Verifying access..." />;
    }

    if (!isAuthenticated) {
      return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
    }

    if (!user) {
      return <PremiumLoader message="Verifying access..." />;
    }

    if (!isAdminUser(user)) {
      return <Navigate to={ROUTES.unauth} replace />;
    }
  }

  if (
    isAuthenticated &&
    user &&
    (pathname.includes("/login") || pathname.includes("/register")) &&
    !loading
  ) {
    // Login/register pages handle navigation after pending-cart merge.
    // Redirect only when the user navigates here while already signed in.
    return <>{children}</>;
  }

  return <>{children}</>;
}

export default CheckAuth;
