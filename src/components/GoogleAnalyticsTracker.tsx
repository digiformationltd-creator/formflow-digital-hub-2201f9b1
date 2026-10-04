import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Automatically captures client-side route transitions in React Router
 * and dispatches accurate page_view events to Google Analytics 4.
 */
const GoogleAnalyticsTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render if gtag config already fires initial page_view,
    // or trigger on subsequent SPA route navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const fullPath = location.pathname + location.search + location.hash;
      trackPageView(fullPath, document.title);
    }, 120);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default GoogleAnalyticsTracker;
