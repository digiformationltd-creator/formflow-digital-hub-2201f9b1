/**
 * PROMOTIONS & SPECIAL OFFERS CONFIGURATION
 * Single source of truth for promotional campaigns across DigiFormation.
 */

export interface PromotionConfig {
  id: string;
  name: string;
  headline: string;
  badgeText: string;
  isActive: boolean;
  eligiblePackages: {
    ukLtd: string[];
    usaLlc: string[];
    banking: string[];
  };
  terms: {
    title: string;
    sections: { heading: string; details: string[] }[];
  };
}

export const FREE_WEBSITE_PROMO: PromotionConfig = {
  id: "free-website-2026",
  name: "Free Business Website Launch Offer",
  headline: "Register Your Business. Get Your Website FREE.",
  badgeText: "FREE BUSINESS WEBSITE (DOMAIN NOT INCLUDED)",
  isActive: true,
  eligiblePackages: {
    ukLtd: ["Silver", "Gold", "Platinum"],
    usaLlc: ["Silver", "Gold"],
    banking: [
      "stripe",
      "wise",
      "tide",
      "airwallex",
      "wirex",
      "photonpay",
      "payoneer",
      "worldfirst",
    ],
  },
  terms: {
    title: "Free Business Website & Software Promotion — Terms & Conditions",
    sections: [
      {
        heading: "1. Eligible Packages",
        details: [
          "UK Limited Company Formation: Silver (£160), Gold (£170), and Platinum (£190) packages include a complimentary 4-page business website (Domain Not Included) + 30-Day DigiBusiness Software Free Trial.",
          "USA LLC Formation: Silver ($299) and Gold ($499) packages include a complimentary 4-page business website (Domain Not Included) + 30-Day DigiBusiness Software Free Trial.",
          "Banking & Payment Solutions: Eligible business accounts and payment gateways (Stripe, Wise, Tide, Airwallex, Wirex, PhotonPay, Payoneer, WorldFirst) include a complimentary 4-page business website (Domain Not Included) + 30-Day DigiBusiness Software Free Trial.",
          "Universal Bonus: The 30-Day DigiBusiness Software Free Trial is complimentary across ALL company formation, banking, and business service packages on DigiFormation.",
        ],
      },
      {
        heading: "2. Included Website Specifications",
        details: [
          "A 4-page modern, responsive React website (Home, About Us, Services/Products, and Contact).",
          "Mobile-first, tablet, and desktop responsive layout.",
          "Interactive contact inquiry form with field validation.",
          "Direct WhatsApp click-to-chat integration and social media links.",
          "Foundational on-page SEO meta tags, title tags, and XML sitemap structure.",
          "Customization with your approved company name, logo, color palette, and business details.",
        ],
      },
      {
        heading: "3. Domain Registration & Renewal (Domain Not Included)",
        details: [
          "Domain names (.com, .co.uk, .org, etc.) are strictly NOT included in the free website offer.",
          "The domain name must be purchased directly by the client through their chosen registrar (e.g. Namecheap, Cloudflare, GoDaddy).",
          "DigiFormation provides complimentary DNS pointing, nameserver configuration, and SSL binding for your chosen domain.",
          "Annual domain renewal charges remain the sole responsibility of the domain owner.",
        ],
      },
      {
        heading: "4. Hosting & Deployment",
        details: [
          "Complimentary deployment and hosting setup on modern high-speed global CDN (Netlify / Vercel free tier supported).",
          "Automatic SSL certificate configuration (HTTPS encryption included).",
          "Dedicated cloud servers, AWS infrastructure, or custom VPS hosting require separate scoping and client billing.",
        ],
      },
      {
        heading: "5. Delivery Timeframe",
        details: [
          "Standard website delivery is 5–7 business days following receipt of complete company details, logo, and preferred page content from the client.",
          "Website development runs concurrently with government company incorporation filings.",
        ],
      },
      {
        heading: "6. Revisions & Approvals",
        details: [
          "Includes up to 2 comprehensive rounds of design and content revisions on the initial delivery draft.",
          "Additional redesigns, extra pages, or structural modifications beyond the agreed 4-page scope are quoted separately.",
        ],
      },
      {
        heading: "7. Ownership & Intellectual Property",
        details: [
          "100% full source code ownership and digital asset handover to the client upon completion.",
          "Zero recurring software licensing fees, zero proprietary vendor lock-in, and full freedom to migrate.",
        ],
      },
      {
        heading: "8. Maintenance & Optional Upgrades",
        details: [
          "Includes 14 days of post-launch technical support for minor adjustments.",
          "Advanced functionality such as multi-vendor e-commerce, payment gateways, custom databases, 3D WebGL scenes, and monthly maintenance retainers are available as optional upgrades.",
        ],
      },
      {
        heading: "9. Cancellation & Refund Implications",
        details: [
          "If the company formation or banking application is cancelled before official submission, standard DigiFormation service terms apply to the paid service.",
          "The complimentary website has a £0 / $0 commercial cash value and cannot be redeemed for cash, credit, or discounts on other services.",
          "Fraudulent payment disputes or chargebacks immediately revoke website hosting, intellectual property transfer, and company filings.",
        ],
      },
      {
        heading: "10. 30-Day DigiBusiness Software Complimentary Trial",
        details: [
          "Complimentary 30-day full desktop license key for DigiBusiness Software (Digi Biz OS Gen 2).",
          "Includes all 12 local AI engines, voice AI navigation, CRM, document vault, and automation tools.",
          "100% risk-free: no credit card required, zero automatic billing at the end of 30 days.",
          "Delivery via WhatsApp / email upon order verification.",
        ],
      },
    ],
  },
};

export const SOFTWARE_TRIAL_PROMO = {
  id: "digibiz-software-trial-30d",
  name: "30-Day DigiBusiness Software Free Trial",
  badgeText: "FREE: 30-DAY DIGIBUSINESS SOFTWARE TRIAL",
  description: "30-Day complimentary license key for DigiBusiness Software (Digi Biz OS Gen 2) with 12 AI engines included (£0.00).",
  days: 30,
  isUniversal: true,
} as const;

/**
 * Checks whether a package or banking service qualifies for the Free Website offer.
 */
export function isPackageEligible(
  category: "ukLtd" | "usaLlc" | "banking",
  packageNameOrSlug: string,
): boolean {
  if (!FREE_WEBSITE_PROMO.isActive) return false;
  const list = FREE_WEBSITE_PROMO.eligiblePackages[category] || [];
  return list.some(
    (item) => item.toLowerCase() === packageNameOrSlug.trim().toLowerCase(),
  );
}
