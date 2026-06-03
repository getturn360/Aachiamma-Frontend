import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children, loading = false }) {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/") {
    if (!isAuthenticated) {
      if (loading) {
        return <Navigate to="/shop/home" replace />;
      }
      return <Navigate to="/shop/home" replace />;
    } else {

      if (user?.role === "admin" || user?.role === "superadmin") {
        return <Navigate to="/admin/dashboard" />;
      } else {
        return <Navigate to="/shop/home" />;
      }
    }
  }


  if (pathname.startsWith("/admin")) {

    if (!isAuthenticated) {

      if (loading) {
        return <>{children}</>;
      }
      return <Navigate to="/auth/login" />;
    }


    if (isAuthenticated && !user) {
      return <>{children}</>;
    }


    if (user) {
      if (!(user.role === "admin" || user.role === "superadmin")) {
        return <Navigate to="/unauth-page" />;
      }
    }
  }

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

  return <>{children}</>;
}

export default CheckAuth;
