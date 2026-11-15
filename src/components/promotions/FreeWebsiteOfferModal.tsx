import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Sparkles, ArrowRight, ShieldCheck, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_WEBSITE_PROMO } from "@/data/promotions";
import OfferTermsModal from "./OfferTermsModal";

const STORAGE_KEY = "digiformation_free_website_offer_v1";

interface PromoContent {
  headline: string;
  subheadline: string;
  badge: string;
  ctaText: string;
  targetId: string;
  fallbackPath: string;
}

export const FreeWebsiteOfferModal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Check if current page is an allowed promotional target page
  const isTargetPage = useCallback((pathname: string) => {
    // Strictly prevent showing on checkout, payment, auth, or admin pages
    if (
      pathname.includes("/checkout") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/reset-password")
    ) {
      return false;
    }

    return (
      pathname.startsWith("/uk-services/uk-ltd-formation") ||
      pathname.startsWith("/ltd-formation-services") ||
      pathname.startsWith("/usa-services/us-llc-formation") ||
      pathname.startsWith("/banks-payment-solutions") ||
      pathname === "/packages" ||
      pathname === "/pricing"
    );
  }, []);

  // Determine copy based on active service route
  const getPromoContent = useCallback((): PromoContent => {
    const p = location.pathname;
    if (p.includes("uk-ltd-formation") || p.includes("ltd-formation")) {
      return {
        headline: "Register Your UK LTD. Get a FREE Website!",
        subheadline:
          "Form your UK Limited Company with our Silver, Gold, or Platinum packages and receive a complimentary 4-page responsive business website.",
        badge: "UK LTD 2026 LAUNCH PROMO",
        ctaText: "Claim My Free Website",
        targetId: "packages",
        fallbackPath: "/uk-services/uk-ltd-formation#packages",
      };
    }
    if (p.includes("us-llc-formation")) {
      return {
        headline: "Form Your US LLC + Get a FREE Business Website!",
        subheadline:
          "Register your American LLC with Silver or Gold packages and receive a professionally designed modern website to launch your global venture.",
        badge: "USA LLC 2026 LAUNCH PROMO",
        ctaText: "Explore LLC Packages",
        targetId: "packages",
        fallbackPath: "/usa-services/us-llc-formation#packages",
      };
    }
    if (p.includes("banks-payment-solutions")) {
      return {
        headline: "Set Up Your Business Payments. Claim a FREE Website!",
        subheadline:
          "Open your multi-currency business account or payment gateway and receive a complimentary website to satisfy underwriting compliance.",
        badge: "BANKING 2026 LAUNCH PROMO",
        ctaText: "View Eligible Packages",
        targetId: "providers",
        fallbackPath: "/banks-payment-solutions#providers",
      };
    }
    return {
      headline: "Register Your Business. Get Your Website FREE.",
      subheadline:
        "Combine your legal company formation or banking setup with a complimentary business website through DigiFormation's 2026 launch offer.",
      badge: "2026 BUSINESS LAUNCH OFFER",
      ctaText: "Explore Launch Packages",
      targetId: "packages",
      fallbackPath: "/packages",
    };
  }, [location.pathname]);

  const content = getPromoContent();

  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Storage access gracefully handled
    }
  }, []);

  // Timer: 8 seconds after active browsing on target page
  useEffect(() => {
    if (!FREE_WEBSITE_PROMO.isActive) return;
    if (!isTargetPage(location.pathname)) {
      setIsVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        return; // Already seen or dismissed in this session
      }
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      // Re-verify we are still on a valid target page before rendering
      if (isTargetPage(window.location.pathname)) {
        setIsVisible(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [location.pathname, isTargetPage]);

  // Escape key listener for accessibility
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, dismiss]);

  const handleCtaClick = () => {
    dismiss();
    const elem = document.getElementById(content.targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(content.fallbackPath);
    }
  };

  if (!isVisible || !FREE_WEBSITE_PROMO.isActive) return null;

  return (
    <>
      {/* Accessible Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Responsive Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="fixed z-50 left-1/2 -translate-x-1/2 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-[calc(100%-2rem)] max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <div className="relative overflow-hidden rounded-2xl glass border border-primary/30 p-6 md:p-8 shadow-2xl bg-gradient-to-b from-card/95 via-card/90 to-background/95 backdrop-blur-xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={dismiss}
            type="button"
            aria-label="Close promotion"
            className="absolute top-4 right-4 p-1.5 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Promo Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {content.badge}
          </div>

          {/* Headline */}
          <h3
            id="promo-title"
            className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground"
          >
            {content.headline}
          </h3>

          {/* Subtitle */}
          <p className="mt-3 text-sm md:text-base leading-relaxed opacity-85 text-muted-foreground">
            {content.subheadline}
          </p>

          {/* Highlight feature bullets */}
          <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>4-Page React Design</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>100% Mobile Responsive</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Free Netlify/Vercel Setup</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Full Code Ownership</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleCtaClick}
              variant="hero"
              size="lg"
              className="w-full sm:w-auto rounded-full font-bold px-6 shadow-elegant text-sm"
            >
              {content.ctaText} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <button
              onClick={() => setShowTerms(true)}
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition underline underline-offset-4 py-2"
            >
              Terms &amp; Conditions Apply
            </button>
          </div>

          {/* Transparency note */}
          <p className="mt-4 text-[10px] opacity-60 leading-normal text-muted-foreground">
            *Complimentary 4-page business website included with qualifying package orders. Domain registration and custom third-party fees billed separately. Zero hidden charges.
          </p>
        </div>
      </div>

      {/* Nested Terms Modal */}
      <OfferTermsModal open={showTerms} onOpenChange={setShowTerms} />
    </>
  );
};

export default FreeWebsiteOfferModal;
