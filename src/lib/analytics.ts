import { supabase } from "@/integrations/supabase/client";
import { analyticsAllowed, GA_ID, safeAnalyticsPath } from './analytics-consent';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = GA_ID;
let lastPagePath: string | undefined;
const emittedTransactions = new Set<string>();

/**
 * Universal safe call for gtag that queues into dataLayer even if
 * Google Analytics script is still loading asynchronously.
 */
export const gtag = (...args: unknown[]) => {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
  }
};

/**
 * Tracks SPA Page Views across React Router navigations.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  const pathname = safeAnalyticsPath(url);
  if (pathname === '/private' || pathname === lastPagePath) return;
  lastPagePath = pathname;
  gtag("event", "page_view", {
    page_path: pathname,
    page_title: title || document.title,
    page_location: window.location.origin + pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : '',
    send_to: GA_MEASUREMENT_ID,
  });
};

/**
 * Generic custom event tracker for Google Analytics 4.
 */
export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined" || !analyticsAllowed() || safeAnalyticsPath(window.location.href) === '/private') return false;
  // No free-text, identity fields, arbitrary URLs or form payloads in analytics.
  const allowed = new Set(['method','source','page_path','currency','value','items','transaction_id','lead_type','content_type','item_id','destination','country','jurisdiction','message_length']);
  const safe = Object.fromEntries(Object.entries(params).filter(([key]) => allowed.has(key)).map(([key,value]) => [key, key === 'destination' || key === 'page_path' ? safeAnalyticsPath(String(value)) : value]));
  gtag("event", eventName, {
    ...safe,
    send_to: GA_MEASUREMENT_ID,
  });
  return true;
};

/**
 * Tracks WhatsApp click interactions both to Supabase analytics table and GA4.
 */
export const trackWhatsAppClick = async (source: string) => {
  if (!analyticsAllowed()) return;
  // Fire Google Analytics event immediately
  trackEvent("contact_whatsapp", {
    method: "WhatsApp",
    source: source.slice(0, 100),
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });

  // Record to Supabase DB (best-effort, non-blocking)
  try {
    await supabase.from("whatsapp_clicks").insert({
      source: source.slice(0, 100),
      page_path: typeof window !== "undefined" ? window.location.pathname.slice(0, 500) : null,
      referrer: typeof document !== "undefined" && document.referrer ? new URL(document.referrer).origin : null,
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
  invoiceNumber?: string | null;
  serviceTitle: string;
  packageName?: string;
  amount: number;
  currency: string;
  paymentConfirmed?: boolean;
}) => {
  // Never call this from invoice creation. Only a trusted payment-confirmation
  // integration may supply this signal; no such integration is enabled here.
  if (!analyticsAllowed() || params.paymentConfirmed !== true || !params.invoiceNumber?.trim() || !params.orderRef.trim() || !Number.isFinite(params.amount) || params.amount < 0) return false;
  if (emittedTransactions.has(params.orderRef)) return false;
  // A successful invoice/order may be returned again after a refresh or retry.
  // Keep GA4 transaction IDs idempotent per browser session.
  if (typeof window !== "undefined") {
    const key = `df_purchase_tracked:${params.orderRef}`;
    try {
      if (window.sessionStorage.getItem(key)) return false;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage restrictions must never block the conversion event.
    }
  }
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
  emittedTransactions.add(params.orderRef);
  return true;
};

/**
 * Lead generation (Contact form, Consultation request, etc.)
 */
export const trackLeadSubmission = (params: {
  leadType: string;
  service?: string;
  source?: string;
  country?: string;
  confirmedId?: string;
}) => {
  if (!params.confirmedId) return;
  trackEvent("generate_lead", {
    lead_type: params.leadType,
  });
};

export const trackOrderSubmitted = (orderRef: string) => {
  if (!orderRef || !analyticsAllowed()) return;
  const key = `order:${orderRef}`;
  if (emittedTransactions.has(key)) return;
  emittedTransactions.add(key);
  trackEvent('order_submitted', { content_type: 'invoice_request' });
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
