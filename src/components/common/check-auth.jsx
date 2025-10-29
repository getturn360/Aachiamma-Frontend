// client/src/components/common/check-auth.jsx
import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children, loading = false }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Debug help: uncomment to see runtime values in browser console
  // console.log("CheckAuth:", { pathname, isAuthenticated, user, loading });

  // If user visits the root, send them to shop home (not to login)
  if (pathname === "/") {
    if (!isAuthenticated) {
      // If auth check is still running, don't redirect yet (prevents flash/redirect on refresh)
      if (loading) {
        return null;
      }
      return <Navigate to="/shop/home" />;
    } else {
      // allow both admin and superadmin to go to admin dashboard
      if (user?.role === "admin" || user?.role === "superadmin") {
        return <Navigate to="/admin/dashboard" />;
      } else {
        return <Navigate to="/shop/home" />;
      }
    }
  }

  // Only protect admin routes — shop/public/auth pages are open
  if (pathname.startsWith("/admin")) {
    // If not authenticated at all
    if (!isAuthenticated) {
      // If auth check is still running, allow render (prevents redirect on refresh)
      if (loading) {
        return <>{children}</>;
      }
      return <Navigate to="/auth/login" />;
    }

    // If auth flag true but user object not yet loaded (common on refresh/persist),
    // don't decide role-based redirect yet — allow the admin UI to mount until user arrives.
    if (isAuthenticated && !user) {
      return <>{children}</>;
    }

    // If user exists, only then enforce role checks
    if (user) {
      if (!(user.role === "admin" || user.role === "superadmin")) {
        return <Navigate to="/unauth-page" />;
      }
    }
  }

  // If already authenticated and trying to access auth pages, redirect to appropriate home
  // only do this redirect once loading is finished to avoid premature navigation.
  if (
    isAuthenticated &&
    (pathname.includes("/login") || pathname.includes("/register")) &&
    !loading
  ) {
    if (user?.role === "admin" || user?.role === "superadmin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  // Default: allow access
  return <>{children}</>;
}

export default CheckAuth;
