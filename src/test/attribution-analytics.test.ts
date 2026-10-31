import { beforeEach, describe, expect, it } from "vitest";
import { detectFromReferrer } from "@/lib/attribution";
import { trackPurchase } from "@/lib/analytics";

describe("attribution and purchase telemetry contracts", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.sessionStorage.clear();
    window.dataLayer = [];
    window.gtag = undefined;
    window.localStorage.setItem('df_analytics_consent_v1', 'granted');
  });

  it("classifies Bing search and country Google hosts as organic search", () => {
    expect(detectFromReferrer("https://www.bing.com/search?q=uk+company")).toEqual({ source: "bing", category: "search" });
    expect(detectFromReferrer("https://www.google.com.pk/search?q=uk+company")).toEqual({ source: "google", category: "search" });
  });

  it('recognizes AI referrals without matching lookalike domains', () => {
    expect(detectFromReferrer('https://chatgpt.com/share/example')).toEqual({ source: 'chatgpt', category: 'ai' });
    expect(detectFromReferrer('https://www.bing.com/chat')).toEqual({ source: 'copilot', category: 'ai' });
    expect(detectFromReferrer('https://evilbing.com/chat')).toEqual({ source: 'evilbing.com', category: 'referral' });
    expect(detectFromReferrer('')).toBeNull();
    expect(detectFromReferrer('not-a-url')).toBeNull();
  });

  it("emits one purchase event per order reference in a browser session", () => {
    expect(trackPurchase({ orderRef: "INV-TEST-1", invoiceNumber: 'INV-1', serviceTitle: "UK LTD", amount: 100, currency: "GBP", paymentConfirmed: true })).toBe(true);
    expect(trackPurchase({ orderRef: "INV-TEST-1", invoiceNumber: 'INV-1', serviceTitle: "UK LTD", amount: 100, currency: "GBP" })).toBe(false);
    expect(window.dataLayer?.filter((entry: unknown) => Array.isArray(entry) && entry[1] === "purchase")).toHaveLength(1);
  });

  it('rejects failed invoice responses without consuming the retry transaction ID', () => {
    const order = { orderRef: 'RETRY-1', serviceTitle: 'UK LTD', amount: 100, currency: 'GBP' };
    expect(trackPurchase(order)).toBe(false);
    expect(trackPurchase({ ...order, invoiceNumber: '' })).toBe(false);
    expect(window.dataLayer).toHaveLength(0);
    expect(trackPurchase({ ...order, invoiceNumber: 'INV-RETRY' })).toBe(false);
    expect(trackPurchase({ ...order, invoiceNumber: 'INV-RETRY', paymentConfirmed: true })).toBe(true);
    expect(trackPurchase({ ...order, invoiceNumber: 'INV-RETRY' })).toBe(false);
    expect(window.dataLayer).toHaveLength(1);
  });
});
