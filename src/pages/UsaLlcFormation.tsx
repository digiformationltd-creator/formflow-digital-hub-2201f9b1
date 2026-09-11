import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Building2, FileCheck, Lock, Users, Star, Globe2, HelpCircle, FileText, BadgeCheck, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ServiceFAQ from "@/components/seo/ServiceFAQ";
import RelatedServices from "@/components/seo/RelatedServices";
import RecommendedGuides from "@/components/seo/RecommendedGuides";
import { useSeo } from "@/lib/seo";

const rotatingHeadlines = [
  { lead: "Form Your U.S. LLC from Anywhere in the", accent: "World" },
  { lead: "Establish Your U.S. Business with", accent: "Confidence" },
  { lead: "Start Your American Company the", accent: "Smart Way" },
];

const trustSignals = [
  { icon: Building2, label: "Registered Agent Network" },
  { icon: Users, label: "300+ U.S. LLCs Formed" },
  { icon: Star, label: "99% Formation Success Rate" },
  { icon: Lock, label: "Secure IRS & State Filing" },
  { icon: ShieldCheck, label: "Dedicated Client Support" },
];

const whatYouGet = [
  "Official Articles of Organization filed with Secretary of State",
  "Official Certificate of Formation & Digital Company Docs",
  "Employer Identification Number (EIN) from the IRS (SS-4 filing)",
  "U.S. Registered Agent Service (1 Year Included)",
  "U.S. Business Address for corporate mail handling",
  "Custom Operating Agreement & Banking Resolution",
  "BOI (Beneficial Ownership Information) filing guidance",
  "Assistance with U.S. Business Banking (Mercury, Relay, Wise)",
];

const stateOptions = [
  {
    code: "WY",
    name: "Wyoming",
    badge: "Most Popular for Non-Residents",
    highlights: "Zero state corporate tax, strong member privacy, low annual report fee ($62). Ideal for global e-commerce and freelancers.",
    tone: "from-sky-500/20 to-sky-500/5",
  },
  {
    code: "DE",
    name: "Delaware",
    badge: "Preferred by Tech & Investors",
    highlights: "World-renowned Court of Chancery, prestigious corporate jurisdiction, preferred by venture capital and tech startups.",
    tone: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    code: "FL",
    name: "Florida",
    badge: "Best for Trade & Physical Presence",
    highlights: "Major international trading hub, no state personal income tax, excellent for Amazon FBA and Latin American / European commerce.",
    tone: "from-amber-400/20 to-amber-400/5",
  },
  {
    code: "TX",
    name: "Texas",
    badge: "Booming Business Economy",
    highlights: "No individual state income tax, strong asset protection, ideal for growing enterprise businesses and real estate.",
    tone: "from-rose-500/20 to-rose-500/5",
  },
];

const formationSteps = [
  {
    step: "01",
    title: "Select State & Package",
    desc: "Choose Wyoming, Delaware, Florida, or Texas along with your formation package tailored for international founders.",
  },
  {
    step: "02",
    title: "Company Name & Member Info",
    desc: "Submit your desired LLC name and ownership details. No US residency or Social Security Number (SSN) required.",
  },
  {
    step: "03",
    title: "State Incorporation",
    desc: "We file your Articles of Organization directly with the Secretary of State and secure your Certificate of Formation.",
  },
  {
    step: "04",
    title: "IRS EIN Issuance",
    desc: "We prepare and submit Form SS-4 to the IRS to obtain your official Employer Identification Number (EIN).",
  },
  {
    step: "05",
    title: "U.S. Banking & Stripe Setup",
    desc: "Receive your full corporate document package, then get guided onboarding for Mercury, Relay, Wise, and Stripe.",
  },
];

const nonResidentBenefits = [
  {
    title: "100% Foreign Ownership",
    desc: "No U.S. citizenship, green card, or residency required. International entrepreneurs can own 100% of a U.S. LLC.",
  },
  {
    title: "No SSN or ITIN Required to Form",
    desc: "You can form a U.S. LLC and obtain an EIN using just your valid foreign passport.",
  },
  {
    title: "Global Payment Gateway Access",
    desc: "A U.S. LLC allows non-residents to access Stripe, PayPal, and international merchant accounts from anywhere.",
  },
  {
    title: "U.S. Multi-Currency Banking",
    desc: "Open dedicated USD business bank accounts with leading fintech platforms including Mercury, Relay, and Wise Business.",
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
    price: "$199",
    tone: "from-emerald-500/20 to-emerald-500/5",
    ring: "ring-emerald-500/40",
    processing: "5–7 Business Days",
    features: [
      "U.S. LLC State Filing & Registration",
      "Articles of Organization",
      "Certificate of Formation (Digital PDF)",
      "Employer Identification Number (EIN)",
      "Shared Business Address",
      "Client Portal Access",
      "24/7 Dedicated Support",
    ],
    cta: "Select Starter",
  },
  {
    name: "Silver",
    price: "$299",
    tone: "from-sky-500/25 to-sky-500/5",
    ring: "ring-sky-400/60",
    badge: "Most Popular",
    features: [
      "U.S. LLC State Filing & Registration",
      "Articles of Organization",
      "Certificate of Formation (Digital PDF)",
      "Employer Identification Number (EIN)",
      "Registered Agent Service (1 Year)",
      "Unique Business Address (Mail Support)",
      "Custom Operating Agreement",
      "Client Portal Access & 24/7 Support",
    ],
    cta: "Select Silver",
  },
  {
    name: "Gold",
    price: "$499",
    tone: "from-amber-400/25 to-amber-400/5",
    ring: "ring-amber-400/50",
    features: [
      "U.S. LLC State Filing & Registration",
      "Articles of Organization & Formation Certificate",
      "Employer Identification Number (EIN)",
      "Registered Agent Service (1 Year)",
      "Unique Business Address & Mail Portal",
      "Custom Operating Agreement",
      "ITIN (Individual Tax ID) Application Included",
      "BOI FinCEN Report Submission",
      "Priority VIP Support",
    ],
    cta: "Select Gold",
  },
];

const UsaLlcFormation = () => {
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeadlineIdx((i) => (i + 1) % rotatingHeadlines.length), 3500);
    return () => clearInterval(t);
  }, []);

  useSeo({
    title: "US LLC Formation Services 2026 — Non-Resident LLC Setup | DigiFormation",
    description:
      "Form a U.S. LLC remotely from anywhere in the world. Includes state filing (Wyoming, Delaware, Florida), IRS EIN without SSN, Registered Agent, US business address, and banking support.",
    keywords:
      "US LLC formation, form an LLC in USA, US LLC for non residents, Wyoming LLC formation, Delaware LLC formation, Florida LLC, EIN without SSN, US business bank account, non resident LLC formation 2026",
    path: "/usa-services/us-llc-formation",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "USA Services", path: "/usa-services" },
      { name: "US LLC Formation", path: "/usa-services/us-llc-formation" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "US LLC Formation Services",
      provider: { "@type": "Organization", name: "Digiformation Ltd" },
      areaServed: "Worldwide",
      description:
        "Complete U.S. Limited Liability Company formation for non-resident and international founders, including state registration, EIN tax ID, Registered Agent, and US banking guidance.",
      offers: packages.map((p) => ({
        "@type": "Offer",
        name: `${p.name} Package`,
        price: p.price.replace("$", ""),
        priceCurrency: "USD",
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
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">USA Services · Commercial</span>
            </div>
            <h1
              key={headlineIdx}
              className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight animate-fade-in"
            >
              {current.lead} <em className="not-italic text-gradient">{current.accent}</em>
            </h1>
            <p className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl opacity-90">
              Fast, compliant U.S. LLC registration for non-resident founders worldwide. Includes Articles of Organization, IRS EIN tax ID, Registered Agent, and business banking assistance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="hero" size="lg" className="rounded-full">
                <Link to="/usa-services/us-llc-formation/choose-state">Choose Your State <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="ghostGlow" size="lg" className="rounded-full">
                <a href="#packages">View Packages</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="glass glass-tint-blue rounded-xl p-5 flex flex-col items-center text-center gap-2">
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
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">Everything Included</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                Form your <em className="not-italic text-gradient">U.S. LLC</em> with complete peace of mind
              </h2>
              <p className="opacity-90 max-w-xl">
                A fully managed cross-border service that takes you from application to incorporated company, IRS tax ID, and banking readiness.
              </p>
            </div>
            <div className="glass glass-tint-blue rounded-2xl p-8 md:p-10">
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

      {/* STATE SELECTION HIGHLIGHTS */}
      <section className="py-14 border-t border-border/60 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">Popular Jurisdictions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Which State is Right for <em className="not-italic text-gradient">Your Business?</em>
            </h2>
            <p className="opacity-80 mt-3">
              We form LLCs across all 50 states — here are the top choices for international founders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stateOptions.map((s) => (
              <div key={s.code} className={`glass rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-b ${s.tone} border border-border/60`}>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary mb-2">{s.badge}</div>
                  <h3 className="text-2xl font-bold mb-3">{s.name} ({s.code})</h3>
                  <p className="text-xs opacity-85 leading-relaxed mb-6">{s.highlights}</p>
                </div>
                <Button asChild variant="ghostGlow" size="sm" className="rounded-full w-full">
                  <Link to={`/usa-services/us-llc-formation/choose-state?state=${s.code}`}>Select {s.name} →</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATION PROCESS STEPS */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              U.S. LLC Formation <em className="not-italic text-gradient">in 5 Simple Steps</em>
            </h2>
            <p className="opacity-80 mt-3">
              From state selection to IRS EIN issuance and bank setup — our streamlined workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {formationSteps.map((s) => (
              <div key={s.step} className="glass glass-tint-blue rounded-2xl p-6 flex flex-col justify-between">
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
      <section className="py-14 border-t border-border/60 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">International Founders</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Form a U.S. Company with <em className="not-italic text-gradient">Zero U.S. Residency</em>
              </h2>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                You do not need a Green Card, U.S. visa, or Social Security Number to own a U.S. business. We help founders in Pakistan, India, UAE, UK, Europe, Latin America, and 100+ countries launch their American entity remotely.
              </p>
              <div className="p-4 rounded-xl glass border-primary/20 flex items-start gap-3 text-xs opacity-90">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  All formations include complete corporate documentation and FinCEN BOI compliance reporting support.
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

      {/* PACKAGES */}
      <section id="packages" className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">Packages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              U.S. LLC Formation <em className="not-italic text-gradient">Packages</em>
            </h2>
            <p className="opacity-80 mt-4">
              Transparent fixed pricing for international founders. State filing fees apply based on your selected state.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((p) => (
              <div
                key={p.name}
                className={`relative glass rounded-2xl p-7 flex flex-col bg-gradient-to-b ${p.tone} ring-1 ${p.ring} ${
                  p.badge ? "md:scale-[1.03] md:-translate-y-1" : ""
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
                  <span className="text-xs opacity-70 ml-1">+ state fee</span>
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
                  <Link to={`/usa-services/us-llc-formation/choose-state?package=${p.name}`}>{p.cta} <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedServices
        eyebrow="Bundle With"
        title="Complete Your U.S. Setup"
        items={[
          { name: "EIN Tax ID Number", path: "/usa-services/ein-number", description: "Official IRS Employer Identification Number for non-residents without SSN.", icon: "utr" },
          { name: "ITIN Number Service", path: "/usa-services/itin-number", description: "Individual Taxpayer Identification Number application via IRS acceptance routes.", icon: "id-verify" },
          { name: "BOI Report Filing", path: "/usa-services/bio-report", description: "Mandatory FinCEN Beneficial Ownership Information compliance filing.", icon: "change-service" },
          { name: "Annual Tax Filing", path: "/usa-services/annual-tax-filing", description: "U.S. federal and state annual returns (Form 5472 + 1120 support).", icon: "change-service" },
          { name: "U.S. Business Banking", path: "/banks-payment-solutions", description: "Open Mercury, Relay or Wise accounts paired with your new U.S. LLC.", icon: "banking" },
          { name: "Stripe & PayPal Gateways", path: "/banks-payment-solutions", description: "Connect global USD payment processing to your U.S. company.", icon: "payments" },
        ]}
      />
      <RecommendedGuides
        title="Guides for U.S. LLC Founders"
        categories={["USA Formation", "Banking"]}
      />
      <ServiceFAQ
        id="us-llc-formation"
        faqs={[
          { q: "Can a non-US resident form a US LLC?", a: "Yes. Anyone of any nationality can legally form, own, and direct a U.S. Limited Liability Company with 100% foreign ownership. You do not need a U.S. visa, green card, or physical residency." },
          { q: "Which U.S. state is best for non-residents?", a: "Wyoming and Delaware are the most popular choices. Wyoming offers lower annual reporting fees ($62) and strong privacy. Delaware is preferred by tech startups seeking venture funding. Florida is popular for physical e-commerce and Latin American trade." },
          { q: "Do I need a Social Security Number (SSN) to get an EIN?", a: "No. Non-residents can obtain an official IRS Employer Identification Number (EIN) using Form SS-4 with their foreign passport as responsible party documentation." },
          { q: "Can I open a U.S. business bank account remotely?", a: "Yes. After receiving your LLC formation documents and EIN, we guide you through applying with U.S. business fintechs like Mercury, Relay, and Wise Business remotely." },
          { q: "What is a BOI Report and do I have to file it?", a: "Under the Corporate Transparency Act, most U.S. LLCs must file a Beneficial Ownership Information (BOI) report with FinCEN. We provide fully managed BOI filing assistance." },
          { q: "How long does U.S. LLC formation take?", a: "State formation typically takes 3–7 business days depending on the state. IRS EIN issuance for non-residents without SSN takes an additional 3–10 business days." },
        ]}
      />

      {/* REGULATORY DISCLAIMER */}
      <section className="py-8 border-t border-border/40 text-xs opacity-70">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-2">
          <p>
            <strong>Regulatory Disclaimer:</strong> DigiFormation Ltd provides corporate administrative filing, Registered Agent coordination, and business setup assistance. DigiFormation Ltd is not a law firm, Certified Public Accountant (CPA), or government agency, and does not provide formal legal, statutory tax, or financial advisory services.
          </p>
          <p>
            Employer Identification Numbers (EIN) are issued exclusively by the U.S. Internal Revenue Service (IRS). Bank account and payment processor approvals are determined solely by the respective financial institutions (Mercury, Relay, Wise, Stripe, PayPal) subject to their underwriting policies.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default UsaLlcFormation;
