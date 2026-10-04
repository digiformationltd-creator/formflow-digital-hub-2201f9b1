import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-E063R532V0";

/**
 * Universal safe call for gtag that queues into dataLayer even if
 * Google Analytics script is still loading asynchronously.
 */
export const gtag = (...args: any[]) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
};

/**
 * Tracks SPA Page Views across React Router navigations.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === "undefined") return;
  gtag("event", "page_view", {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
};

/**
 * Generic custom event tracker for Google Analytics 4.
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === "undefined") return;
  gtag("event", eventName, {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  });
};

/**
 * Tracks WhatsApp click interactions both to Supabase analytics table and GA4.
 */
export const trackWhatsAppClick = async (source: string) => {
  // Fire Google Analytics event immediately
  trackEvent("contact_whatsapp", {
    method: "WhatsApp",
    source: source.slice(0, 100),
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });

  // Recommended standard GA4 contact / lead event
  trackEvent("generate_lead", {
    lead_type: "whatsapp_contact",
    source: source.slice(0, 100),
  });

  // Record to Supabase DB (best-effort, non-blocking)
  try {
    await supabase.from("whatsapp_clicks").insert({
      source: source.slice(0, 100),
      page_path: typeof window !== "undefined" ? window.location.pathname.slice(0, 500) : null,
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 1000) : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    // Silent fail — never block navigation
  }
};

/**
 * E-commerce: Begin Checkout event
 */
export const trackBeginCheckout = (params: {
  serviceTitle: string;
  packageName?: string;
  price?: number;
  currency?: string;
}) => {
  trackEvent("begin_checkout", {
    currency: params.currency || "GBP",
    value: params.price || 0,
    items: [
      {
        item_name: params.serviceTitle,
        item_category: params.packageName || "Service",
        price: params.price || 0,
        quantity: 1,
      },
    ],
  });
};

/**
 * E-commerce: Purchase / Order Completed event
 */
export const trackPurchase = (params: {
  orderRef: string;
  serviceTitle: string;
  packageName?: string;
  amount: number;
  currency: string;
}) => {
  trackEvent("purchase", {
    transaction_id: params.orderRef,
    value: params.amount,
    currency: params.currency || "GBP",
    items: [
      {
        item_id: params.orderRef,
        item_name: params.serviceTitle,
        item_category: params.packageName || "Formation",
        price: params.amount,
        quantity: 1,
      },
    ],
  });
};

/**
 * Lead generation (Contact form, Consultation request, etc.)
 */
export const trackLeadSubmission = (params: {
  leadType: string;
  service?: string;
  source?: string;
  country?: string;
}) => {
  trackEvent("generate_lead", {
    lead_type: params.leadType,
    service: params.service || "General Inquiry",
    source: params.source || "Website Form",
    country: params.country || "Unknown",
  });
};

/**
 * Service card selection / CTA exploration
 */
export const trackServiceSelect = (serviceTitle: string, href?: string) => {
  trackEvent("select_content", {
    content_type: "service",
    item_id: serviceTitle,
    destination: href || "",
  });
};
