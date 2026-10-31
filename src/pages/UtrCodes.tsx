import { useEffect, useState } from "react";
import { useSeo } from "@/lib/seo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, KeyRound, Power, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/card-hero-tax.webp";
import { checkoutLinkForSlug } from "@/data/serviceCatalog";

const rotatingCtas = [
  "Get Help Finding Your UTR",
  "Discuss a Missing Tax Reference",
  "Understand Your Company Codes",
  "Ask About HMRC Online Access",
  "Request Code Support",
];

type Card = {
  id: string;
  icon: typeof FileText;
  eyebrow: string;
  title: string;
  intro: string;
  what: string[];
  why?: string[];
  did?: string[];
  ctas: string[];
  source: { label: string; url: string };
};

const cards: Card[] = [
  {
    id: "utr",
    icon: FileText,
    eyebrow: "Card 01",
    title: "What is UTR?",
    intro: "A UTR (Unique Taxpayer Reference) is a 10-digit number issued by HMRC.",
    what: [
      "Identify the company for Corporation Tax correspondence",
      "Add Corporation Tax services to the business tax account",
      "Use the company reference on the relevant tax return",
      "Keep the company UTR separate from a director's personal UTR",
    ],
    did: [
      "Check existing HMRC correspondence for the reference",
      "Check that the company's registered address is correct",
      "Use HMRC's official company UTR request route if needed",
    ],
    ctas: ["Ask About Finding Your UTR", "Discuss a Missing UTR"],
    source: { label: "HMRC: find your UTR", url: "https://www.gov.uk/find-utr-number" },
  },
  {
    id: "auth-code",
    icon: KeyRound,
    eyebrow: "Card 02",
    title: "Companies House Authentication Code",
    intro: "Companies House issues this six-character company code for authorised online filings. It is separate from HMRC sign-in details and an individual's Companies House personal code.",
    what: [
      "Authorise company information filed online at Companies House",
      "Use with supported Companies House filing software",
      "Treat it with the care of a company officer's signature",
      "Request or replace it through the official Companies House process",
    ],
    ctas: ["Ask About Company Filing Access", "Discuss a Missing Company Code"],
    source: { label: "Companies House: authentication codes", url: "https://www.gov.uk/guidance/company-authentication-codes-for-online-filing" },
  },
  {
    id: "activation-code",
    icon: Power,
    eyebrow: "Card 03",
    title: "HMRC Corporation Tax Activation Code",
    intro: "HMRC may send an activation code when you enrol for Corporation Tax online services. This activates that tax service, rather than the company's legal existence.",
    what: [
      "Complete enrolment in the Corporation Tax online service where required",
      "Follow the instructions HMRC sends with the code",
      "Request a replacement through HMRC if it is missing or expired",
      "Keep other tax-service enrolments separate where applicable",
    ],
    why: [
      "Check whether Corporation Tax services are already linked to the account",
      "Check the registered address used for HMRC correspondence",
      "Follow HMRC's missing or expired activation-code process",
    ],
    ctas: ["Ask About Corporation Tax Access", "Discuss an Activation Code"],
    source: { label: "HMRC: add Corporation Tax services", url: "https://www.gov.uk/limited-company-formation/add-corporation-tax-services-to-business-tax-account" },
  },
];

const RotatingCta = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % rotatingCtas.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <Button asChild variant="hero" size="lg" className="rounded-full">
      <Link to={checkoutLinkForSlug("utr-number")}>
        <span key={i} className="inline-block animate-fade-in">{rotatingCtas[i]}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
  );
};

const UtrCodes = () => {
  useSeo({
    title: "UTR & Company Authentication Code Help | DigiFormation",
    description: "Understand your company UTR, Companies House authentication code and HMRC Corporation Tax activation code. Explore official request routes and support options.",
    type: "website",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "UK Services", path: "/uk-services" },
      { name: "UTR & Auth Codes", path: "/uk-services/utr-codes" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "UTR, HMRC & Companies House Code Services",
      provider: { "@type": "Organization", name: "Digiformation Ltd" },
      areaServed: "United Kingdom",
      description: "Guidance and support with company UTR requests, Companies House authentication codes and HMRC Corporation Tax online access.",
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 py-12 md:py-14 relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">HMRC · UK Tax Compliance</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight">
                UTR, Auth Code & <em className="not-italic text-gradient">Activation Code</em>
              </h1>
              <p className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl opacity-90">
                These references have different purposes. Find the right official request process and discuss support for your company's circumstances; receiving a code does not establish full tax or filing compliance.
              </p>
              <div className="mt-10"><RotatingCta /></div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden glass shadow-elegant aspect-[4/3]">
                <img src={heroImg} alt="UK UTR number & HMRC tax compliance for non-resident UK Limited Company directors" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-10 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.id} id={c.id} className="glass glass-tint-mustard rounded-3xl p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">{c.eyebrow}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{c.title}</h2>
                  <p className="text-sm opacity-90 mb-5">{c.intro}</p>

                  <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-3">Purpose and next steps</div>
                  <ul className="space-y-2 mb-6">
                    {c.what.map((w) => (
                      <li key={w} className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span className="opacity-90">{w}</span>
                      </li>
                    ))}
                  </ul>

                  {c.did && (
                    <>
                      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-3">If you cannot find it</div>
                      <ul className="space-y-2 mb-6">
                        {c.did.map((d) => (
                          <li key={d} className="flex gap-3 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                            <span className="opacity-90">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {c.why && (
                    <>
                      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-3">Checks before requesting help</div>
                      <ul className="space-y-2 mb-6">
                        {c.why.map((d) => (
                          <li key={d} className="flex gap-3 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                            <span className="opacity-90">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <a href={c.source.url} className="text-sm underline underline-offset-4 mb-6" target="_blank" rel="noopener noreferrer">{c.source.label}</a>
                  <div className="mt-auto space-y-2">
                    {c.ctas.map((cta) => (
                      <Button key={cta} asChild variant="ghostGlow" className="rounded-full w-full">
                        <Link to={checkoutLinkForSlug(c.id === "utr" ? "utr-number" : c.id)}>{cta} <ArrowRight className="w-4 h-4" /></Link>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-10 bg-muted/20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold">What We Do For You</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
            Understand the process and <em className="not-italic text-gradient">request appropriate support</em>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Identify the reference or filing access you need",
              "Find the relevant official request route",
              "Check existing company correspondence",
              "Discuss assistance with a missing reference",
              "Review authorisation before acting for your company",
              "Understand which next steps remain your responsibility",
            ].map((s) => (
              <div key={s} className="flex items-start gap-3 glass glass-tint-mustard rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary" />
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm opacity-85">Keep personal passwords and sign-in one-time codes private. Share a company authentication code only with someone authorised to file for your company. Official guidance checked 25 October 2026; delivery and service access depend on the relevant authority.</p>
          <div className="mt-10"><RotatingCta /></div>
        </div>
      </section>
    </Layout>
  );
};

export default UtrCodes;
