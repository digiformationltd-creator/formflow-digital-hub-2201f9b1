import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Landmark,
  CreditCard,
  CheckCircle2,
  Check,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FREE_WEBSITE_PROMO } from "@/data/promotions";
import { trackWhatsAppClick } from "@/lib/analytics";
import OfferTermsModal from "./OfferTermsModal";

const STORAGE_COLLAPSED_KEY = "digiformation_free_website_popup_collapsed_v2";

// Official WhatsApp Brand SVG Emblem
const WhatsAppBrandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 175.216 175.552"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="wa-modal-gradient"
        x1="85.915"
        x2="86.535"
        y1="32.567"
        y2="137.092"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#20BA59" />
      </linearGradient>
    </defs>
    <path
      fill="url(#wa-modal-gradient)"
      d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.866 19.519 10.05-36.687C16.488 108.647 12.8 94.619 12.81 80.207 12.827 35.922 48.835 0 93.109 0c21.464.008 41.642 8.375 56.811 23.567 15.17 15.193 23.518 35.38 23.507 56.845-.021 44.292-36.033 80.213-80.316 80.213h-.033c-13.805-.006-27.351-3.568-39.299-10.311z"
    />
    <path
      fill="#fff"
      d="M124.636 102.396c-1.895-.947-11.214-5.534-12.951-6.166-1.737-.632-3-.947-4.263.947-1.263 1.895-4.895 6.166-5.999 7.429-1.106 1.263-2.211 1.421-4.106.474-1.895-.947-8.002-2.949-15.244-9.407-5.636-5.026-9.442-11.233-10.548-13.128-1.105-1.895-.118-2.919.83-3.861.854-.848 1.895-2.211 2.842-3.316.947-1.105 1.263-1.895 1.895-3.158.632-1.263.316-2.369-.158-3.316-.474-.947-4.263-10.264-5.842-14.054-1.539-3.69-3.106-3.19-4.263-3.249-1.105-.059-2.369-.071-3.632-.071-1.263 0-3.316.474-5.053 2.369-1.737 1.895-6.632 6.474-6.632 15.791s6.79 18.318 7.737 19.581c.947 1.263 13.367 20.413 32.385 28.625 4.523 1.953 8.053 3.12 10.806 3.993 4.542 1.442 8.675 1.239 11.942.751 3.642-.544 11.214-4.585 12.793-9.022 1.579-4.437 1.579-8.243 1.105-9.022-.473-.78-1.737-1.263-3.632-2.21z"
    />
  </svg>
);

interface EligibilityOption {
  id: string;
  title: string;
  shortDesc: string;
  eligibleScope: string;
  icon: React.ElementType;
  path: string;
  ctaExplore: string;
  badge: string;
}

const ELIGIBILITY_OPTIONS: EligibilityOption[] = [
  {
    id: "uk-ltd",
    title: "UK LTD Company Formation",
    shortDesc: "Get a UK limited company registered through our services.",
    eligibleScope: "Silver, Gold, or Platinum — Free Website (Domain Not Included) + 30-Day Software Trial",
    icon: Building2,
    path: "/uk-services/uk-ltd-formation",
    ctaExplore: "View UK LTD Packages",
    badge: "Most Popular",
  },
  {
    id: "us-llc",
    title: "USA LLC Company Formation",
    shortDesc: "Start your US business with our LLC formation services.",
    eligibleScope: "Silver or Gold — Free Website (Domain Not Included) + 30-Day Software Trial",
    icon: Landmark,
    path: "/usa-services/us-llc-formation",
    ctaExplore: "View US LLC Packages",
    badge: "US Market",
  },
  {
    id: "banking",
    title: "Business Banking Services",
    shortDesc: "Apply for any one eligible business banking service through us.",
    eligibleScope: "Wise, Tide, Stripe, Airwallex, PayPal & more — Free Website (Domain Not Included) + 30-Day Software Trial",
    icon: CreditCard,
    path: "/banks-payment-solutions",
    ctaExplore: "View Banking Options",
    badge: "Global Payments",
  },
];

export const FreeWebsiteOfferModal: React.FC = () => {
  const location = useLocation();

  // State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("uk-ltd");
  const [showTerms, setShowTerms] = useState(false);

  // Check if current page is excluded (checkout, admin, auth)
  const isExcludedPage = useCallback((pathname: string) => {
    return (
      pathname.includes("/checkout") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/reset-password")
    );
  }, []);

  // Initialize and check persistence
  useEffect(() => {
    if (!FREE_WEBSITE_PROMO.isActive) return;
    if (isExcludedPage(location.pathname)) {
      setIsPopupOpen(false);
      setIsCollapsed(false);
      return;
    }

    try {
      const collapsed = sessionStorage.getItem(STORAGE_COLLAPSED_KEY);

      if (collapsed === "true") {
        // Show as collapsed badge
        setIsPopupOpen(false);
        setIsCollapsed(true);
        return;
      }
    } catch {
      // Storage access gracefully handled
    }

    // Modern newsletter-style subtle delay: 2.5 seconds on first visit
    const timer = setTimeout(() => {
      if (!isExcludedPage(window.location.pathname)) {
        setIsPopupOpen(true);
        setIsCollapsed(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname, isExcludedPage]);

  // Handle dismiss / collapse
  const handleDismissPopup = () => {
    setIsPopupOpen(false);
    setIsCollapsed(true);
    try {
      sessionStorage.setItem(STORAGE_COLLAPSED_KEY, "true");
    } catch {
      // Storage gracefully handled
    }
  };

  // Re-open from collapsed badge
  const handleReopenPopup = () => {
    setIsCollapsed(false);
    setIsPopupOpen(true);
  };

  // Open Eligibility Modal
  const handleOpenEligibility = () => {
    setIsPopupOpen(false);
    setIsCollapsed(true);
    setIsEligibilityModalOpen(true);
    try {
      sessionStorage.setItem(STORAGE_COLLAPSED_KEY, "true");
    } catch {
      // Storage gracefully handled
    }
  };

  // Selected Option Object
  const selectedOption =
    ELIGIBILITY_OPTIONS.find((opt) => opt.id === selectedServiceId) ||
    ELIGIBILITY_OPTIONS[0];

  // Continue on WhatsApp handler
  const handleContinueWhatsApp = () => {
    const serviceTitle = selectedOption.title;
    // Exactly matches prompt specifications:
    const rawMessage = `Hello DigiFormation Team! I am interested in claiming my FREE business website. My selected service is: ${serviceTitle}. Please guide me through the eligibility and next steps.`;
    const encoded = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/923164467464?text=${encoded}`;

    trackWhatsAppClick(`free_website_offer_${selectedOption.id}`);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (!FREE_WEBSITE_PROMO.isActive || isExcludedPage(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* 1. COLLAPSED FLOATING TRIGGER BADGE (WHEN POPUP IS CLOSED/DISMISSED) */}
      {isCollapsed && !isEligibilityModalOpen && (
        <div className="fixed bottom-5 left-5 z-40 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
          <button
            onClick={handleReopenPopup}
            type="button"
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full glass border border-primary/40 bg-card/95 hover:bg-card text-foreground shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-semibold"
            aria-label="Open Free Website Offer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Gift className="w-4 h-4 text-primary animate-bounce" />
            <span className="tracking-tight">Claim Your Free Website</span>
          </button>
        </div>
      )}

      {/* 2. STICKY COMPACT NEWSLETTER-STYLE PROMOTIONAL POPUP */}
      {isPopupOpen && !isEligibilityModalOpen && (
        <aside
          role="region"
          aria-label="Free Website Promotion"
          className="fixed bottom-4 left-4 max-w-[calc(100%-5.5rem)] sm:max-w-[370px] sm:left-5 sm:bottom-5 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="relative overflow-hidden rounded-2xl glass border border-primary/35 p-5 shadow-2xl bg-gradient-to-br from-card/98 via-card/95 to-background/98 backdrop-blur-xl ring-1 ring-white/10">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/25 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

            {/* Close (X) Button */}
            <button
              onClick={handleDismissPopup}
              type="button"
              aria-label="Close promotion"
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              SPECIAL 2026 LAUNCH OFFER
            </div>

            {/* Headline — STRICTLY REQUIRED: "CLAIM YOUR FREE WEBSITE!" */}
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground leading-snug">
              CLAIM YOUR <span className="text-gradient">FREE WEBSITE!</span>
            </h3>

            {/* Supporting Text — STRICTLY REQUIRED */}
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Get a professionally designed business website FREE (Domain Not Included) + 30-Day DigiBusiness Software Free Trial when you choose any eligible service.
            </p>

            {/* Micro feature pills */}
            <div className="mt-3 py-2 border-y border-border/40 flex items-center justify-between text-[11px] text-foreground/80 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> 4-Page React
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" /> Domain Not Included
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-cyan-400" /> 30-Day DigiBiz Trial
              </span>
            </div>

            {/* CTA Button — STRICTLY REQUIRED: "CHECK ELIGIBILITY" */}
            <div className="mt-3.5 flex flex-col gap-2">
              <Button
                onClick={handleOpenEligibility}
                variant="hero"
                size="sm"
                className="w-full rounded-full font-bold shadow-lg shadow-primary/25 text-xs sm:text-sm py-4"
              >
                CHECK ELIGIBILITY <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="hover:text-primary transition underline underline-offset-2"
                >
                  Offer Terms &amp; Conditions
                </button>
                <button
                  type="button"
                  onClick={handleDismissPopup}
                  className="hover:text-foreground transition opacity-70"
                >
                  Dismiss for now
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 3. CLEAN, MODERN ELIGIBILITY MODAL */}
      <Dialog open={isEligibilityModalOpen} onOpenChange={setIsEligibilityModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto glass border-primary/30 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-card/98 via-card/95 to-background/98 shadow-2xl">
          <DialogHeader className="text-left space-y-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              DigiFormation Launch Special
            </div>

            {/* Headline — STRICTLY REQUIRED: "Unlock Your FREE Business Website" */}
            <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Unlock Your <span className="text-gradient">FREE Business Website</span>
            </DialogTitle>

            {/* Description — STRICTLY REQUIRED: "Choose any one of the following eligible services..." */}
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Choose any one of the following eligible services and receive a professionally designed website FREE.
            </DialogDescription>
          </DialogHeader>

          {/* Three Eligibility Options with attractive cards & icons */}
          <div className="mt-4 space-y-3" role="radiogroup" aria-label="Eligible Services">
            {ELIGIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedServiceId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedServiceId(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedServiceId(opt.id);
                    }
                  }}
                  tabIndex={0}
                  role="radio"
                  aria-checked={isSelected}
                  className={`group relative cursor-pointer rounded-xl p-4 transition-all duration-200 border text-left ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/40"
                      : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon container */}
                    <div
                      className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/60 text-primary group-hover:bg-primary/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-base text-foreground tracking-tight">
                          {opt.title}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                          {opt.badge}
                        </span>
                      </div>

                      {/* Required Short Description */}
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-snug">
                        {opt.shortDesc}
                      </p>

                      <div className="mt-2 text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Eligible on: {opt.eligibleScope}</span>
                      </div>
                    </div>

                    {/* Selection radio visual indicator */}
                    <div className="pt-1 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 grid place-items-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-transparent"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ELIGIBILITY CONFIRMATION BANNER & WHATSAPP REDIRECTION */}
          <div className="mt-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                {/* STRICTLY REQUIRED: "Congratulations! You may qualify for a FREE business website." */}
                <h5 className="font-bold text-sm text-foreground">
                  Congratulations! You may qualify for a FREE business website.
                </h5>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Your selection (<strong>{selectedOption.title}</strong>) is eligible for a complimentary 4-page responsive business website (Domain Not Included) plus a 30-Day DigiBusiness Software full desktop license trial. Final eligibility is confirmed upon order verification.
                </p>
              </div>
            </div>

            {/* CTA BUTTON — STRICTLY REQUIRED: "CONTINUE ON WHATSAPP" */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleContinueWhatsApp}
                type="button"
                className="w-full sm:flex-1 rounded-full font-bold text-sm py-5 bg-[#25D366] hover:bg-[#20BA59] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <WhatsAppBrandIcon className="w-5 h-5" />
                CONTINUE ON WHATSAPP
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-full text-xs font-semibold px-4"
              >
                <Link
                  to={selectedOption.path}
                  onClick={() => setIsEligibilityModalOpen(false)}
                >
                  {selectedOption.ctaExplore} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer note & Terms */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Official WhatsApp Support: +92 316 4467464</span>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="hover:text-primary transition underline underline-offset-2"
            >
              Offer Terms &amp; Conditions
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <OfferTermsModal open={showTerms} onOpenChange={setShowTerms} />
    </>
  );
};

export default FreeWebsiteOfferModal;
