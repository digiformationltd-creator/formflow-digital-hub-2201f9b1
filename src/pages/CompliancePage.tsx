import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Clock, 
  FileCheck, 
  Sparkles, 
  AlertTriangle, 
  ChevronDown, 
  Lock,
  Globe2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { findCompliancePage } from "@/data/compliance";
import { useSeo } from "@/lib/seo";
import NotFound from "./NotFound";

const trust = [
  { icon: Building2, label: "Companies House Compliant" },
  { icon: Clock, label: "Fast Priority Dispatch" },
  { icon: ShieldCheck, label: "100% Acceptance Guarantee" },
  { icon: FileCheck, label: "Tracked Proof Included" },
];

const buildCheckoutLink = (slug: string, title: string) => {
  const params = new URLSearchParams();
  params.set("service", slug);
  params.set("title", title);
  return `/checkout?${params.toString()}`;
};

const CompliancePage = () => {
  const { slug } = useParams();
  const page = findCompliancePage(slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqSchema = page?.faqs && page.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      }
    : null;

  useSeo(
    page
      ? {
          title: page.metaTitle,
          description: page.metaDescription,
          keywords: page.keywords,
          type: "website",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "UK Compliance", path: "/uk-compliance" },
            { name: page.title, path: `/uk-compliance/${page.slug}` },
          ],
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: page.title,
              description: page.description,
              provider: { "@type": "Organization", name: "Digiformation Ltd", url: "https://www.digiformation.co.uk" },
              areaServed: "United Kingdom",
              offers: { "@type": "Offer", price: page.price.replace(/[^0-9.]/g, ""), priceCurrency: "GBP" },
            },
            ...(faqSchema ? [faqSchema] : []),
          ],
        }
      : { title: "Compliance Service Not Found | Digiformation", description: "Compliance page not found.", noindex: true },
    [page?.slug],
  );

  if (!page) return <NotFound />;

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-hero py-12 md:py-16">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl">
            {page.badge ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/25 text-primary mb-5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{page.badge}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">{page.eyebrow}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight">
              <em className="not-italic text-gradient">{page.hero}</em>
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed max-w-2xl opacity-90">{page.description}</p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button asChild variant="hero" size="lg" className="rounded-full shadow-glow">
                <Link to={buildCheckoutLink(page.slug, page.title)}>
                  Start Filing — {page.price} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ghostGlow" size="lg" className="rounded-full">
                <Link to="/uk-compliance">All Compliance Services</Link>
              </Button>
            </div>

            {/* TRUST ROW */}
            <div className="mt-12 pt-8 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trust.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.label} className="flex items-center gap-2.5 text-xs opacity-80">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE OVERVIEW & PRICING BOX */}
      <section className="py-12 md:py-16 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">Service Overview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
                What's <em className="not-italic text-gradient">included in this filing</em>
              </h2>
              <ul className="space-y-3.5">
                {page.overview.map((o) => (
                  <li key={o} className="flex items-start gap-3 glass glass-tint-mustard rounded-xl p-4 transition-colors hover:border-primary/40">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base leading-snug">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 sticky top-24">
              <div className="glass glass-tint-mustard rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary mb-2">Total Service Fee</div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-extrabold text-gradient">{page.price}</span>
                  <span className="text-xs opacity-75">/ complete filing</span>
                </div>
                <p className="text-xs opacity-80 mb-6 leading-relaxed">
                  Full official statutory preparation, jurisdictional verification, tracked submission to Companies House, and tracking until approved on the public register.
                </p>

                <div className="space-y-2.5 mb-6 text-xs border-y border-border/60 py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Statutory Companies House document drafting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Cardiff / Edinburgh tracked priority postal delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>No Companies House Auth Code required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Assistance requesting new authentication code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>100% money-back acceptance guarantee</span>
                  </div>
                </div>

                <Button asChild variant="hero" size="lg" className="w-full rounded-full shadow-glow">
                  <Link to={buildCheckoutLink(page.slug, page.title)}>
                    Order Filing Now — {page.price} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] opacity-70">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypted 256-bit checkout · Instant order confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHEN NEEDED SECTION */}
      {page.whenNeeded && page.whenNeeded.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/20 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">Common Scenarios</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                When Do You Need to File <em className="not-italic text-gradient">by Post?</em>
              </h2>
              <p className="opacity-80 mt-3 text-sm sm:text-base">
                Filing Form AD01 by post is the legally established recovery mechanism under the Companies Act 2006 when standard digital filings are blocked.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {page.whenNeeded.map((item, idx) => (
                <div key={item.title} className="glass glass-tint-mustard rounded-xl p-6 border border-border/60 relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center flex-shrink-0 text-primary">
                      {idx === 0 ? <Lock className="w-4 h-4" /> : idx === 1 ? <Building2 className="w-4 h-4" /> : idx === 2 ? <Globe2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm opacity-85 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS SECTION */}
      {page.howItWorks && page.howItWorks.length > 0 && (
        <section className="py-12 md:py-16 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">Step-by-Step Execution</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                How Our <em className="not-italic text-gradient">Filing Process Works</em>
              </h2>
              <p className="opacity-80 mt-3 text-sm sm:text-base">
                From statutory document drafting to tracked postal delivery and public register confirmation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.howItWorks.map((step) => (
                <div key={step.step} className="glass glass-tint-mustard rounded-xl p-6 border border-border/60 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground font-bold text-sm grid place-items-center mb-4 shadow-sm">
                      {step.step}
                    </div>
                    <h3 className="text-base font-bold mb-2 leading-snug">{step.title}</h3>
                    <p className="text-xs opacity-85 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REQUIREMENTS SECTION */}
      <section className="py-12 md:py-16 bg-muted/20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">Requirements</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            What we'll <em className="not-italic text-gradient">need from you</em>
          </h2>
          <p className="opacity-80 mb-8 max-w-2xl text-sm sm:text-base">
            Please have the following information ready so our compliance specialists can prepare and dispatch your filing without delay.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {page.requirements.map((r, i) => (
              <div key={r} className="glass glass-tint-mustard rounded-xl p-5 flex gap-4 items-start border border-border/60">
                <div className="w-7 h-7 rounded-full bg-gradient-brand grid place-items-center text-xs font-bold flex-shrink-0 text-primary-foreground">{i + 1}</div>
                <span className="font-medium text-sm leading-snug">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS ACCORDION SECTION */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="py-12 md:py-16 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">Answers & Clarifications</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Frequently Asked <em className="not-italic text-gradient">Questions</em>
              </h2>
              <p className="opacity-80 mt-2 text-sm">
                Everything you need to know about Companies House registered office changes and postal filings.
              </p>
            </div>

            <div className="space-y-3">
              {page.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={faq.q} 
                    className="glass glass-tint-mustard rounded-xl border border-border/60 overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base gap-4 hover:text-primary transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm opacity-85 leading-relaxed border-t border-border/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA BANNER */}
      <section className="py-12 md:py-16 border-t border-border/60 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Need to Change Your Registered Office <em className="not-italic text-gradient">Urgently?</em>
          </h2>
          <p className="opacity-85 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Avoid missed Companies House statutory deadlines, rejected annual filings, and strike-off notices. File Form AD01 with DigiFormation's fully managed postal service today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="hero" size="lg" className="rounded-full shadow-glow px-8">
              <Link to={buildCheckoutLink(page.slug, page.title)}>
                File Form AD01 by Post Now — {page.price} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="ghostGlow" size="lg" className="rounded-full">
              <Link to="/contact">Speak to a Compliance Specialist</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* REGULATORY DISCLAIMER */}
      <section className="py-8 border-t border-border/40 text-xs opacity-70">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-2">
          <p>
            <strong>Regulatory Disclaimer:</strong> DigiFormation Ltd provides company secretarial, administrative corporate filing, and document support services. DigiFormation Ltd is not a law firm, chartered accountancy practice, or a government agency and does not provide formal legal, statutory audit, or regulated tax advice.
          </p>
          <p>
            All statutory returns are submitted directly to Companies House and HMRC on behalf of company officers in accordance with UK statutory compliance requirements.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default CompliancePage;
