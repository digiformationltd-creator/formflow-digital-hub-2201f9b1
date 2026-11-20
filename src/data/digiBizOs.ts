// Advertised prices for Digi Biz OS on digiformation.co.uk and digibizos.co.uk.
// Keep this source of truth isolated from company formation and banking pricing.
export const DIGI_BIZ_OS_URL = "https://www.digibizos.co.uk/";
export const DIGI_BIZ_OS_PRICING_URL = "https://www.digibizos.co.uk/pricing";

export const DIGI_BIZ_OS_PRICING = {
  freeTrial: "Free",
  freeTrialPeriod: "30 Days",
  lifetime: "£19.99",
  lifetimeOriginal: "£49",
  lifetimeDiscount: "Save 59%",
  sourceCode: "£100",
  sourceCodeOriginal: "£279",
  sourceCodeDiscount: "Save 64%",
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
    name: "30-Day Free Trial",
    badge: "Risk Free",
    price: "Free",
    period: "/ 30 Days",
    description: "Full desktop access to test-drive all 12 local engines, voice AI assistant, and business automation workflows risk-free on your PC for 30 full days.",
    features: [
      "30 Days full desktop software access",
      "All 12 local AI engines included",
      "Voice AI & JARVIS navigation active",
      "Direct WhatsApp trial key delivery",
      "Windows 10 & 11 native deployment",
      "Zero monthly bills · No card required",
    ],
    ctaText: "Get 30-Day Free Trial",
    ctaUrl: "https://wa.me/923164467464?text=Hello%20DigiFormation%2C%20I%20would%20like%20to%20get%20my%2030-Day%20Free%20Trial%20key%20for%20Digi%20Biz%20OS.",
  },
  {
    name: "Lifetime Access",
    badge: "Most Popular",
    price: "£19.99",
    period: "one-time",
    originalPrice: "£49",
    discount: "Save 59%",
    description: "Pay once. Own DIGI BIZ OS for life. 100% offline sovereignty with zero monthly fees or recurring bills.",
    features: [
      "One-time £19.99 payment — zero recurring bills",
      "Lifetime access to DIGI BIZ OS Gen 2",
      "Single-PC licence — activates on 1 PC",
      "Connect your own AI API keys (OpenAI, Groq, DeepSeek, Claude)",
      "90%+ modules with integrated AI brain & voice assistant",
      "Windows 10 & 11 native desktop app",
    ],
    ctaText: "Get Lifetime Access (£19.99)",
    ctaUrl: "https://wa.me/923164467464?text=Hello%20DigiFormation%2C%20I%20would%20like%20to%20purchase%20Lifetime%20Access%20to%20Digi%20Biz%20OS%20for%20%C2%A319.99.",
  },
  {
    name: "Source Code Licence",
    badge: "Full Ownership",
    price: "£100",
    period: "one-time",
    originalPrice: "£279",
    discount: "Save 64%",
    description: "Buy the complete source code and rebuild DIGI BIZ OS around your business with full commercial and resale rights.",
    features: [
      "Everything in Lifetime Access",
      "Complete source code (desktop app + agent engine)",
      "Private developer access & repository handover",
      "Build, sign, and distribute your own installers",
      "Full commercial / resale rights",
      "12 months of update pulls & developer walkthrough",
    ],
    ctaText: "Buy Source Code (£100)",
    ctaUrl: "https://wa.me/923164467464?text=Hello%20DigiFormation%2C%20I%20would%20like%20to%20purchase%20the%20Digi%20Biz%20OS%20Source%20Code%20Licence%20for%20%C2%A3100.",
  },
];
