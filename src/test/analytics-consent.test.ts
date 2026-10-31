import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ insert: mocks.insert }), rpc: mocks.rpc } }));

beforeEach(() => {
  vi.resetModules(); window.localStorage.clear(); window.sessionStorage.clear();
  window.dataLayer = []; window.gtag = undefined;
  document.getElementById('df-consented-ga')?.remove();
  window.history.replaceState({}, '', '/contact');
  vi.clearAllMocks(); mocks.insert.mockResolvedValue({ error: null });
});

describe('optional analytics and trustworthy outcomes', () => {
  it('does not load GA, queue events, create visitor IDs or write attribution before consent', async () => {
    const analytics = await import('@/lib/analytics');
    const attribution = await import('@/lib/attribution');
    analytics.trackPageView('/contact?email=secret@example.test');
    await analytics.trackWhatsAppClick('footer'); await attribution.trackPageView();
    expect(window.dataLayer).toEqual([]); expect(mocks.insert).not.toHaveBeenCalled();
    expect(attribution.getVisitorId()).toBe(''); expect(document.getElementById('df-consented-ga')).toBeNull();
  });
  it('loads one tag only after grant, strips query/hash and deduplicates the current page', async () => {
    const consent = await import('@/lib/analytics-consent'); const a = await import('@/lib/analytics');
    consent.setAnalyticsConsent('granted'); consent.initializeAnalytics();
    a.trackPageView('/contact?email=secret@example.test#token'); a.trackPageView('/contact');
    expect(document.querySelectorAll('#df-consented-ga')).toHaveLength(1);
    const pages = window.dataLayer?.filter(e => e[1] === 'page_view') || [];
    expect(pages).toHaveLength(1); expect(JSON.stringify(pages)).not.toContain('secret');
    a.trackPageView('/about'); a.trackPageView('/contact');
    expect(window.dataLayer?.filter(e => e[1] === 'page_view')).toHaveLength(3);
  });
  it('withdraws consent, clears app attribution and blocks later events', async () => {
    const c = await import('@/lib/analytics-consent'); const a = await import('@/lib/analytics');
    c.setAnalyticsConsent('granted'); localStorage.setItem('df_attribution_first', 'old');
    c.setAnalyticsConsent('denied'); const count = window.dataLayer?.length;
    a.trackEvent('cta_click'); expect(window.dataLayer).toHaveLength(count!);
    expect(localStorage.getItem('df_attribution_first')).toBeNull();
    expect(window[`ga-disable-${c.GA_ID}`]).toBe(true);
  });
  it('does not turn WhatsApp clicks, failed leads or invoices into confirmed outcomes', async () => {
    const c = await import('@/lib/analytics-consent'); const a = await import('@/lib/analytics');
    c.setAnalyticsConsent('granted'); await a.trackWhatsAppClick('footer');
    a.trackLeadSubmission({leadType:'contact_form'});
    expect(a.trackPurchase({orderRef:'test',invoiceNumber:'invoice',serviceTitle:'test',amount:1,currency:'GBP'})).toBe(false);
    a.trackOrderSubmitted('order'); a.trackOrderSubmitted('order');
    expect(window.dataLayer?.filter(e => e[1] === 'generate_lead' || e[1] === 'purchase')).toHaveLength(0);
    expect(window.dataLayer?.filter(e => e[1] === 'order_submitted')).toHaveLength(1);
    a.trackLeadSubmission({leadType:'contact_form',confirmedId:'saved-inquiry'});
    expect(window.dataLayer?.filter(e => e[1] === 'generate_lead')).toHaveLength(1);
  });
});
