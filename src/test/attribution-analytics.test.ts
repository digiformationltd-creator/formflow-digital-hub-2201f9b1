import { beforeEach, describe, expect, it } from "vitest";
import { detectFromReferrer } from "@/lib/attribution";
import { trackPurchase } from "@/lib/analytics";

describe("attribution and purchase telemetry contracts", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.sessionStorage.clear();
    window.dataLayer = [];
    window.gtag = undefined;
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
    expect(trackPurchase({ orderRef: "INV-TEST-1", serviceTitle: "UK LTD", amount: 100, currency: "GBP" })).toBe(true);
    expect(trackPurchase({ orderRef: "INV-TEST-1", serviceTitle: "UK LTD", amount: 100, currency: "GBP" })).toBe(false);
    expect(window.dataLayer?.filter((entry: unknown) => Array.isArray(entry) && entry[1] === "purchase")).toHaveLength(1);
  });
});
