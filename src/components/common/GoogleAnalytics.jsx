import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Tracks virtual page views on React Router navigation.
 * Initial HTML gtag config only fires once; SPAs need this for route changes.
 */
export default function GoogleAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    const pathKey = `${location.pathname}${location.search}${location.hash}`;
    if (lastPathRef.current === pathKey) return;
    lastPathRef.current = pathKey;

    trackPageView(location.pathname, location.search, location.hash);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
