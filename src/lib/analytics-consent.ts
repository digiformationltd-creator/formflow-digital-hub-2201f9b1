export type AnalyticsConsent = 'granted' | 'denied' | 'unknown';
export const CONSENT_KEY = 'df_analytics_consent_v1';
export const CONSENT_EVENT = 'df:analytics-consent';
export const GA_ID = 'G-E063R532V0';
declare global { interface Window { [key: `ga-disable-${string}`]: boolean | undefined; } }
let volatileChoice: AnalyticsConsent = 'unknown';

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : volatileChoice;
  } catch { return volatileChoice; }
}
export const analyticsAllowed = () => getAnalyticsConsent() === 'granted';

export function initializeAnalytics() {
  if (!analyticsAllowed() || typeof window === 'undefined') return;
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => { window.dataLayer?.push(args); };
  if (!document.getElementById('df-consented-ga')) {
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.id = 'df-consented-ga'; script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }
  window[`ga-disable-${GA_ID}`] = false;
  window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
}

export function setAnalyticsConsent(choice: 'granted' | 'denied') {
  volatileChoice = choice;
  try { window.localStorage.setItem(CONSENT_KEY, choice); } catch { /* In-memory choice still applies. */ }
  if (choice === 'granted') initializeAnalytics();
  else {
    window[`ga-disable-${GA_ID}`] = true;
    window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    // Delete only this application's optional attribution and GA cookies.
    for (const key of ['df_visitor_id', 'df_attribution_first', 'df_attribution_last']) {
      try { window.localStorage.removeItem(key); } catch { /* Storage may be restricted. */ }
    }
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name !== 'df_visitor_id' && !/^_ga(?:_|$)/.test(name)) continue;
      const host = window.location.hostname;
      for (const domain of ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
      }
    }
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function safeAnalyticsPath(value: string) {
  try {
    const pathname = new URL(value, window.location.origin).pathname;
    return /^\/(?:auth|reset-password|dashboard|admin|client-area|unsubscribe)(?:\/|$)/.test(pathname) ? '/private' : pathname;
  } catch { return '/'; }
}
