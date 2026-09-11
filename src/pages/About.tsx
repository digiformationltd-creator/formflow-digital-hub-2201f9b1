import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useSeo } from "@/lib/seo";
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  Code2,
  Cpu,
  Boxes,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Scale,
  Workflow,
  Laptop,
  CreditCard,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import founderImg from "@/assets/founder-haroon.jpg";

const COMPANIES_HOUSE_OFFICER_URL =
  "https://find-and-update.company-information.service.gov.uk/officers/iIzC9R8zKXH6lyWTWCDaT3_gK4E/appointments";
const COMPANIES_HOUSE_CO_URL =
  "https://find-and-update.company-information.service.gov.uk/company/16994903";

const pillars = [
  {
    icon: Building2,
    title: "UK Limited Company Formation",
    href: "/uk-services/uk-ltd-formation",
    desc: "Direct Companies House e-filing for UK residents and international non-residents with registered office, director privacy, and UTR issuance.",
  },
  {
    icon: ShieldCheck,
    title: "US LLC Formation & Compliance",
    href: "/usa-services/us-llc-formation",
    desc: "State filing across Wyoming, Delaware, New Mexico & Florida, IRS EIN obtaining, and mandatory FinCEN BOI compliance reporting.",
  },
  {
    icon: CreditCard,
    title: "Global Banking & Payment Gateways",
    href: "/banks-payment-solutions",
    desc: "Guaranteed business banking application support across 16+ verified institutions including Stripe, PayPal, Wise, Payoneer, Tide, and Airwallex.",
  },
  {
    icon: Code2,
    title: "Custom Enterprise Software & CRM/ERP",
    href: "/software-development",
    desc: "Bespoke full-stack web applications, scalable client portals, customized CRM systems, and integrated operational ERP platforms.",
  },
  {
    icon: Cpu,
    title: "Autonomous AI Agents & WhatsApp Automation",
    href: "/ai-agents",
    desc: "Enterprise multi-agent architectures and £10 starter WhatsApp AI business agents integrated with official Meta Cloud APIs.",
  },
  {
    icon: Boxes,
    title: "Digi Biz OS (Proprietary AI Business Software)",
    href: "https://digibizos.co.uk/",
    external: true,
    desc: "DigiFormation Ltd's flagship AI-powered Business Operating System unifying CRM, financial invoicing, and autonomous workflows in one platform.",
  },
  {
    icon: Laptop,
    title: "High-Performance Web Development",
    href: "/web-development",
    desc: "Modern React and headless CMS website development with transparent tiered pricing (£30 Basic to £180 Advanced e-commerce).",
  },
  {
    icon: Layers,
    title: "3D, WebGL & Interactive Web",
    href: "/3d-interactive-animated-web",
    desc: "Hardware-accelerated Three.js 3D product configurators, scroll-driven interactive experiences, and accessible canvas rendering.",
  },
];

const stats = [
  { value: "16994903", label: "Companies House Registered Company No.", sub: "England & Wales Jurisdiction" },
  { value: "71+", label: "UK Companies Under Founder Directorship", sub: "Publicly Verified on Companies House" },
  { value: "8+", label: "Years of Industry Experience", sub: "Corporate Law, Banking & Engineering" },
  { value: "300+", label: "Entrepreneurs & Businesses Launched", sub: "Across 60+ Global Jurisdictions" },
];

export const About = () => {
  useSeo({
    title: "About DigiFormation Ltd — Corporate Entity, Founder & Technology Ecosystem",
    description:
      "Learn about Digiformation Ltd (Company No. 16994903), founded by Muhammad Haroon. Global corporate formation, business banking, bespoke software development, AI agents, and Digi Biz OS.",
    keywords:
      "About DigiFormation Ltd, Muhammad Haroon founder, Digiformation company registration 16994903, UK company formation provider, Digi Biz OS developer, AI software company UK",
    path: "/about",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "AboutPage",
          "@id": "https://www.digiformation.co.uk/about#webpage",
          "url": "https://www.digiformation.co.uk/about",
          "name": "About DigiFormation Ltd",
          "isPartOf": { "@id": "https://www.digiformation.co.uk/#website" },
          "about": { "@id": "https://www.digiformation.co.uk/#organization" },
          "description":
            "Official corporate identity, founder background, and technology engineering ecosystem of Digiformation Ltd.",
        },
        {
          "@type": "Organization",
          "@id": "https://www.digiformation.co.uk/#organization",
          "name": "Digiformation Ltd",
          "legalName": "Digiformation Ltd",
          "identifier": "16994903",
          "url": "https://www.digiformation.co.uk/",
          "foundingDate": "2022",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Office 1006, 85 Dunstall Hill",
            "addressLocality": "Wolverhampton",
            "postalCode": "WV6 0SR",
            "addressCountry": "GB",
          },
          "founder": {
            "@type": "Person",
            "@id": "https://www.digiformation.co.uk/#founder",
            "name": "Muhammad Haroon",
            "jobTitle": "Founder & Technical Director",
            "sameAs": [
              "https://www.linkedin.com/in/muhammad-haroon-9a9945366",
              COMPANIES_HOUSE_OFFICER_URL,
            ],
          },
          "owns": {
            "@type": "SoftwareApplication",
            "@id": "https://digibizos.co.uk/#product",
            "name": "Digi Biz OS",
            "applicationCategory": "BusinessApplication",
            "url": "https://digibizos.co.uk/",
          },
        },
      ],
    },
  });

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-hero pt-12 pb-16 md:pt-16 md:pb-24 border-b border-border/60">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
              <Building2 className="w-3.5 h-3.5" /> Corporate Entity &amp; Technology Ecosystem
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              Empowering Global Enterprise Through{" "}
              <em className="not-italic text-gradient">Corporate Formation &amp; Intelligent Software</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Digiformation Ltd is a registered UK corporate provider and technology engineering firm. We bridge
              cross-border company formation, international financial infrastructure, and custom AI software into a
              unified platform for founders worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Corporate Credentials & Stats */}
      <section className="py-12 bg-secondary/10 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 border border-border/60">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-1 font-mono">{s.value}</div>
                <div className="text-sm font-semibold text-foreground mb-1">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder & Corporate Governance Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[auto,1fr] gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Founder Portrait & Verification Badge */}
            <div className="flex flex-col items-center lg:items-start mx-auto">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl glass overflow-hidden shadow-elegant border border-primary/20">
                <img
                  src={founderImg}
                  alt="Muhammad Haroon — Founder & Director of Digiformation Ltd"
                  className="w-full h-full object-cover object-top"
                  width={320}
                  height={320}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
              </div>
              <a
                href={COMPANIES_HOUSE_OFFICER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-primary/30 text-xs font-medium hover:bg-primary/10 transition"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Companies House: 71 Directorships</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>

            {/* Narrative Context */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                <Award className="w-4 h-4" /> Leadership &amp; Governance
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Founded &amp; Directed by <span className="text-gradient">Muhammad Haroon</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Muhammad Haroon is an experienced UK company director, compliance advisor, and technical architect.
                Holding directorships across <strong>71+ active UK companies</strong> verified on Companies House,
                Muhammad founded Digiformation Ltd to eliminate the opacity, delays, and barriers international
                entrepreneurs encounter when launching global businesses.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Under his leadership, DigiFormation has expanded from direct Companies House and US State formations
                to engineering proprietary corporate software—culminating in the development of{" "}
                <strong>Digi Biz OS</strong>, an autonomous AI-driven business management ecosystem.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl glass border border-border/60">
                  <div className="font-semibold text-sm mb-1 text-foreground">Verified UK Entity</div>
                  <div className="text-xs text-muted-foreground">
                    Digiformation Ltd (No. 16994903) is incorporated under the Companies Act 2006 in England and Wales.
                  </div>
                </div>
                <div className="p-4 rounded-xl glass border border-border/60">
                  <div className="font-semibold text-sm mb-1 text-foreground">Registered Office</div>
                  <div className="text-xs text-muted-foreground">
                    Office 1006, 85 Dunstall Hill, Wolverhampton, WV6 0SR, United Kingdom.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entity Relationship: DigiFormation Ltd vs Digi Biz OS */}
      <section className="py-16 bg-secondary/15 border-y border-border/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/30 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              <Boxes className="w-3.5 h-3.5" /> Entity Architecture &amp; Product Hierarchy
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Understanding Our Corporate &amp; Product Structure
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              We maintain clear, distinct boundaries between our professional service agency and our proprietary software applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-8 border border-primary/30 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
                <Building2 className="w-3.5 h-3.5" /> Corporate Entity &amp; Agency
              </div>
              <h3 className="text-2xl font-bold mb-3">DigiFormation Ltd</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The parent company and operating service provider responsible for legal company formations (UK LTD, USA LLC), corporate compliance, payment gateway consulting, bespoke software engineering, and AI agent integration.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Provides hands-on formation, banking, and custom development services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Operates at digiformation.co.uk as the primary service hub</span>
                </li>
              </ul>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/contact">Consult With Our Team <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>

            <div className="glass rounded-3xl p-8 border border-accent/30 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-4">
                <Boxes className="w-3.5 h-3.5" /> Proprietary Software Product
              </div>
              <h3 className="text-2xl font-bold mb-3">Digi Biz OS</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The standalone AI Business Operating System designed, engineered, and maintained by DigiFormation Ltd. It provides autonomous AI assistants, multi-entity CRM, invoicing, project management, and automated workflow pipelines.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>Autonomous SaaS platform for day-to-day business operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>Dedicated standalone product ecosystem at digibizos.co.uk</span>
                </li>
              </ul>
              <Button asChild variant="hero" size="sm" className="rounded-full">
                <a href="https://digibizos.co.uk/" target="_blank" rel="noopener noreferrer">
                  Explore Digi Biz OS <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The 8 Core Business Pillars */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              <Workflow className="w-4 h-4" /> Full-Service Capabilities
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Our 8 Core <span className="text-gradient">Operational Pillars</span>
            </h2>
            <p className="text-muted-foreground">
              Every solution DigiFormation offers is structured with end-to-end execution, verified compliance, and production-grade engineering.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="glass rounded-2xl p-6 flex flex-col justify-between border border-border/60 hover:border-primary/40 transition group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center mb-4 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-base mb-2 text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{p.desc}</p>
                  </div>
                  <div>
                    {p.external ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        Visit Product <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link to={p.href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                        Explore Pillar <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Public Trust, Statutory Compliance & Contact CTA */}
      <section className="py-16 bg-gradient-hero border-t border-border/60">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Scale className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transparent, Compliant &amp; Internationally Trusted
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Digiformation Ltd is registered in England &amp; Wales under Company No. 16994903. All statutory filings,
            address services, and software integrations adhere strictly to UK HMRC, Companies House, US IRS, and FinCEN regulations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="hero" size="lg" className="rounded-full">
              <Link to="/contact">Start Your Business Today <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <a
              href={COMPANIES_HOUSE_CO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-primary/30 text-sm font-semibold hover:bg-primary/10 transition"
            >
              Verify on Companies House <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
