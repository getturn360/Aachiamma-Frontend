export const ROUTES = {
  home: "/",
  listing: "/listing",
  special: (type) => `/special/${type}`,
  product: (id) => `/product/${id}`,
  checkout: "/checkout",
  account: "/account",
  paymentSuccess: "/payment-success",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  refunds: "/refunds",
  shipping: "/shipping",
  login: "/auth/login",
  register: "/auth/register",
  adminDashboard: "/admin/dashboard",
  unauth: "/unauth-page",
};

export function isSuperAdminUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "superadmin" || role === "super-admin" || role === "super_admin";
}

export function isAdminUser(user) {
  return user?.role === "admin" || isSuperAdminUser(user);
}

/** Where to send the user right after a successful login. */
export function getPostLoginPath(user, from = "/") {
  if (isAdminUser(user)) {
    return ROUTES.adminDashboard;
  }
  if (from && from !== ROUTES.home && !from.startsWith("/auth")) {
    return from;
  }
  return ROUTES.home;
}
