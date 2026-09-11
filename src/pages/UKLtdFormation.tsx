import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Building2, FileCheck, Lock, Users, Star, Globe2, HelpCircle, FileText, BadgeCheck, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import UKLtdHero from "@/components/hero-animations/UKLtdHero";
import ServiceFAQ from "@/components/seo/ServiceFAQ";
import RelatedServices from "@/components/seo/RelatedServices";
import RecommendedGuides from "@/components/seo/RecommendedGuides";
import { useSeo } from "@/lib/seo";

const rotatingHeadlines = [
  { lead: "Register Your UK Limited Company in", accent: "Days" },
  { lead: "Establish Your Business in the UK with", accent: "Confidence" },
  { lead: "Start Your UK Company the", accent: "Smart Way" },
];

const trustSignals = [
  { icon: Building2, label: "Registered with Companies House" },
  { icon: Users, label: "300+ UK Companies Formed" },
  { icon: Star, label: "98% Success Rate" },
  { icon: Lock, label: "Secure Document Handling" },
  { icon: ShieldCheck, label: "Dedicated Support Team" },
];

const whatYouGet = [
  "Official Companies House incorporation & certificate",
  "Digital & printed Memorandum & Articles of Association",
  "HMRC Corporation Tax UTR registration support",
  "Official Company Authentication Code (WebFiling)",
  "London Registered Office & Director Service Address",
  "Companies House ID verification (ECCT Act compliant)",
  "Digital share certificates & statutory register",
  "Dedicated ongoing director & compliance guidance",
];

const formationSteps = [
  {
    step: "01",
    title: "Select Jurisdiction & Package",
    desc: "Choose England & Wales, Scotland, or Northern Ireland along with your formation package tailored to UK or non-resident founders.",
  },
  {
    step: "02",
    title: "Company Name & Identity Verification",
    desc: "Submit your proposed company name and complete identity verification for directors and PSCs under the ECCT Act 2023.",
  },
  {
    step: "03",
    title: "Companies House Incorporation",
    desc: "We prepare and submit your electronic incorporation documents directly to Companies House for official registration.",
  },
  {
    step: "04",
    title: "Receive Certificate & Statutory Documents",
    desc: "Get your official Certificate of Incorporation, Memorandum & Articles of Association, and digital share certificates.",
  },
  {
    step: "05",
    title: "HMRC UTR, Banking & Gateway Support",
    desc: "Receive your HMRC UTR number by mail at your registered office, and get guided onboarding for UK business bank accounts and payment gateways.",
  },
];

const nonResidentBenefits = [
  {
    title: "100% Foreign Ownership",
    desc: "No UK residency or citizenship required. Non-residents can hold 100% of company shares and act as sole director.",
  },
  {
    title: "London Registered Office Included",
    desc: "A prestigious UK registered office address to meet statutory Companies House and HMRC mail requirements.",
  },
  {
    title: "Global Banking Guidance",
    desc: "Assistance applying for business bank accounts with providers like Wise, Tide, and Airwallex (subject to provider approval).",
  },
  {
    title: "International Payment Gateways",
    desc: "Connect Stripe and PayPal to your UK Limited Company to accept global card payments seamlessly.",
  },
];

type Pkg = {
  name: string;
  price: string;
  tone: string;
  ring: string;
  badge?: string;
  features: string[];
  cta: string;
  processing?: string;
};

const packages: Pkg[] = [
  {
    name: "Starter",
    price: "£140",
    tone: "from-emerald-500/20 to-emerald-500/5",
    ring: "ring-emerald-500/40",
    processing: "3–5 Business Days",
    features: [
      "UK LTD (Company) Registration",
      "Companies House Incorporation Fee Included",
      "Digital Certificate of Incorporation",
      "Digital Memorandum & Articles of Association",
      "Digital Copy of All Documents (PDF)",
      "Digital Shares Certificate",
      "ID Verification Included",
      "Client Portal Access (document uploads & status updates)",
      "12/6 Phone & WhatsApp Support",
    ],
    cta: "Select Starter",
  },
  {
    name: "Silver",
    price: "£170",
    tone: "from-sky-500/25 to-sky-500/5",
    ring: "ring-sky-400/60",
    badge: "Most Popular",
    features: [
      "UK LTD (Company) Registration",
      "Companies House Incorporation Fee Included",
      "Digital + Printed Certificate of Incorporation",
      "Digital Memorandum & Articles of Association",
      "Registered Office Address",
      "Company Authentication Code",
      "UTR Number",
      "Digital Shares Certificate",
      "ID Verification Included",
      "Client Portal Access (document uploads & status updates)",
    ],
    cta: "Select Silver",
  },
  {
    name: "Gold",
    price: "£180",
    tone: "from-amber-400/25 to-amber-400/5",
    ring: "ring-amber-400/50",
    features: [
      "UK LTD (Company) Registration",
      "Companies House Incorporation Fee Included",
      "Digital Certificate of Incorporation",
      "Digital Memorandum & Articles of Association",
      "Registered Office Address",
      "Company Authentication Code",
      "UTR Number",
      "Digital Shares Certificate",
      "ID Verification Included",
      "Director Service Address",
      "Client Portal Access (document uploads & status updates)",
    ],
    cta: "Select Gold",
  },
  {
    name: "Platinum",
    price: "£200",
    tone: "from-rose-500/25 to-rose-500/5",
    ring: "ring-rose-400/50",
    features: [
      "UK LTD (Company) Registration",
      "Companies House Incorporation Fee Included",
      "Digital Certificate of Incorporation",
      "Digital Memorandum & Articles of Association",
      "London Registered Office Address",
      "Company Authentication Code",
      "UTR Number",
      "Digital Shares Certificate",
      "ID Verification Included",
      "Director Service Address",
      "Client Portal Access (document uploads & status updates)",
    ],
    cta: "Select Platinum",
  },
];

const UKLtdFormation = () => {
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeadlineIdx((i) => (i + 1) % rotatingHeadlines.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, []);

  useSeo({
    title: "UK LTD Formation Services 2026 — Register with Companies House | DigiFormation",
    description:
      "Fast, fully compliant UK Limited Company registration for UK & non-resident founders worldwide. Includes Companies House incorporation, UTR tax setup, registered office, ID verification & banking support.",
    keywords:
      "uk ltd formation, register uk company, uk company registration, companies house registration 2026, non resident uk company formation, uk ltd packages, london registered office, hmrc utr registration, director id verification",
    path: "/uk-services/uk-ltd-formation",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "UK Services", path: "/uk-services" },
      { name: "UK LTD Formation", path: "/uk-services/uk-ltd-formation" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "UK LTD Formation Services",
      provider: { "@type": "Organization", name: "Digiformation Ltd" },
      areaServed: "Worldwide",
      description:
        "End-to-end UK Limited Company incorporation for UK and non-resident directors, including Companies House filing, UTR tax registration, registered office, and identity verification.",
      offers: packages.map((p) => ({
        "@type": "Offer",
        name: `${p.name} Package`,
        price: p.price.replace("£", ""),
        priceCurrency: "GBP",
      })),
    },
  });

  const current = rotatingHeadlines[headlineIdx];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">UK Services</span>
              </div>
              <h1
                key={headlineIdx}
                className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight animate-fade-in"
              >
                {current.lead} <em className="not-italic text-gradient">{current.accent}</em>
              </h1>
              <p className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl opacity-90">
                Fast, compliant, and fully supported UK LTD registration with UTR, ID verification, and registered office services.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="lg" className="rounded-full">
                  <Link to="/uk-services/uk-ltd-formation/choose-jurisdiction">Get Started <ArrowRight className="w-4 h-4" /></Link>
                </Button>
                <Button asChild variant="ghostGlow" size="lg" className="rounded-full">
                  <a href="#packages">View Packages</a>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <UKLtdHero />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="glass glass-tint-green rounded-xl p-5 flex flex-col items-center text-center gap-2">
                <Icon className="w-6 h-6 text-primary" />
                <p className="text-xs md:text-sm opacity-90 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">What You Get</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                Register your <em className="not-italic text-gradient">UK Limited Company</em> with everything covered
              </h2>
              <p className="opacity-90 max-w-xl">
                A fully managed service that takes you from idea to incorporated company — without the paperwork headache.
              </p>
            </div>
            <div className="glass glass-tint-green rounded-2xl p-8 md:p-10">
              <div className="space-y-4">
                {whatYouGet.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                    <p className="opacity-90">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="py-12 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">Packages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              UK LTD Formation <em className="not-italic text-gradient">Packages</em>
            </h2>
            <p className="opacity-80 mt-4">
              All packages include Companies House filing fee and compliance setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {packages.map((p) => (
              <div
                key={p.name}
                className={`relative glass rounded-2xl p-7 flex flex-col bg-gradient-to-b ${p.tone} ring-1 ${p.ring} ${
                  p.badge ? "xl:scale-[1.03] xl:-translate-y-1" : ""
                } transition-transform hover:-translate-y-1`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] font-bold bg-gradient-brand text-white px-3 py-1 rounded-full">
                    {p.badge}
                  </span>
                )}
                <div className="text-xs uppercase tracking-[0.18em] font-semibold opacity-80">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{p.price}</span>
                </div>
                {p.processing && (
                  <p className="mt-1 text-xs opacity-70">Processing: {p.processing}</p>
                )}
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <FileCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="opacity-90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.badge ? "hero" : "ghostGlow"} className="rounded-full mt-7 w-full">
                  <Link to={`/uk-services/uk-ltd-formation/checkout?jurisdiction=EW&package=${p.name}`}>{p.cta} <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATION PROCESS STEPS */}
      <section className="py-14 border-t border-border/60 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              UK LTD Formation <em className="not-italic text-gradient">in 5 Simple Steps</em>
            </h2>
            <p className="opacity-80 mt-3">
              From application to incorporation and bank setup — our fully managed workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {formationSteps.map((s) => (
              <div key={s.step} className="glass glass-tint-green rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="font-display text-3xl font-bold text-gradient mb-3">{s.step}</div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-xs opacity-80 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NON RESIDENT FOUNDERS */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">International Founders</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Form a UK Company from <em className="not-italic text-gradient">Anywhere in the World</em>
              </h2>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                You do not need to live in the UK or hold a British passport to form and own a UK Limited Company. We specialize in cross-border incorporations for entrepreneurs in Pakistan, India, UAE, Bangladesh, Nigeria, Morocco, the US, and 80+ countries.
              </p>
              <div className="p-4 rounded-xl glass border-primary/20 flex items-start gap-3 text-xs opacity-90">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  All incorporations comply with the Economic Crime and Corporate Transparency Act (ECCTA 2023) and Companies House identity verification standards.
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {nonResidentBenefits.map((b) => (
                <div key={b.title} className="glass glass-tint-cyan rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-2 text-primary">{b.title}</h3>
                  <p className="text-xs opacity-80 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RelatedServices
        eyebrow="Bundle With"
        title="Complete Your UK Setup"
        items={[
          { name: "Registered Office Address", path: "/uk-services/registered-office-address", description: "Official UK address for Companies House correspondence and director records.", icon: "registered-office" },
          { name: "UTR Number Registration", path: "/uk-services/utr-codes", description: "Get your HMRC Unique Taxpayer Reference for Corporation Tax filings.", icon: "utr" },
          { name: "LTD ID Verification", path: "/uk-services/ltd-id-verification", description: "Mandatory Companies House identity verification for directors and PSCs.", icon: "id-verify" },
          { name: "Business Bank Account", path: "/banks-payment-solutions", description: "Open Tide, Wise or Airwallex accounts paired with your new UK LTD.", icon: "banking" },
          { name: "Stripe & PayPal Setup", path: "/banks-payment-solutions", description: "Connect global payment gateways to your UK company in days.", icon: "payments" },
          { name: "Change of Company Details", path: "/uk-compliance/change-of-company-name", description: "Update name, address, or directors at Companies House.", icon: "change-service" },
        ]}
      />
      <RecommendedGuides
        title="Guides for UK LTD Founders"
        categories={["UK Formation", "UK Compliance"]}
      />
      <ServiceFAQ
        id="uk-ltd-formation"
        faqs={[
          { q: "How long does UK LTD formation take?", a: "Most companies are incorporated by Companies House within 3–5 business days. With the Gold and Platinum packages, we expedite the filing so most incorporations complete inside 24 hours once documents are received." },
          { q: "Can non-UK residents register a UK Limited Company?", a: "Yes. There is no residency requirement to own or direct a UK Limited Company. We routinely form companies for founders in 80+ countries, including Pakistan, India, the UAE, Nigeria, and the US." },
          { q: "Do I need a UK address to register?", a: "Yes — Companies House requires a UK Registered Office Address. Our Silver, Gold and Platinum packages include a London Registered Office and Director Service Address." },
          { q: "What is included in the Companies House filing fee?", a: "All packages include the official Companies House incorporation fee, your Certificate of Incorporation, Memorandum & Articles of Association, and digital share certificates." },
          { q: "Will I get a UTR for my company?", a: "Yes. HMRC issues a Corporation Tax UTR by post to your registered office within 10–14 days of incorporation. Silver, Gold and Platinum packages include UTR support." },
          { q: "Can I open a UK business bank account afterwards?", a: "Yes. After incorporation we'll help you apply with Tide, Wise, Airwallex or traditional UK banks — most non-resident applications are approved within 7–14 days." },
        ]}
      />

      {/* REGULATORY DISCLAIMER */}
      <section className="py-8 border-t border-border/40 text-xs opacity-70">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-2">
          <p>
            <strong>Regulatory Disclaimer:</strong> DigiFormation Ltd provides company formation, administrative corporate filing, and business support services. DigiFormation Ltd is not a law firm or a regulated financial institution and does not provide formal legal, tax, or financial advice.
          </p>
          <p>
            Bank account and payment gateway approvals are determined solely by the respective banking institutions (Tide, Wise, Airwallex, Stripe, PayPal) and are subject to their individual underwriting and compliance criteria.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default UKLtdFormation;
