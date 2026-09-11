import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ExternalLink,
  Bot,
  Brain,
  Cpu,
  Database,
  Layers,
  MessageSquare,
  Mic,
  ShieldCheck,
  Sparkles,
  Workflow,
  CheckCircle2,
  ChevronDown,
  Monitor,
  Code2,
  Building2,
  ChevronRight,
} from "lucide-react";

// Real Digi Biz OS authentic screenshots & logo
import logoClean from "@/assets/digibizos/logo-clean-B3ZQbUGe.png";
import osDashboard from "@/assets/digibizos/os-main-dashboard-BoY8H15Q.png";
import osCrm from "@/assets/digibizos/os-digi-crm-dashboard-sYLfgAHv.png";
import osAgentSearch from "@/assets/digibizos/os-active-agent-search-CfiLwplo.png";
import osWhatsapp from "@/assets/digibizos/os-digi-crm-whatsapp-CICbIdfA.png";
import osStudio from "@/assets/digibizos/os-digi-studio-video-editor-CuL-TZSF.png";
import osCode from "@/assets/digibizos/os-digi-code-CbVWFLnn.png";
import osSkills from "@/assets/digibizos/os-skills-BTs8QIiL.png";

const DIGI_BIZ_OS_URL = "https://digibizos.co.uk/";
const WHATSAPP_CONTACT_URL = "https://wa.me/923164467464?text=Hi%20DigiFormation%2C%20I%20am%20interested%20in%20Software%20Development%20%2F%20Custom%20AI%20Agents.";

const setMeta = (title: string, description: string, keywords?: string) => {
  document.title = title;
  const setName = (n: string, c: string) => {
    let el = document.querySelector(`meta[name="${n}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", n);
      document.head.appendChild(el);
    }
    el.setAttribute("content", c);
  };
  const setProp = (p: string, c: string) => {
    let el = document.querySelector(`meta[property="${p}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", p);
      document.head.appendChild(el);
    }
    el.setAttribute("content", c);
  };
  setName("description", description);
  if (keywords) setName("keywords", keywords);
  setName("robots", "index, follow, max-snippet:-1, max-image-preview:large");
  setProp("og:title", title);
  setProp("og:description", description);
  setProp("og:type", "website");
  setProp("og:url", window.location.href);
  setName("twitter:card", "summary_large_image");
  setName("twitter:title", title);
  setName("twitter:description", description);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", "https://digiformation.co.uk/software-development");
};

const injectJsonLd = (id: string, schema: object) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schema);
  return () => {
    script?.remove();
  };
};

export default function SoftwareDevelopment() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setMeta(
      "Software Development & AI Agents | Digi Biz OS Creator — DigiFormation Ltd",
      "Custom business software, autonomous AI agents, CRM & ERP systems, and workflow automation by DigiFormation Ltd. Explore our flagship AI desktop operating system, Digi Biz OS.",
      "software development, custom software development, AI software development, AI agent development, AI agents, agentic software, business automation, CRM development, ERP development, Digi Biz OS, AI business assistant, WhatsApp AI agent, custom AI agents, business management software, Jarvis AI, voice AI assistant"
    );

    const cleanupFaq = injectJsonLd("software-faq-jsonld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });

    const cleanupService = injectJsonLd("software-service-jsonld", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Software Development & AI Agent Engineering",
      provider: {
        "@type": "Organization",
        name: "Digiformation Ltd",
        url: "https://digiformation.co.uk",
      },
      serviceType: "Software Development, AI Agents & Business Automation",
      areaServed: ["GB", "US", "CA", "AU", "EU", "Worldwide"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Software & AI Solutions",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Digi Biz OS (Desktop AI Business Operating System)",
            url: "https://digibizos.co.uk/",
          },
          {
            "@type": "Offer",
            name: "Custom WhatsApp AI Agent",
            price: "10",
            priceCurrency: "GBP",
          },
          {
            "@type": "Offer",
            name: "Custom CRM / ERP & Business Software Development",
            price: "Custom Quote",
          },
        ],
      },
    });

    return () => {
      cleanupFaq();
      cleanupService();
    };
  }, []);

  const showcaseSlides = [
    {
      id: "os-dashboard",
      title: "Universal AI Business OS",
      tag: "Main Dashboard",
      desc: "Live system dashboard with real-time AI reasoning, multi-module status, and universal voice control across all operations.",
      image: osDashboard,
    },
    {
      id: "os-crm",
      title: "DIGI CRM & Pipeline Intelligence",
      tag: "CRM & Contacts",
      desc: "Customer lifecycle intelligence, active deal pipelines, company accounts, and long-term business memory.",
      image: osCrm,
    },
    {
      id: "os-agent-search",
      title: "Autonomous Multi-Agent Platform",
      tag: "Agentic AI",
      desc: "Specialized autonomous agents collaborating concurrently for research, execution, data verification, and task handling.",
      image: osAgentSearch,
    },
    {
      id: "os-whatsapp",
      title: "WhatsApp Automated CRM",
      tag: "Messaging CRM",
      desc: "Integrated WhatsApp business communication, contact threads, automated message flows, and client conversation history.",
      image: osWhatsapp,
    },
    {
      id: "os-studio",
      title: "Digi Studio Creative AI Suite",
      tag: "Media & Studio",
      desc: "AI video generation, voice synthesis, avatar presentation, transcript extraction, and media processing directly on desktop.",
      image: osStudio,
    },
    {
      id: "os-code",
      title: "Digi Code Studio & Developer Hub",
      tag: "Developer Suite",
      desc: "Built-in developer workstation with code generation, terminal controls, Git synchronization, and tool scripting.",
      image: osCode,
    },
    {
      id: "os-skills",
      title: "Skills & Universal MCP Tools",
      tag: "Tools & MCP",
      desc: "Extensible Model Context Protocol (MCP) toolchain connecting local neural models, screen inspection, cameras, and system tools.",
      image: osSkills,
    },
  ];

  return (
    <Layout>
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/60">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            <div className="max-w-3xl">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-cyan-500/30 mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan-300 font-semibold">
                  DigiFormation Software & AI Division
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight text-white">
                Software Development & <span className="text-gradient">AI Agents</span> for Modern Businesses
              </h1>

              <p className="mt-6 text-base sm:text-lg opacity-90 leading-relaxed text-white/90">
                DigiFormation engineers bespoke business software, autonomous AI agents, CRM/ERP platforms, and intelligent automation systems. We are also the creator of <strong className="text-cyan-300 font-semibold">Digi Biz OS</strong> — our flagship AI-powered desktop Business Operating System.
              </p>

              {/* Dual Primary CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={DIGI_BIZ_OS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-display text-sm font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-slate-950 shadow-[0_0_24px_rgba(47,224,200,0.35)] hover:shadow-[0_0_32px_rgba(47,224,200,0.5)] hover:scale-[1.02] transition-all"
                >
                  <img src={logoClean} alt="Digi Biz OS Logo" className="w-5 h-5 rounded-full object-cover" />
                  Get Digi Biz OS <ExternalLink className="w-4 h-4" />
                </a>

                <Button asChild variant="outline" size="lg" className="rounded-full glass border-white/20 hover:bg-white/10 text-white">
                  <a href="#custom-software">
                    Build Custom Software <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>

              {/* Key capabilities tag strip */}
              <div className="mt-10 pt-6 border-t border-border/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Custom CRM & ERP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Custom AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Business Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Digi Biz OS Creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>WhatsApp AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Universal MCP & Voice</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Preview */}
            <div className="relative">
              <div className="relative rounded-3xl p-3 glass border border-cyan-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] group">
                  <img
                    src={osDashboard}
                    alt="Digi Biz OS Main AI Desktop Dashboard developed by DigiFormation"
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 p-3 rounded-xl glass border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-white">DIGI BIZ OS Windows 10 & 11</div>
                        <div className="text-[10px] text-white/70">Autonomous AI Operating System</div>
                      </div>
                    </div>
                    <a
                      href={DIGI_BIZ_OS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 transition flex items-center gap-1 shrink-0"
                    >
                      Visit Product <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DIGI BIZ OS FEATURED PRODUCT SHOWCASE */}
      <section className="py-16 md:py-24 border-b border-border/60 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-cyan-500/20 text-xs font-mono uppercase text-cyan-300 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Featured Flagship Product
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Meet <span className="text-gradient">Digi Biz OS</span>
              </h2>
              <p className="mt-3 text-base md:text-lg opacity-85 max-w-2xl text-white/90">
                An AI-powered Business Operating System designed to bring business operations, multi-agent automation, voice control, CRM, and intelligent workflows into one unified desktop environment.
              </p>
            </div>

            <a
              href={DIGI_BIZ_OS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-display text-sm font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/30 transition self-start md:self-auto"
            >
              Explore Digi Biz OS <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-2 overflow-x-auto">
            {showcaseSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSlide === idx
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_16px_rgba(47,224,200,0.4)]"
                    : "glass text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {slide.tag}
              </button>
            ))}
          </div>

          {/* Active Showcase Card */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-white/15 bg-gradient-to-b from-card/80 to-card/40">
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-[16/10] shadow-2xl">
                <img
                  src={showcaseSlides[activeSlide].image}
                  alt={`${showcaseSlides[activeSlide].title} - Digi Biz OS`}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-5">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                  {showcaseSlides[activeSlide].tag}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {showcaseSlides[activeSlide].title}
                </h3>
                <p className="text-sm md:text-base opacity-85 leading-relaxed text-white/80">
                  {showcaseSlides[activeSlide].desc}
                </p>

                <div className="pt-4 border-t border-border/40 flex flex-wrap items-center gap-4">
                  <a
                    href={DIGI_BIZ_OS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition"
                  >
                    Get Digi Biz OS (£50 Lifetime) <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-xs text-white/60">Zero monthly SaaS subscriptions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT DIGI BIZ OS CAN DO (Verified Features) */}
      <section className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Verified Platform Capabilities</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-3">
              What <span className="text-gradient">Digi Biz OS</span> Brings to Your Desktop
            </h2>
            <p className="mt-4 text-base opacity-85 text-white/80">
              Engineered with an active neural reasoning engine, universal voice assistance, and deep business workflow integrations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Universal Voice AI Control</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                JARVIS-style voice assistant embedded in every prompt box and module. Control software, trigger automations, and query data hands-free.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Agent Execution</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Specialized autonomous agents collaborating concurrently for research, execution, data verification, and task handling.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">DIGI CRM & Pipeline</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Complete contact management, active deals pipeline, company accounts, notes, and long-term customer context memory.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WhatsApp CRM Integration</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Automated WhatsApp customer threads, campaign broadcasts, and direct client conversation logging inside the OS.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-300 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Digi Studio Creative AI</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Integrated video editing, voice synthesis, avatar presentations, transcript extraction, and media rendering on desktop.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Universal MCP & Skills</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Extensible Model Context Protocol (MCP) toolchain allowing AI models to interact with local databases, cameras, and system tools.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-300 mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Desktop Workstation OS</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                Optimized for Windows 10 & 11. Run local models or cloud APIs with complete privacy and seamless local file processing.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-300 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Monthly SaaS Fees</h3>
              <p className="text-xs opacity-80 leading-relaxed text-white/80">
                One-time purchase model (£50). Own your business operating system without perpetual monthly subscription lock-ins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY DIGIFORMATION BUILT IT */}
      <section className="py-16 md:py-20 border-b border-border/60 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="glass rounded-3xl p-8 md:p-12 border border-cyan-500/30 bg-gradient-to-br from-card/90 via-card/70 to-card/50">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-10 h-10 text-cyan-300" />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">The Creator Behind The Product</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Why DigiFormation Engineered Digi Biz OS
                </h3>
                <p className="text-sm md:text-base opacity-85 leading-relaxed text-white/90">
                  As an international corporate services provider managing UK company formations, US LLCs, compliance deadlines, and thousands of client documents daily, DigiFormation needed an operating system capable of autonomous multi-agent reasoning, CRM intelligence, and instant workflow automation.
                </p>
                <p className="text-sm md:text-base opacity-85 leading-relaxed text-white/90">
                  Rather than paying fragmented monthly fees to dozens of separate SaaS vendors, we engineered <strong>Digi Biz OS</strong> — combining our real-world corporate operational experience with cutting-edge agentic software engineering. Today, we make this same operating system available to businesses worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — CUSTOM SOFTWARE DEVELOPMENT */}
      <section id="custom-software" className="py-16 md:py-24 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl mb-14">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Bespoke Engineering</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-3">
              Need Custom Software Built for <span className="text-gradient">Your Business</span>?
            </h2>
            <p className="mt-4 text-base md:text-lg opacity-85 text-white/90">
              When ready-made software doesn’t fit your exact workflow, DigiFormation designs and engineers custom business systems, CRMs, ERPs, and automation platforms tailored specifically to your company’s requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition">
              <Database className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Custom CRM Systems</h3>
              <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                Tailored customer relationship platforms with bespoke sales pipelines, automated deal tracking, WhatsApp/email triggers, and client portals.
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-center gap-1.5">• Multi-stage deal pipelines</li>
                <li className="flex items-center gap-1.5">• Automated lead capture & attribution</li>
                <li className="flex items-center gap-1.5">• Client portal & document distribution</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition">
              <Layers className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Custom ERP & Management Systems</h3>
              <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                End-to-end Enterprise Resource Planning systems for inventory, order processing, team workload, billing, and operational compliance.
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-center gap-1.5">• Centralized order & invoice generation</li>
                <li className="flex items-center gap-1.5">• Role-based permissions & admin security</li>
                <li className="flex items-center gap-1.5">• Inventory & service catalog tracking</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition">
              <Workflow className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Business Workflow Automation</h3>
              <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                Automate repetitive manual operations: instant PDF generation, automatic transactional mailers, webhook integrations, and scheduled syncs.
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-center gap-1.5">• Webhook & API data pipelines</li>
                <li className="flex items-center gap-1.5">• Automated compliance deadline alerts</li>
                <li className="flex items-center gap-1.5">• Transactional notifications (Email/WhatsApp)</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition">
              <Monitor className="w-8 h-8 text-sky-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Internal Dashboards & Platforms</h3>
              <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                High-performance administrative dashboards with real-time analytics, revenue KPI monitoring, and customer telemetry.
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-center gap-1.5">• Real-time financial & revenue analytics</li>
                <li className="flex items-center gap-1.5">• Data export & backup utilities</li>
                <li className="flex items-center gap-1.5">• Multi-tenant or single-tenant setups</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition">
              <Brain className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Business Software</h3>
              <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                Embed intelligent AI models directly into your business workflows for document parsing, intelligent search, and autonomous data extraction.
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-center gap-1.5">• Intelligent document OCR & verification</li>
                <li className="flex items-center gap-1.5">• Natural language search & data querying</li>
                <li className="flex items-center gap-1.5">• Custom fine-tuned internal assistants</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-7 border border-white/10 hover:border-white/20 transition flex flex-col justify-between">
              <div>
                <Code2 className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Modern Technology Stack</h3>
                <p className="text-sm opacity-80 leading-relaxed text-white/80 mb-4">
                  Built with enterprise-grade technologies: React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Supabase, and Deno Edge Runtimes.
                </p>
              </div>

              <Button asChild variant="hero" className="rounded-full w-full mt-4">
                <Link to="/contact?service=custom-software">
                  Discuss Your Project <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CUSTOM AI AGENTS FOR YOUR BUSINESS */}
      <section className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Agentic Engineering</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-3">
                AI Agents Built Around <span className="text-gradient">Your Business Workflow</span>
              </h2>
              <p className="mt-4 text-base opacity-85 text-white/90 leading-relaxed">
                We engineer autonomous and assistive AI agents trained on your specific business processes, catalog, and rules. Instead of static chatbots, our agents perform actions, collect requirements, and integrate directly with your existing tools.
              </p>

              {/* Real World Workflow Example */}
              <div className="mt-6 glass rounded-2xl p-6 border border-cyan-500/20 bg-card/60">
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-2">
                  Example Use Case: Custom WhatsApp Agent
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  A bespoke tailoring business or service provider can deploy a custom WhatsApp AI Agent that automatically answers pricing questions, collects customer measurements/specifications, provides service availability, logs the enquiry into a CRM, and notifies the business owner instantly.
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-white/10">
                  <Bot className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-sm font-bold text-white">WhatsApp & Chat Agents</div>
                  <div className="text-xs text-white/70 mt-1">24/7 client communication & lead capture.</div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <Mic className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-sm font-bold text-white">Voice AI Assistants</div>
                  <div className="text-xs text-white/70 mt-1">Conversational phone and desktop voice agents.</div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <div className="text-sm font-bold text-white">Support & FAQ Agents</div>
                  <div className="text-xs text-white/70 mt-1">Instant issue resolution & ticket creation.</div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <Workflow className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-sm font-bold text-white">Internal Operations Agents</div>
                  <div className="text-xs text-white/70 mt-1">Data extraction, email drafting & reporting.</div>
                </div>
              </div>
            </div>

            {/* SECTION 7 — SMALL ENTRY PACKAGE: CUSTOM WHATSAPP AI AGENT (£10) */}
            <div className="relative">
              <div className="glass rounded-3xl p-8 border-2 border-cyan-400/50 bg-gradient-to-b from-cyan-500/15 via-card to-card shadow-[0_0_40px_rgba(47,224,200,0.15)] relative">
                <div className="inline-block px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider mb-4">
                  Entry-Level Custom Agent Offer
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Custom WhatsApp AI Agent
                </h3>
                <p className="text-xs text-white/70 mb-4">
                  Get a custom WhatsApp AI Agent designed around your business workflow.
                </p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xs uppercase tracking-widest text-white/60">Starting from</span>
                  <span className="text-4xl sm:text-5xl font-bold text-cyan-300">£10</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-white/90">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Configured for your business service & common FAQs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Automated customer greetings & enquiry detail collection</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Custom system prompt & brand tone alignment</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Setup guidance & deployment walk-through</span>
                  </li>
                </ul>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 mb-6 leading-relaxed">
                  * Note: Entry package includes standard FAQ & workflow prompt setup. Advanced API integrations, multi-step backend pipelines, and custom database training are quoted based on requirements.
                </div>

                <div className="space-y-2.5">
                  <a
                    href={WHATSAPP_CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-display text-sm font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-lg"
                  >
                    Get WhatsApp AI Agent (£10) <ArrowRight className="w-4 h-4" />
                  </a>

                  <Link
                    to="/contact?service=whatsapp-ai-agent"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs text-white/70 hover:text-white transition"
                  >
                    Or contact via web enquiry form →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — SOFTWARE DEVELOPMENT CAPABILITIES GRID */}
      <section className="py-16 md:py-24 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Capabilities & Engagement</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-3">
                Software Engineering Capabilities
              </h2>
              <p className="mt-3 text-base opacity-85 text-white/80 max-w-2xl">
                Every business has unique complexity. We provide transparent, requirement-based project scoping rather than arbitrary commoditized pricing.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-cyan-300 mb-1">Service 01</div>
                <h3 className="text-xl font-bold text-white mb-2">Bespoke CRM Engineering</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Custom client databases, multi-channel lead intake, invoicing modules, and client document sharing.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Pricing: Custom Quote</span>
                <Link to="/contact?service=crm-development" className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-purple-300 mb-1">Service 02</div>
                <h3 className="text-xl font-bold text-white mb-2">ERP & Operational Platforms</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Comprehensive management systems for inventory, fulfillment, order pipelines, and corporate compliance.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Pricing: Custom Quote</span>
                <Link to="/contact?service=erp-development" className="text-xs font-bold text-purple-300 hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-emerald-300 mb-1">Service 03</div>
                <h3 className="text-xl font-bold text-white mb-2">Autonomous AI Agents</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Multi-agent systems with MCP tools, local/cloud LLMs, webhooks, and intelligent task execution.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Pricing: Custom Quote</span>
                <Link to="/contact?service=ai-agents" className="text-xs font-bold text-emerald-300 hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-amber-300 mb-1">Service 04</div>
                <h3 className="text-xl font-bold text-white mb-2">Voice AI & Call Assistants</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Interactive real-time voice agents for customer intake, phone receptionist duties, and internal commands.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Pricing: Custom Quote</span>
                <Link to="/contact?service=voice-ai" className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-sky-300 mb-1">Service 05</div>
                <h3 className="text-xl font-bold text-white mb-2">Business Process Automation</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Automate invoice delivery, PDF document compilation, cross-platform database syncs, and email queues.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Pricing: Custom Quote</span>
                <Link to="/contact?service=automation" className="text-xs font-bold text-sky-300 hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-teal-300 mb-1">Service 06</div>
                <h3 className="text-xl font-bold text-white mb-2">Digi Biz OS Integration</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                  Custom plugin and MCP skill development for the Digi Biz OS desktop platform.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Ready-Made: £50</span>
                <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-300 hover:underline flex items-center gap-1">
                  Get OS <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — DUAL CONVERSION CLOSING CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Choose Your Path</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-3">
              Ready to Build Smarter <span className="text-gradient">Business Software</span>?
            </h2>
            <p className="mt-4 text-base opacity-90 text-white/90">
              Whether you need our ready-made AI operating system or bespoke custom software development, DigiFormation has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Path A: Ready-Made */}
            <div className="glass rounded-3xl p-8 border border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-card/60 flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase bg-cyan-400/20 text-cyan-300 mb-4">
                  Path A — Ready-Made Software
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Get Digi Biz OS</h3>
                <p className="text-sm opacity-85 text-white/80 leading-relaxed mb-6">
                  Deploy our autonomous AI desktop operating system on your Windows machine today. Universal voice control, built-in CRM, multi-agent workflows, and zero monthly fees.
                </p>
                <div className="text-2xl font-bold text-cyan-300 mb-6">
                  £50 <span className="text-xs font-normal text-white/60">/ Lifetime License</span>
                </div>
              </div>

              <a
                href={DIGI_BIZ_OS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-display text-sm font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-[0_0_20px_rgba(47,224,200,0.3)]"
              >
                Explore Digi Biz OS <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Path B: Custom Development */}
            <div className="glass rounded-3xl p-8 border border-white/20 bg-gradient-to-b from-white/10 to-card/60 flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/10 text-white/80 mb-4">
                  Path B — Custom Development
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Custom Software</h3>
                <p className="text-sm opacity-85 text-white/80 leading-relaxed mb-6">
                  Have a specific business workflow, CRM, ERP, or custom AI agent in mind? Tell our software engineering team about your project for a tailored consultation.
                </p>
                <div className="text-2xl font-bold text-white mb-6">
                  Custom Scoping <span className="text-xs font-normal text-white/60">/ Tailored to Your Needs</span>
                </div>
              </div>

              <Button asChild variant="hero" size="lg" className="rounded-full w-full">
                <Link to="/contact?service=custom-software">
                  Discuss Your Project <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FAQ */}
      <section className="py-16 md:py-24 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan-300">Questions & Answers</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <button
                  key={f.q}
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left glass rounded-2xl p-6 transition-all hover:border-white/25"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-white">{f.q}</h3>
                    <ChevronDown className={`w-5 h-5 mt-0.5 text-cyan-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isOpen && <p className="mt-4 text-xs sm:text-sm opacity-85 leading-relaxed text-white/80">{f.a}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

const faqs = [
  {
    q: "What is the difference between Digi Biz OS and Custom Software Development?",
    a: "Digi Biz OS is a ready-made, desktop AI business operating system for Windows that you can purchase (£50 lifetime license) and run immediately. Custom Software Development is our bespoke engineering service where DigiFormation builds tailored web applications, CRMs, ERPs, or custom AI agents specifically designed around your company's proprietary workflow.",
  },
  {
    q: "What does the £10 Custom WhatsApp AI Agent package include?",
    a: "The £10 package is an entry-level offer designed to get your business started with a custom-prompted WhatsApp AI Agent. It includes prompt engineering for your business FAQs, automated greeting, customer requirement intake, and deployment instructions. Advanced custom API integrations, real-time database syncs, or custom software backends are scoped individually.",
  },
  {
    q: "Can DigiFormation build custom CRM and ERP systems for my industry?",
    a: "Yes. We have experience building custom platforms for e-commerce, professional services, manufacturing, real estate, and legal/corporate compliance. We build modern single-page or multi-user applications with role-based access, automated invoicing, analytics dashboards, and external API integrations.",
  },
  {
    q: "What operating systems does Digi Biz OS support?",
    a: "Digi Biz OS is fully optimized for 64-bit Windows 10 and Windows 11. Support for macOS and Linux is actively in development.",
  },
  {
    q: "How do we get started on a custom software or AI agent project?",
    a: "Simply click 'Discuss Your Project' or reach out to us via WhatsApp or our contact form with an outline of your requirements. We will review your workflow, propose a technical specification, and provide a transparent project timeline and quote.",
  },
];
