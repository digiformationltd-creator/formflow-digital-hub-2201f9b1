import { useEffect } from "react";
import { trackPageView } from "@/lib/attribution";
import { CONSENT_EVENT } from '@/lib/analytics-consent';

const AttributionTracker = () => {
  useEffect(() => {
    const send = () => { void trackPageView(); };
    send(); window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, []);
  return null;
};

export default AttributionTracker;
