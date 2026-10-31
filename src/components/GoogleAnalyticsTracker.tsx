import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { CONSENT_EVENT, initializeAnalytics } from '@/lib/analytics-consent';

/**
 * Automatically captures client-side route transitions in React Router
 * and dispatches accurate page_view events to Google Analytics 4.
 */
const GoogleAnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const send = () => { initializeAnalytics(); trackPageView(location.pathname); };
    const timer = setTimeout(send, 120);
    window.addEventListener(CONSENT_EVENT, send);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, send); };
  }, [location.pathname, location.key]);

  return null;
};

export default GoogleAnalyticsTracker;
