// Lead attribution tracker — first-touch & last-touch capture, AI/search/social
// source detection, UTM persistence. All writes are best-effort, never block UI.

import { supabase } from "@/integrations/supabase/client";
import { analyticsAllowed, safeAnalyticsPath } from './analytics-consent';

const COOKIE_NAME = "df_visitor_id";
const LS_FIRST = "df_attribution_first";
const LS_LAST = "df_attribution_last";
const COOKIE_DAYS = 180;

export type SourceCategory = "ai" | "search" | "social" | "direct" | "referral";
type StoredTouch = { source?: string; category?: SourceCategory; campaign?: string; referrer?: string; landing?: string; at?: string };
const readStoredTouch = (key: string): StoredTouch | null => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (typeof record.source !== 'string') return null;
    const stringValue = (name: string) => typeof record[name] === 'string' ? record[name] as string : undefined;
    return {
      source: record.source,
      category: ['ai','search','social','direct','referral'].includes(String(record.category)) ? record.category as SourceCategory : undefined,
      campaign: stringValue('campaign'), referrer: stringValue('referrer'), landing: stringValue('landing'), at: stringValue('at'),
    };
  } catch { return null; }
};

export type AttributionSnapshot = {
  visitor_id: string;
  first_source?: string;
  first_category?: SourceCategory;
  first_campaign?: string;
  first_referrer?: string;
  first_landing_page?: string;
  last_source?: string;
  last_category?: SourceCategory;
  last_campaign?: string;
  last_referrer?: string;
  last_landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type?: string;
  browser?: string;
  country?: string;
};

// ---------- cookie helpers ----------
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const d = new Date(); d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
};
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
};
const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ---------- source detection ----------
const AI_HOSTS: Record<string, string> = {
  "chat.openai.com": "chatgpt",
  "chatgpt.com": "chatgpt",
  "gemini.google.com": "gemini",
  "bard.google.com": "gemini",
  "claude.ai": "claude",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "grok.com": "grok",
  "x.ai": "grok",
  "deepseek.com": "deepseek",
  "chat.deepseek.com": "deepseek",
  "copilot.microsoft.com": "copilot",
};
const SEARCH_HOSTS: Record<string, string> = {
  "www.google.com": "google",
  "google.com": "google",
  "www.bing.com": "bing",
  "bing.com": "bing",
  "duckduckgo.com": "duckduckgo",
  "search.yahoo.com": "yahoo",
  "yahoo.com": "yahoo",
};
const SOCIAL_HOSTS: Record<string, string> = {
  "facebook.com": "facebook",
  "www.facebook.com": "facebook",
  "m.facebook.com": "facebook",
  "l.facebook.com": "facebook",
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "m.youtube.com": "youtube",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
};

export const detectFromReferrer = (referrer: string): { source: string; category: SourceCategory } | null => {
  if (!referrer) return null;
  let host = "";
  try { host = new URL(referrer).hostname.toLowerCase(); } catch { return null; }
  const ownHost = window.location.hostname.toLowerCase();
  if (host === ownHost || host.endsWith(`.${ownHost}`)) return null; // internal
  // bing /chat path → copilot
  if ((host === 'bing.com' || host.endsWith('.bing.com')) && new URL(referrer).pathname.startsWith('/chat')) return { source: "copilot", category: "ai" };
  if (AI_HOSTS[host]) return { source: AI_HOSTS[host], category: "ai" };
  if (SEARCH_HOSTS[host] || /^(?:www\.)?google\.[a-z.]+$/.test(host)) {
    return { source: SEARCH_HOSTS[host] ?? "google", category: "search" };
  }
  if (SOCIAL_HOSTS[host]) return { source: SOCIAL_HOSTS[host], category: "social" };
  return { source: host.replace(/^www\./, ""), category: "referral" };
};

const detectDevice = (): string => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
};
const detectBrowser = (): string => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
};

// ---------- visitor id ----------
export const getVisitorId = (): string => {
  if (!analyticsAllowed()) return '';
  let id = getCookie(COOKIE_NAME);
  if (!id) {
    id = uuid();
    setCookie(COOKIE_NAME, id, COOKIE_DAYS);
    try { localStorage.setItem(COOKIE_NAME, id); } catch { /* Browser storage may be unavailable; preserve the in-memory UI state. */ }
  }
  return id;
};

// ---------- main tracker (runs once per page) ----------
let trackedThisLoad = false;

export const trackPageView = async () => {
  if (typeof window === "undefined" || !analyticsAllowed() || trackedThisLoad || safeAnalyticsPath(window.location.href) === '/private') return;
  trackedThisLoad = true;

  try {
    const visitor_id = getVisitorId();
    const url = new URL(window.location.href);
    const utm = {
      utm_source: url.searchParams.get("utm_source") || undefined,
      utm_medium: url.searchParams.get("utm_medium") || undefined,
      utm_campaign: url.searchParams.get("utm_campaign") || undefined,
      utm_content: url.searchParams.get("utm_content") || undefined,
      utm_term: url.searchParams.get("utm_term") || undefined,
    };
    const detected = detectFromReferrer(document.referrer || '');
    const referrer = document.referrer ? new URL(document.referrer).origin : '';

    // UTM beats referrer for source attribution
    let source: string | undefined;
    let category: SourceCategory | undefined;
    if (utm.utm_source) {
      source = utm.utm_source.toLowerCase();
      const cat = (utm.utm_medium || "").toLowerCase();
      category = cat.includes("social") ? "social"
        : cat.includes("cpc") || cat.includes("ppc") || cat.includes("paid") ? "search"
        : /^(?:ai(?:[_ -]|$)|llm$)/.test(cat) ? "ai"
        : cat.includes("referral") ? "referral"
        : /^(?:www\.)?google\.[a-z.]+$/.test(source) || source === "google" || source === "bing" ? "search"
        : "referral";
    } else if (detected) {
      source = detected.source;
      category = detected.category;
    } else {
      source = "direct";
      category = "direct";
    }

    const device = detectDevice();
    const browser = detectBrowser();
    const landing = safeAnalyticsPath(window.location.href);

    const visit = {
      source, category, campaign: utm.utm_campaign,
      referrer, landing,
    };

    // First touch → store permanently if absent
    let first = readStoredTouch(LS_FIRST);
    if (!first) {
      first = { ...visit, at: new Date().toISOString() };
      try { localStorage.setItem(LS_FIRST, JSON.stringify(first)); } catch { /* Browser storage may be unavailable; preserve the in-memory UI state. */ }
    }
    // Last touch
    try { localStorage.setItem(LS_LAST, JSON.stringify({ ...visit, at: new Date().toISOString() })); } catch { /* Browser storage may be unavailable; preserve the in-memory UI state. */ }

    // Dispatch DB writes without blocking UI, while assimilating Supabase's
    // thenable so the request actually starts and failures remain observable.
    void Promise.resolve(supabase.from("visitor_sessions").insert({
      visitor_id,
      landing_page: landing,
      referrer: referrer || null,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
      utm_term: utm.utm_term ?? null,
      detected_source: source,
      detected_category: category,
      device_type: device,
      browser,
    })).then(({ error }) => {
      if (error) console.warn("[attribution] visitor session write failed", error);
    }).catch((error) => console.warn("[attribution] visitor session dispatch failed", error));

    void Promise.resolve(supabase.rpc("upsert_visitor_attribution", {
      payload: {
        visitor_id,
        first_source: first.source,
        first_category: first.category,
        first_campaign: first.campaign ?? null,
        first_referrer: first.referrer ?? null,
        first_landing_page: first.landing ?? null,
        first_visit_at: first.at,
        last_source: visit.source,
        last_category: visit.category,
        last_campaign: visit.campaign ?? null,
        last_referrer: visit.referrer ?? null,
        last_landing_page: visit.landing ?? null,
        last_visit_at: new Date().toISOString(),
        device_type: device,
      },
    })).then(({ error }) => {
      if (error) console.warn("[attribution] attribution upsert failed", error);
    }).catch((error) => console.warn("[attribution] attribution dispatch failed", error));
  } catch (err) {
    // Silent fail — attribution must never break the app
    console.warn("[attribution] tracker failed", err);
  }
};

// ---------- snapshot for form submission ----------
export const getAttributionSnapshot = (): AttributionSnapshot => {
  if (!analyticsAllowed()) return { visitor_id: '' };
  const visitor_id = getVisitorId();
  const first = readStoredTouch(LS_FIRST) ?? {};
  const last = readStoredTouch(LS_LAST) ?? {};
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  return {
    visitor_id,
    first_source: first.source,
    first_category: first.category,
    first_campaign: first.campaign,
    first_referrer: first.referrer,
    first_landing_page: first.landing,
    last_source: last.source,
    last_category: last.category,
    last_campaign: last.campaign,
    last_referrer: last.referrer,
    last_landing_page: last.landing,
    utm_source: url?.searchParams.get("utm_source") || undefined,
    utm_medium: url?.searchParams.get("utm_medium") || undefined,
    utm_campaign: url?.searchParams.get("utm_campaign") || undefined,
    utm_content: url?.searchParams.get("utm_content") || undefined,
    utm_term: url?.searchParams.get("utm_term") || undefined,
    device_type: detectDevice(),
    browser: detectBrowser(),
  };
};

export type DeclaredSource = { id: string; label: string; category: SourceCategory };

export const recordLeadAttribution = async (params: {
  entityType: "order" | "inquiry" | "lead" | "ticket" | "whatsapp_contact";
  entityId: string;
  userId?: string | null;
  declared?: DeclaredSource | null;
}) => {
  if (!analyticsAllowed()) return null;
  try {
    const snap = getAttributionSnapshot();
    const payload = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      user_id: params.userId ?? null,
      visitor_id: snap.visitor_id,
      declared_source: params.declared?.id ?? null,
      declared_source_label: params.declared?.label ?? null,
      declared_category: params.declared?.category ?? null,
      first_source: snap.first_source ?? null,
      first_category: snap.first_category ?? null,
      first_campaign: snap.first_campaign ?? null,
      first_referrer: snap.first_referrer ?? null,
      first_landing_page: snap.first_landing_page ?? null,
      last_source: snap.last_source ?? null,
      last_category: snap.last_category ?? null,
      last_campaign: snap.last_campaign ?? null,
      last_referrer: snap.last_referrer ?? null,
      last_landing_page: snap.last_landing_page ?? null,
      utm_source: snap.utm_source ?? null,
      utm_medium: snap.utm_medium ?? null,
      utm_campaign: snap.utm_campaign ?? null,
      utm_content: snap.utm_content ?? null,
      utm_term: snap.utm_term ?? null,
      device_type: snap.device_type ?? null,
      browser: snap.browser ?? null,
    };
    const { data, error } = await supabase.rpc("record_lead_attribution", { payload });
    if (error) { console.warn("[attribution] record failed", error); return null; }
    return data as string;
  } catch (err) {
    console.warn("[attribution] record exception", err);
    return null;
  }
};
