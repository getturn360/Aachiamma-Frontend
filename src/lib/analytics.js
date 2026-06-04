/** Google Analytics 4 measurement ID */
export const GA_MEASUREMENT_ID = "G-PGPR23961E";

/**
 * Send a page_view to GA4 (required for React Router SPAs).
 */
export function trackPageView(pathname, search = "", hash = "") {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const page_path = `${pathname || "/"}${search || ""}${hash || ""}`;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
