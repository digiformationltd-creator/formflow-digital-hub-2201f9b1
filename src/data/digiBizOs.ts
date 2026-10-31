// Advertised prices rechecked at https://www.digibizos.co.uk/pricing on 2026-10-31.
// This verifies published tiers, not payment, fulfilment or software capabilities.
// Keep this source of truth isolated from company formation and banking pricing.
export const DIGI_BIZ_OS_URL = "https://www.digibizos.co.uk/";
export const DIGI_BIZ_OS_PRICING_URL = "https://www.digibizos.co.uk/pricing";

export const DIGI_BIZ_OS_PRICING = {
  freeTrial: "Free",
  freeTrialPeriod: "3 Days",
  lifetime: "£29",
  lifetimeOriginal: "£49",
  lifetimeDiscount: "Save 41%",
  setup: "£129",
  setupOriginal: "£179",
  setupDiscount: "Save 28%",
  sourceCode: "£199",
  sourceCodeOriginal: "£279",
  sourceCodeDiscount: "Save 29%",
} as const;

export interface DigiBizOsPackage {
  name: string;
  badge?: string;
  price: string;
  period: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
}

export const DIGI_BIZ_OS_PACKAGES: DigiBizOsPackage[] = [
  {
    name: "3-Day Free Trial",
    badge: "Risk Free",
    price: "Free",
    period: "/ 3 Days",
    description: "Full desktop access to test-drive all 12 local engines, voice AI assistant, and business automation workflows risk-free on your PC.",
    features: [
      "3 Days (72 Hours) full desktop software access",
      "All 12 local AI engines included",
      "Voice AI & JARVIS navigation active",
      "Direct WhatsApp verification key",
      "Windows 10 & 11 native deployment",
      "No credit card or payment required",
    ],
    ctaText: "Get Free Trial",
    ctaUrl: "https://www.digibizos.co.uk/pricing",
  },
  {
    name: "Lifetime Access",
    badge: "Most Popular",
    price: "£29",
    period: "one-time",
    originalPrice: "£49",
    discount: "Save 41%",
    description: "Pay once. Own DIGI BIZ OS for life. 100% offline sovereignty with zero monthly fees.",
    features: [
      "One-time payment — no monthly software lock-in",
      "Lifetime access to DIGI BIZ OS Gen 2",
      "Single-PC licence — activates on 1 PC",
      "Connect your own AI API keys (OpenAI, Groq, DeepSeek, Claude)",
      "90%+ modules with integrated AI brain & voice assistant",
      "Windows 10 & 11 native desktop app",
    ],
    ctaText: "Get Lifetime Access",
    ctaUrl: "https://www.digibizos.co.uk/pricing",
  },
  {
    name: "Software Setup & Customization",
    badge: "Done-For-You",
    price: "£129",
    period: "one-time",
    originalPrice: "£179",
    discount: "Save 28%",
    description: "Done-for-you software installation, API configuration, WhatsApp AI sales agent, and 5 custom automated business workflows.",
    features: [
      "Everything in Lifetime Access",
      "Full software installation & desktop environment setup on your PC",
      "5 custom business workflows custom-built specifically for your operations",
      "Complete AI API keys configuration & live connection testing",
      "WhatsApp AI Sales Agent setup & business prompt tuning",
      "1-on-1 walkthrough & handover session with our team",
    ],
    ctaText: "Order Software Setup",
    ctaUrl: "https://www.digibizos.co.uk/pricing",
  },
  {
    name: "Source Code Licence",
    badge: "Full Ownership",
    price: "£199",
    period: "one-time",
    originalPrice: "£279",
    discount: "Save 29%",
    description: "Buy the complete source code and rebuild DIGI BIZ OS around your business with full commercial and resale rights.",
    features: [
      "Everything in Lifetime Access",
      "Complete source code (desktop app + agent engine)",
      "Private developer access & repository handover",
      "Build, sign, and distribute your own installers",
      "Full commercial / resale rights",
      "12 months of update pulls & developer walkthrough",
    ],
    ctaText: "Buy Source Code",
    ctaUrl: "https://www.digibizos.co.uk/pricing",
  },
];
