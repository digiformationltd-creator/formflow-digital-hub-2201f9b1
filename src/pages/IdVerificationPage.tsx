import { Link } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  Globe2, 
  Lock, 
  AlertTriangle, 
  UserCheck, 
  Sparkles, 
  Clock, 
  Building2, 
  HelpCircle, 
  Check, 
  ChevronDown,
  FileText, 
  Scale,
  Award
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const requiredRoles = [
  {
    role: "Company Directors",
    desc: "All new and existing directors of UK private and public limited companies must verify their identity before filing or acting.",
    badge: "Mandatory"
  },
  {
    role: "Persons with Significant Control (PSCs)",
    desc: "Anyone holding >25% shares, voting rights, or significant influence must complete identity verification under ECCTA 2023.",
    badge: "Mandatory"
  },
  {
    role: "Company Secretaries",
    desc: "Appointed secretaries filing formal statutory paperwork or compliance documents on behalf of a UK company.",
    badge: "Required"
  },
  {
    role: "Non-Resident Officers & Shareholders",
    desc: "International founders and foreign directors holding officer roles without requiring a UK residence or physical visa.",
    badge: "Worldwide"
  },
];

const serviceHighlights = [
  { icon: Lock, title: "Bank-Grade Encryption", desc: "End-to-end encrypted document handling complying with UK GDPR & AML standards." },
  { icon: FileCheck, title: "Fast-Track Turnaround", desc: "Digital verification reviewed and processed rapidly for immediate filing readiness." },
  { icon: Globe2, title: "180+ Countries Accepted", desc: "Non-resident passports, national identity cards, and foreign utility statements supported." },
  { icon: ShieldCheck, title: "Companies House Compliant", desc: "Fully aligned with Economic Crime and Corporate Transparency Act (ECCTA 2023) standards." },
  { icon: UserCheck, title: "Dedicated Support", desc: "Expert compliance guidance to resolve photo quality or address mismatches without delay." },
  { icon: Award, title: "100% Acceptance Guarantee", desc: "Full refund or re-submission guarantee if your documentation cannot be verified." },
];

const requiredDocs = [
  {
    step: "01",
    title: "Government-Issued Photo ID",
    desc: "Valid international passport, national biometric ID card, or UK driving licence.",
  },
  {
    step: "02",
    title: "Live Biometric Selfie",
    desc: "Real-time liveness selfie to prevent fraud and prove document ownership.",
  },
  {
    step: "03",
    title: "Proof of Residential Address",
    desc: "Bank statement, utility bill, or tax document dated within the last 3 months.",
  },
  {
    step: "04",
    title: "Officer & Company Details",
    desc: "Company registration number (CRN), registered name, and contact details.",
  },
];

const complianceRisks = [
  {
    title: "Filing Rejections",
    detail: "Companies House rejects Confirmation Statements (CS01), director appointments (AP01), and updates if officers are unverified."
  },
  {
    title: "Criminal Offence & Fines",
    detail: "Acting as a director without verification is a statutory offence carrying civil penalties and daily default fines under ECCTA 2023."
  },
  {
    title: "Bank & Payment Account Freezes",
    detail: "UK and international business bank accounts (Wise, Stripe, Tide, Payoneer) flag and freeze non-compliant corporate records."
  },
  {
    title: "Compulsory Strike-Off",
    detail: "Persistent non-compliance leads to formal gazette notices and involuntary company dissolution by the Registrar of Companies."
  },
];

const faqItems = [
  {
    q: "What is Companies House ID verification and why is it mandatory?",
    a: "Under the UK Economic Crime and Corporate Transparency Act 2023 (ECCTA), all new and existing company directors and Persons with Significant Control (PSCs) must verify their identity. This reform stops fraudulent appointments, closes shell companies, and improves the integrity of the UK corporate register."
  },
  {
    q: "Can non-UK resident directors complete this verification?",
    a: "Yes. DigiFormation provides global verification for non-UK resident directors and PSCs across 180+ countries. We accept valid national passports and foreign utility bills or bank statements translated into English, allowing non-residents to stay fully compliant without travelling to the UK."
  },
  {
    q: "What documents do I need to prepare?",
    a: "You will need: (1) A clear photo or scan of your valid international passport or national ID card, (2) A live selfie for facial biometric matching, (3) A residential proof of address (utility bill or bank statement issued within the last 90 days), and (4) Your active email address and company details."
  },
  {
    q: "How long does the verification process take?",
    a: "Once you submit your documents through our secure portal, our verification specialists and automated AML checks process your identity within 2 to 24 hours during standard business days. Expedited priority processing is available."
  },
  {
    q: "What is the fee for Companies House ID Verification with DigiFormation?",
    a: "DigiFormation offers complete identity verification for a flat, one-time fee of £20 per officer. There are no hidden subscription costs, and your verification confirmation can be used for ongoing statutory filings."
  },
  {
    q: "What happens if my verification fails or documents are rejected?",
    a: "If an image is blurred or your proof of address is expired, our compliance team will notify you immediately with exact instructions on how to re-upload. If we are unable to process your verification, you are protected by our 100% money-back guarantee."
  }
];

const IdVerificationPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useSeo({
    title: "Companies House ID Verification UK 2026 | Director & PSC Check — £20",
    description: "Official UK Companies House Identity Verification service under ECCTA 2023. Fast digital verification for UK & non-resident directors, PSCs, and officers for £20.",
    keywords: "Companies House ID verification, UK LTD ID verification, director verification UK, PSC identity check, ECCTA 2023 identity verification, non resident director ID check, authorised corporate service provider ACSP, Companies House identity check online",
    type: "website",
    path: "/id-verification",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "ID Verification", path: "/id-verification" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": "https://www.digiformation.co.uk/id-verification#service",
          name: "Companies House ID Verification Service",
          serviceType: "Corporate Identity Verification under ECCTA 2023",
          provider: {
            "@type": "Organization",
            name: "Digiformation Ltd",
            url: "https://www.digiformation.co.uk",
            logo: "https://www.digiformation.co.uk/digiformation-logo-official.webp",
          },
          areaServed: {
            "@type": "AdministrativeArea",
            name: "Worldwide",
          },
          description: "Mandatory UK Companies House identity verification for UK and non-resident directors, PSCs, shareholders, and company officers.",
          offers: {
            "@type": "Offer",
            price: "20.00",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            url: "https://www.digiformation.co.uk/uk-services/ltd-id-verification/checkout",
          },
        },
        {
          "@type": "HowTo",
          name: "How to Complete Companies House ID Verification for a UK Company",
          description: "Four simple steps for UK and international directors to complete identity verification under the Economic Crime and Corporate Transparency Act.",
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Submit Order & Personal Information",
              text: "Initiate your verification online with your full legal name, date of birth, residential address, and company registration number.",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Upload Identity Document & Proof of Address",
              text: "Upload high-resolution scans of your international passport or national ID card alongside a recent bank statement or utility bill.",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Biometric Liveness Check",
              text: "Perform a quick 10-second facial biometric selfie to verify document ownership against identity records.",
            },
            {
              "@type": "HowToStep",
              position: 4,
              name: "Receive Verification Confirmation for Filing",
              text: "Obtain your compliance-ready verification confirmation to ensure smooth filings with Companies House without delays.",
            },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
      ],
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero pt-8 pb-16 md:pt-14 md:pb-24">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-primary/15 blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ECCTA 2023 Mandate · Companies House Compliant</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
              UK Companies House <br />
              <span className="text-gradient">ID Verification</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Mandatory digital identity check for all UK and non-resident company directors, PSCs, and officers. 
              Keep your company in full compliance with UK regulations in minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Button asChild variant="hero" size="lg" className="rounded-full shadow-lg shadow-primary/20 text-base py-6 px-8">
                <Link to="/uk-services/ltd-id-verification/checkout">
                  Start Verification — £20 <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>One-time fee · Non-UK residents accepted · 24h turnaround</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border/50">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold text-foreground">180+</span>
                <span className="text-xs text-muted-foreground mt-1">Countries Supported</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold text-primary">£20</span>
                <span className="text-xs text-muted-foreground mt-1">Flat One-Time Fee</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold text-foreground">2-24h</span>
                <span className="text-xs text-muted-foreground mt-1">Turnaround Time</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold text-foreground">100%</span>
                <span className="text-xs text-muted-foreground mt-1">Compliance Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO / Generative Engine Direct Answer Callout */}
      <section className="py-8 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="glass rounded-2xl p-6 md:p-8 border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Verification Overview · Answer Engine Summary</span>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-foreground">
              <strong>What is Companies House ID Verification?</strong> Under the <em>Economic Crime and Corporate Transparency Act 2023 (ECCTA)</em>, every director and Person with Significant Control (PSC) of a UK Limited Company must verify their identity. DigiFormation enables both UK and non-UK residents to fulfill this requirement remotely for <strong>£20</strong> using biometric liveness matching, valid international passports, and address proof without requiring physical UK attendance.
            </p>
          </div>
        </div>
      </section>

      {/* Who Needs ID Verification */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Statutory Coverage</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Who is <span className="text-gradient">Legally Required</span> to Verify?
            </h2>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              Companies House regulations apply to all individuals exercising significant control or governance over a UK corporate entity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {requiredRoles.map((item) => (
              <div key={item.role} className="glass glass-tint-cyan rounded-2xl p-6 sm:p-8 border border-border/60 hover:border-primary/40 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.role}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-16 bg-muted/20 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Document Checklist</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Required Documents for <span className="text-gradient">Instant Approval</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base">
              Ensure you have these four simple items prepared before starting your submission.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {requiredDocs.map((doc) => (
              <div key={doc.step} className="glass rounded-2xl p-6 flex flex-col justify-between border border-border/60">
                <div>
                  <span className="text-3xl font-extrabold text-primary/40 mb-3 block">{doc.step}</span>
                  <h3 className="font-bold text-lg text-foreground mb-2">{doc.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{doc.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-1.5 text-xs text-primary font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready to upload</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5 max-w-3xl mx-auto">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed">
              <strong>Tip for Foreign Officers:</strong> Non-English proof of address documents (e.g. Arabic, Urdu, French, German, Spanish) should ideally include certified translations or bilingual bank headers for the fastest clearance.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose DigiFormation Features Grid */}
      <section className="py-16 md:py-20 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Service Guarantee</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Why Choose <span className="text-gradient">DigiFormation</span>?
            </h2>
            <p className="text-muted-foreground mt-4 text-base">
              Trusted by international entrepreneurs, non-resident founders, and UK corporate officers worldwide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceHighlights.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="glass rounded-2xl p-6 border border-border/60 hover:border-primary/40 transition">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Risks of Non-Compliance */}
      <section className="py-16 bg-destructive/5 border-t border-destructive/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-destructive mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Strict Enforcement Under ECCTA 2023</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              What Happens Without ID Verification?
            </h2>
            <p className="text-muted-foreground mt-4 text-base">
              The Registrar of Companies and HMRC have introduced strict automated blocks for unverified company personnel.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {complianceRisks.map((risk) => (
              <div key={risk.title} className="glass rounded-2xl p-6 border border-destructive/25 bg-background/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{risk.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-11">{risk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Steps How It Works */}
      <section className="py-16 md:py-20 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Seamless Workflow</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Complete Your Verification in <span className="text-gradient">4 Easy Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Submit Order", text: "Choose the service and complete our secure £20 checkout." },
              { num: "2", title: "Upload Documents", text: "Securely upload your photo ID and recent residential proof of address." },
              { num: "3", title: "Biometric Selfie", text: "Complete our quick automated liveness verification on your phone or PC." },
              { num: "4", title: "Get Verified", text: "Receive full verification clearance ready for official Companies House filings." },
            ].map((s) => (
              <div key={s.num} className="glass rounded-2xl p-6 border border-border/60 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-brand text-foreground font-bold flex items-center justify-center text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="hero" size="lg" className="rounded-full shadow-lg shadow-primary/20 text-base py-6 px-8">
              <Link to="/uk-services/ltd-id-verification/checkout">
                Begin Verification Now — £20 <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-muted/20 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Frequently Asked Questions</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Everything You Need to Know
            </h2>
            <p className="text-muted-foreground mt-4 text-base">
              Clear answers to the most common questions about Companies House ID verification in 2026.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={item.q} className="glass rounded-xl border border-border/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-foreground hover:text-primary transition"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-base sm:text-lg">{item.q}</span>
                  <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-4 h-4 text-primary" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Conversion CTA Banner */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="glass glass-tint-cyan rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto border border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-3 block">
              Fast · Secure · Guaranteed
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
              Verify your identity <span className="text-gradient">today</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Do not risk statutory penalties or blocked company filings. Secure your official Companies House identity check for just £20.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="hero" size="lg" className="rounded-full shadow-xl shadow-primary/25 text-base py-6 px-10">
                <Link to="/uk-services/ltd-id-verification/checkout">
                  Start Verification — £20 <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Accepted worldwide · 100% money-back guarantee if non-verifiable
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default IdVerificationPage;
