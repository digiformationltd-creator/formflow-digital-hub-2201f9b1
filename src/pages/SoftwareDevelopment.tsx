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
  ChevronLeft,
  ChevronRight,
  Monitor,
  Code2,
  Building2,
  Maximize2,
  X,
  ZoomIn,
} from "lucide-react";

// Real Digi Biz OS authentic screenshots & logo
import logoClean from "@/assets/digibizos/logo-clean-B3ZQbUGe.png";
import osDashboard from "@/assets/digibizos/os-main-dashboard-BoY8H15Q.png";
import osCrm from "@/assets/digibizos/os-digi-crm-dashboard-sYLfgAHv.png";
import osCrmNav from "@/assets/digibizos/os-digi-crm-navigation-DgB8YzW3.png";
import osCrmAccounts from "@/assets/digibizos/os-digi-crm-accounts-CgPU0rvm.png";
import osAgentSearch from "@/assets/digibizos/os-active-agent-search-CfiLwplo.png";
import osLiveTracking from "@/assets/digibizos/os-live-tracking-modal-C_irvoTk.png";
import osWhatsapp from "@/assets/digibizos/os-digi-crm-whatsapp-CICbIdfA.png";
import osFlow from "@/assets/digibizos/os-digi-flow-COD-wY-R.png";
import osStudio from "@/assets/digibizos/os-digi-studio-video-editor-CuL-TZSF.png";
import osAvatar from "@/assets/digibizos/os-digi-studio-avatar-DUQumzVr.png";
import osVoice from "@/assets/digibizos/os-digi-studio-voice-CFtk0QZU.png";
import osCode from "@/assets/digibizos/os-digi-code-CbVWFLnn.png";
import osSkills from "@/assets/digibizos/os-skills-BTs8QIiL.png";
import osDesktopTools from "@/assets/digibizos/os-desktop-tools-CEu3jUP0.png";
import osMarketing from "@/assets/digibizos/os-digi-marketing-XK_e_Bwl.png";
import osChat from "@/assets/digibizos/os-digi-ai-chat-EU4baMLN.png";
import osAiImage from "@/assets/digibizos/os-digi-ai-image-Blo_K5K8.png";

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
  canonical.setAttribute("href", "https://www.digiformation.co.uk/software-development");
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
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string; desc: string } | null>(null);
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
            name: "Custom CRM Software Development",
            price: "Custom Quote",
          },
          {
            "@type": "Offer",
            name: "Custom ERP & Business Operations Systems",
            price: "Custom Quote",
          },
          {
            "@type": "Offer",
            name: "Bespoke Business Process Automation",
            price: "Custom Quote",
          },
        ],
      },
    });

    const cleanupProduct = injectJsonLd("digibizos-product-jsonld", {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Digi Biz OS",
      operatingSystem: "Windows 10, Windows 11",
      applicationCategory: "BusinessApplication",
      offers: {
        "@type": "Offer",
        price: "50",
        priceCurrency: "GBP",
        url: "https://digibizos.co.uk/",
      },
      creator: {
        "@type": "Organization",
        name: "Digiformation Ltd",
        url: "https://digiformation.co.uk",
      },
      description:
        "All-in-one AI-powered desktop Business Operating System featuring universal voice AI control, autonomous multi-agent execution, DIGI CRM, WhatsApp integration, and creative video studio.",
    });

    return () => {
      cleanupFaq();
      cleanupService();
      cleanupProduct();
    };
  }, []);

  const showcaseSlides = [
    {
      id: "os-dashboard",
      title: "Universal AI Business Dashboard",
      tag: "Main Dashboard",
      badge: "Desktop Core",
      desc: "Central command center with real-time neural reasoning status, multi-module telemetry, quick launch shortcuts, and universal voice control across all enterprise operations.",
      image: osDashboard,
    },
    {
      id: "os-crm",
      title: "DIGI CRM & Pipeline Intelligence",
      tag: "CRM & Pipelines",
      badge: "Customer Intelligence",
      desc: "Full customer lifecycle intelligence, multi-stage sales pipeline, company accounts, revenue forecasting, notes, and persistent contextual business memory.",
      image: osCrm,
    },
    {
      id: "os-agent-search",
      title: "Autonomous Multi-Agent Platform",
      tag: "Agentic Swarm",
      badge: "Autonomous AI",
      desc: "Specialized AI agents working concurrently on research, data scraping, document verification, lead enrichment, and end-to-end task execution.",
      image: osAgentSearch,
    },
    {
      id: "os-live-tracking",
      title: "Live Agent Execution & Memory Monitor",
      tag: "Agent Monitor",
      badge: "Live Telemetry",
      desc: "Real-time inspection modal tracking agent step-by-step thinking, tool usage, memory context retrieval, and subagent collaboration.",
      image: osLiveTracking,
    },
    {
      id: "os-whatsapp",
      title: "WhatsApp Automated CRM Hub",
      tag: "WhatsApp CRM",
      badge: "Direct Messaging",
      desc: "Direct WhatsApp business integration, customer chat threads, automated auto-responder workflows, and client conversation history logged in local SQLite.",
      image: osWhatsapp,
    },
    {
      id: "os-studio",
      title: "Digi Studio Creative AI Suite",
      tag: "Media & Studio",
      badge: "Content Engine",
      desc: "Integrated video editing, voice synthesis, avatar presentations, transcript extraction, and automated marketing media generation directly on your desktop.",
      image: osStudio,
    },
    {
      id: "os-code",
      title: "Digi Code Studio & Developer Hub",
      tag: "Developer Hub",
      badge: "Code & Scripts",
      desc: "Built-in developer workstation with intelligent code generation, terminal controls, Git synchronization, and automated MCP tool scripting.",
      image: osCode,
    },
    {
      id: "os-skills",
      title: "Skills & Universal MCP Tools",
      tag: "Tools & MCP",
      badge: "Universal Toolchain",
      desc: "Extensible Model Context Protocol (MCP) toolchain connecting local neural models, screen inspection, vision cameras, and system executables.",
      image: osSkills,
    },
    {
      id: "os-desktop-tools",
      title: "Integrated Desktop Tools Suite",
      tag: "Desktop Tools",
      badge: "Productivity",
      desc: "Local file converters, batch utilities, system cleaners, audio recorders, and secure encrypted data storage built right into the OS.",
      image: osDesktopTools,
    },
    {
      id: "os-marketing",
      title: "AI Marketing & Campaign Engine",
      tag: "Marketing Suite",
      badge: "Growth Engine",
      desc: "Automated social media campaign generation, SEO article drafting, audience intelligence, and multi-platform content scheduling.",
      image: osMarketing,
    },
    {
      id: "os-chat",
      title: "Multi-Model AI Chat Interface",
      tag: "AI Chat",
      badge: "Universal LLM",
      desc: "Seamless switching between local offline models (Ollama/Llama) and cloud frontier models (OpenAI, Claude, DeepSeek) with zero data leakage.",
      image: osChat,
    },
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % showcaseSlides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);

  return (
    <Layout>
      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
            <a
              href={DIGI_BIZ_OS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-primary/20 text-white hover:bg-primary/30 transition flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Digi Biz OS <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setLightboxImg(null)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative max-w-6xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full glass rounded-2xl p-2 md:p-3 border border-border/80 shadow-2xl overflow-hidden flex flex-col">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-secondary/40 rounded-t-xl mb-2 text-xs opacity-80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-[11px] text-white/90">{lightboxImg.title} — Full UI Overview</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Digi Biz OS Desktop Preview</span>
              </div>
              <div className="overflow-auto max-h-[75vh] rounded-b-xl bg-background/90 flex items-center justify-center p-1">
                <img
                  src={lightboxImg.src}
                  alt={lightboxImg.title}
                  className="max-w-full h-auto max-h-[72vh] object-contain rounded-lg shadow-inner"
                />
              </div>
            </div>
            <p className="mt-3 text-xs md:text-sm text-center opacity-80 max-w-2xl text-white/90">
              {lightboxImg.desc}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-pulse-glow pointer-events-none" />

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="grid lg:grid-cols-[1.1fr_1.1fr] gap-10 lg:gap-12 items-center">
            <div className="max-w-2xl">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Software & AI Engineering
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                Software Development & <em className="not-italic text-gradient">AI Agents</em> for Modern Businesses
              </h1>

              <p className="mt-8 text-lg md:text-xl leading-relaxed opacity-90">
                DigiFormation engineers bespoke business software, autonomous AI agents, CRM & ERP platforms, and custom workflow automation. We are also the creator of <strong className="font-semibold text-white">Digi Biz OS</strong> — our flagship AI desktop Business Operating System.
              </p>

              {/* Dual Primary CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="lg" className="rounded-full">
                  <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer">
                    Get Digi Biz OS <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                <Button asChild variant="ghostGlow" size="lg" className="rounded-full">
                  <a href="#custom-software">
                    Build Custom Software <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>

              {/* Key capabilities tag strip */}
              <div className="mt-10 pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">Custom CRM & ERP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">Custom AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">Business Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">Digi Biz OS Creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">WhatsApp AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="opacity-90">Universal MCP & Voice</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Preview — Desktop Window Frame (Uncropped) */}
            <div className="relative">
              <div
                onClick={() =>
                  setLightboxImg({
                    src: osDashboard,
                    title: "Digi Biz OS — Universal AI Desktop Operating System",
                    desc: "Full dashboard view showing active neural reasoning, voice AI input, multi-agent status, and local business tools.",
                  })
                }
                className="relative rounded-2xl glass shadow-elegant border border-border/70 p-2 md:p-3 cursor-pointer group hover:border-primary/50 transition-all"
              >
                {/* OS Window Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-secondary/30 rounded-t-xl mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-[11px] opacity-75 hidden sm:inline">Digi Biz OS • Main Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold group-hover:underline">
                    <ZoomIn className="w-3.5 h-3.5" /> Click to Expand
                  </div>
                </div>

                {/* Screenshot Container without crop */}
                <div className="relative rounded-xl overflow-hidden bg-background/90 flex items-center justify-center">
                  <img
                    src={osDashboard}
                    alt="Digi Biz OS Main AI Desktop Dashboard developed by DigiFormation"
                    className="w-full h-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>

                {/* Bottom pill */}
                <div className="mt-2.5 flex items-center justify-between px-2 text-xs opacity-80">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Windows 10 & 11 Desktop Edition
                  </span>
                  <span className="text-primary font-semibold">£50 Lifetime License</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DIGI BIZ OS FEATURED PRODUCT SHOWCASE */}
      <section className="py-14 md:py-20 border-t border-border/60 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Interactive Showcase
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Meet <em className="not-italic text-gradient">Digi Biz OS</em>
              </h2>
              <p className="mt-3 text-base md:text-lg opacity-80 max-w-2xl">
                Explore the full suite of modules built into Digi Biz OS. Click any screenshot below to view the uncompressed full-screen dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghostGlow"
                size="sm"
                onClick={prevSlide}
                className="rounded-full w-10 h-10 p-0"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghostGlow"
                size="sm"
                onClick={nextSlide}
                className="rounded-full w-10 h-10 p-0"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button asChild variant="hero" size="default" className="rounded-full ml-2">
                <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer">
                  Get Digi Biz OS <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-2 overflow-x-auto">
            {showcaseSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSlide === idx
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "glass text-white/80 hover:text-white hover:bg-primary/10"
                }`}
              >
                {slide.tag}
              </button>
            ))}
          </div>

          {/* Active Showcase Card — Full Uncropped Window View */}
          <div className="glass glass-tint-indigo rounded-3xl p-5 md:p-8 border border-border/70 shadow-elegant">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
              {/* Uncropped OS Window with Zoom Trigger */}
              <div
                onClick={() =>
                  setLightboxImg({
                    src: showcaseSlides[activeSlide].image,
                    title: showcaseSlides[activeSlide].title,
                    desc: showcaseSlides[activeSlide].desc,
                  })
                }
                className="relative rounded-2xl glass p-2 md:p-3 border border-border/70 shadow-xl cursor-pointer group hover:border-primary/50 transition-all"
              >
                {/* Window header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-secondary/40 rounded-t-xl mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-[11px] text-white/90">
                      Digi Biz OS • {showcaseSlides[activeSlide].tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold group-hover:underline">
                    <Maximize2 className="w-3.5 h-3.5" /> Full Zoom
                  </div>
                </div>

                {/* Screenshot Display: Uncropped full image */}
                <div className="relative rounded-xl overflow-hidden bg-background/90 flex items-center justify-center">
                  <img
                    src={showcaseSlides[activeSlide].image}
                    alt={`${showcaseSlides[activeSlide].title} - Digi Biz OS`}
                    className="w-full h-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Description & Action */}
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
                  {showcaseSlides[activeSlide].badge}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  {showcaseSlides[activeSlide].title}
                </h3>
                <p className="text-sm md:text-base opacity-90 leading-relaxed">
                  {showcaseSlides[activeSlide].desc}
                </p>

                <div className="pt-4 border-t border-border/40 flex flex-wrap items-center gap-4">
                  <Button asChild variant="hero" size="default" className="rounded-full">
                    <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer">
                      Get Digi Biz OS (£50 Lifetime) <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                  <button
                    onClick={() =>
                      setLightboxImg({
                        src: showcaseSlides[activeSlide].image,
                        title: showcaseSlides[activeSlide].title,
                        desc: showcaseSlides[activeSlide].desc,
                      })
                    }
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ZoomIn className="w-3.5 h-3.5" /> View Uncompressed UI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT DIGI BIZ OS CAN DO (Verified Features) */}
      <section className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                Verified Capabilities
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              What <em className="not-italic text-gradient">Digi Biz OS</em> Brings to Your Desktop
            </h2>
            <p className="opacity-80 mt-4 text-base md:text-lg">
              Engineered with an active neural reasoning engine, universal voice assistance, and deep business workflow integrations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass glass-tint-cyan rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Mic className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Universal Voice AI Control</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  JARVIS-style voice assistant embedded in every prompt box and module. Control software, trigger automations, and query data hands-free.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-indigo rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Bot className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Multi-Agent Execution</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Specialized autonomous agents collaborating concurrently for research, execution, data verification, and task handling.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-green rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Database className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">DIGI CRM & Pipeline</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Complete contact management, active deals pipeline, company accounts, notes, and long-term customer context memory.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-sky rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <MessageSquare className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">WhatsApp CRM Integration</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Automated WhatsApp customer threads, campaign broadcasts, and direct client conversation logging inside the OS.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-pink rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Sparkles className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Digi Studio Creative AI</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Integrated video editing, voice synthesis, avatar presentations, transcript extraction, and media rendering on desktop.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-gold rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Cpu className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Universal MCP & Skills</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Extensible Model Context Protocol (MCP) toolchain allowing AI models to interact with local databases, cameras, and system tools.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-mustard rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <Monitor className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Desktop Workstation OS</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  Optimized for Windows 10 & 11. Run local models or cloud APIs with complete privacy and seamless local file processing.
                </p>
              </div>
            </div>

            <div className="glass glass-tint-orange rounded-2xl p-6 hover:-translate-y-1 hover:shadow-elegant transition-all flex flex-col justify-between">
              <div>
                <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Zero Monthly SaaS Fees</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  One-time purchase model (£50). Own your business operating system without perpetual monthly subscription lock-ins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY DIGIFORMATION BUILT IT */}
      <section className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="glass glass-tint-indigo rounded-3xl p-8 md:p-12 border border-border/60">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center shrink-0">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                    The Creator Behind The Product
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  Why DigiFormation Engineered Digi Biz OS
                </h3>
                <p className="text-sm md:text-base opacity-90 leading-relaxed">
                  As an international corporate services provider managing UK company formations, US LLCs, compliance deadlines, and thousands of client documents daily, DigiFormation needed an operating system capable of autonomous multi-agent reasoning, CRM intelligence, and instant workflow automation.
                </p>
                <p className="text-sm md:text-base opacity-90 leading-relaxed">
                  Rather than paying fragmented monthly fees to dozens of separate SaaS vendors, we engineered <strong>Digi Biz OS</strong> — combining our real-world corporate operational experience with cutting-edge agentic software engineering. Today, we make this same operating system available to businesses worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — CUSTOM SOFTWARE DEVELOPMENT */}
      <section id="custom-software" className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Bespoke Engineering
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Need Custom Software Built for <em className="not-italic text-gradient">Your Business</em>?
              </h2>
              <p className="mt-4 text-base md:text-lg opacity-80 max-w-2xl">
                When ready-made software doesn’t fit your exact workflow, DigiFormation designs and engineers custom business systems, CRMs, ERPs, and automation platforms tailored specifically to your company’s requirements.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Database className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Custom CRM Systems</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  Tailored customer relationship platforms with bespoke sales pipelines, automated deal tracking, WhatsApp/email triggers, and client portals.
                </p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Multi-stage deal pipelines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Automated lead capture & attribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Client portal & document distribution</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Layers className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Custom ERP & Management Systems</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  End-to-end Enterprise Resource Planning systems for inventory, order processing, team workload, billing, and operational compliance.
                </p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Centralized order & invoice generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Role-based permissions & admin security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Inventory & service catalog tracking</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Workflow className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Business Workflow Automation</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  Automate repetitive manual operations: instant PDF generation, automatic transactional mailers, webhook integrations, and scheduled syncs.
                </p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Webhook & API data pipelines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Automated compliance deadline alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Transactional notifications (Email/WhatsApp)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Monitor className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Internal Dashboards & Platforms</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  High-performance administrative dashboards with real-time analytics, revenue KPI monitoring, and customer telemetry.
                </p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Real-time financial & revenue analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Data export & backup utilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Multi-tenant or single-tenant setups</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Brain className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">AI-Powered Business Software</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  Embed intelligent AI models directly into your business workflows for document parsing, intelligent search, and autonomous data extraction.
                </p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Intelligent document OCR & verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Natural language search & data querying</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Custom fine-tuned internal assistants</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass rounded-2xl p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Code2 className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Modern Technology Stack</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-4">
                  Built with enterprise-grade technologies: React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Supabase, and Deno Edge Runtimes.
                </p>
                <div className="pt-2">
                  <Button asChild variant="hero" className="rounded-full w-full">
                    <Link to="/contact?service=custom-software">
                      Discuss Your Project <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CUSTOM AI AGENTS FOR YOUR BUSINESS */}
      <section className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Agentic Engineering
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                AI Agents Built Around <em className="not-italic text-gradient">Your Workflow</em>
              </h2>
              <p className="mt-4 text-base md:text-lg opacity-85 leading-relaxed">
                We engineer autonomous and assistive AI agents trained on your specific business processes, catalog, and rules. Instead of static chatbots, our agents perform actions, collect requirements, and integrate directly with your existing tools.
              </p>

              {/* Real World Workflow Example */}
              <div className="mt-6 glass glass-tint-cyan rounded-2xl p-6">
                <div className="text-xs uppercase tracking-[0.18em] font-semibold text-primary mb-2">
                  Example Use Case: Custom WhatsApp Agent
                </div>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  A bespoke tailoring business or service provider can deploy a custom WhatsApp AI Agent that automatically answers pricing questions, collects customer measurements/specifications, provides service availability, logs the enquiry into a CRM, and notifies the business owner instantly.
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <Bot className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-bold">WhatsApp & Chat Agents</div>
                  <div className="text-xs opacity-70 mt-1">24/7 client communication & lead capture.</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <Mic className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-bold">Voice AI Assistants</div>
                  <div className="text-xs opacity-70 mt-1">Conversational phone and desktop voice agents.</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-bold">Support & FAQ Agents</div>
                  <div className="text-xs opacity-70 mt-1">Instant issue resolution & ticket creation.</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <Workflow className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-bold">Internal Operations Agents</div>
                  <div className="text-xs opacity-70 mt-1">Data extraction, email drafting & reporting.</div>
                </div>
              </div>
            </div>

            {/* SECTION 7 — SMALL ENTRY PACKAGE: CUSTOM WHATSAPP AI AGENT (£10) */}
            <div className="relative">
              <div className="relative glass rounded-3xl p-7 ring-1 ring-cyan-400/60 bg-gradient-to-b from-cyan-500/25 to-indigo-500/5 flex flex-col hover:-translate-y-1 transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-brand text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-white">
                  Entry-Level Custom Agent Offer
                </div>

                <div className="text-xs uppercase tracking-[0.18em] font-semibold opacity-80">Starter AI Agent Package</div>
                <h3 className="text-2xl font-bold mt-1 mb-2 leading-snug">
                  Custom WhatsApp AI Agent
                </h3>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[10px] opacity-70 uppercase tracking-widest mr-2">Starting from</span>
                  <span className="font-display text-5xl font-bold text-gradient">£10</span>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="opacity-90">Configured for your business service & common FAQs</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="opacity-90">Automated customer greetings & enquiry detail collection</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="opacity-90">Custom system prompt & brand tone alignment</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="opacity-90">Setup guidance & deployment walk-through</span>
                  </li>
                </ul>

                <div className="p-3 rounded-xl glass text-[11px] opacity-80 mt-6 leading-relaxed">
                  * Note: Entry package includes standard FAQ & workflow prompt setup. Advanced API integrations, multi-step backend pipelines, and custom database training are quoted based on requirements.
                </div>

                <div className="mt-7 space-y-2.5">
                  <Button asChild variant="hero" size="lg" className="rounded-full w-full">
                    <a href={WHATSAPP_CONTACT_URL} target="_blank" rel="noopener noreferrer">
                      Get WhatsApp AI Agent (£10) <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>

                  <Button asChild variant="ghostGlow" size="sm" className="rounded-full w-full">
                    <Link to="/contact?service=whatsapp-ai-agent">
                      Or contact via web enquiry form →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — SOFTWARE DEVELOPMENT CAPABILITIES GRID */}
      <section className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Capabilities & Engagement
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Software Engineering Capabilities
              </h2>
              <p className="mt-3 text-base opacity-80 max-w-2xl">
                Every business has unique complexity. We provide transparent, requirement-based project scoping rather than arbitrary commoditized pricing.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="glass glass-tint-cyan rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 01</div>
                <h3 className="font-display text-lg font-bold mb-2">Bespoke CRM Engineering</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Custom client databases, multi-channel lead intake, invoicing modules, and client document sharing.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Pricing: Custom Quote</span>
                <Link to="/contact?service=crm-development" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass glass-tint-purple rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 02</div>
                <h3 className="font-display text-lg font-bold mb-2">ERP & Operational Platforms</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Comprehensive management systems for inventory, fulfillment, order pipelines, and corporate compliance.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Pricing: Custom Quote</span>
                <Link to="/contact?service=erp-development" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass glass-tint-green rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 03</div>
                <h3 className="font-display text-lg font-bold mb-2">Autonomous AI Agents</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Multi-agent systems with MCP tools, local/cloud LLMs, webhooks, and intelligent task execution.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Pricing: Custom Quote</span>
                <Link to="/contact?service=ai-agents" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass glass-tint-gold rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 04</div>
                <h3 className="font-display text-lg font-bold mb-2">Voice AI & Call Assistants</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Interactive real-time voice agents for customer intake, phone receptionist duties, and internal commands.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Pricing: Custom Quote</span>
                <Link to="/contact?service=voice-ai" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass glass-tint-sky rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 05</div>
                <h3 className="font-display text-lg font-bold mb-2">Business Process Automation</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Automate invoice delivery, PDF document compilation, cross-platform database syncs, and email queues.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Pricing: Custom Quote</span>
                <Link to="/contact?service=automation" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Enquire <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass glass-tint-orange rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">Service 06</div>
                <h3 className="font-display text-lg font-bold mb-2">Digi Biz OS Integration</h3>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed mb-4">
                  Custom plugin and MCP skill development for the Digi Biz OS desktop platform.
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold opacity-70">Ready-Made: £50</span>
                <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Get OS <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — DUAL CONVERSION CLOSING CTA */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                Choose Your Path
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Ready to Build Smarter <em className="not-italic text-gradient">Business Software</em>?
            </h2>
            <p className="mt-4 text-base opacity-80">
              Whether you need our ready-made AI operating system or bespoke custom software development, DigiFormation has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Path A: Ready-Made */}
            <div className="relative glass rounded-3xl p-8 ring-1 ring-cyan-400/60 bg-gradient-to-b from-cyan-500/25 to-indigo-500/5 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-brand text-white mb-4">
                  Path A — Ready-Made Software
                </div>
                <h3 className="text-2xl font-bold mb-2">Get Digi Biz OS</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-6">
                  Deploy our autonomous AI desktop operating system on your Windows machine today. Universal voice control, built-in CRM, multi-agent workflows, and zero monthly fees.
                </p>
                <div className="text-3xl font-bold text-gradient mb-6">
                  £50 <span className="text-xs font-normal opacity-70">/ Lifetime License</span>
                </div>
              </div>

              <Button asChild variant="hero" size="lg" className="rounded-full w-full">
                <a href={DIGI_BIZ_OS_URL} target="_blank" rel="noopener noreferrer">
                  Explore Digi Biz OS <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </div>

            {/* Path B: Custom Development */}
            <div className="relative glass rounded-3xl p-8 ring-1 ring-border/60 bg-gradient-to-b from-card/80 to-card/40 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 mb-4">
                  Path B — Custom Development
                </div>
                <h3 className="text-2xl font-bold mb-2">Request Custom Software</h3>
                <p className="text-sm opacity-85 leading-relaxed mb-6">
                  Have a specific business workflow, CRM, ERP, or custom AI agent in mind? Tell our software engineering team about your project for a tailored consultation.
                </p>
                <div className="text-3xl font-bold text-gradient mb-6">
                  Custom Scoping <span className="text-xs font-normal opacity-70">/ Tailored to Your Needs</span>
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
      <section className="py-14 md:py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                Questions & Answers
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently Asked <em className="not-italic text-gradient">Questions</em>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={f.q}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left glass rounded-2xl p-6 transition-all hover:bg-secondary/40 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-base sm:text-lg font-semibold">{f.q}</h3>
                    <ChevronDown className={`w-5 h-5 mt-0.5 text-primary transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isOpen && <p className="mt-4 text-xs sm:text-sm opacity-85 leading-relaxed">{f.a}</p>} 
                </div>
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
    q: "What is an AI agent and how does it differ from a traditional chatbot or automation?",
    a: "An AI agent combines large language model reasoning with defined tools, system instructions, memory, and permissions to autonomously execute multi-step tasks (such as qualifying leads, fetching database records, calculating prices, and updating CRMs). In contrast, a traditional chatbot only returns pre-scripted text without tool actions, and traditional automation follows rigid hardcoded if-then rules without contextual understanding.",
  },
  {
    q: "What is the difference between custom CRM and custom ERP software?",
    a: "CRM (Customer Relationship Management) focuses externally on customer acquisition, lead capture, sales pipelines, communication threads (like WhatsApp), and client support. ERP (Enterprise Resource Planning) focuses internally on overall business operations—inventory tracking, order fulfillment, invoicing/accounting workflows, role-based security, and cross-department operations. DigiFormation designs both standalone systems and unified CRM+ERP platforms where a customer lead flows seamlessly into fulfillment and accounting.",
  },
  {
    q: "What is custom CRM development and why choose it over off-the-shelf SaaS?",
    a: "Custom CRM development creates a bespoke customer relationship management platform engineered around your proprietary sales pipeline, data models, and team workflow. Unlike off-the-shelf SaaS platforms (like Salesforce or HubSpot) that impose per-user monthly subscriptions, generic schemas, and feature bloat, a custom CRM gives your business 100% data ownership, zero recurring seat fees, and seamless integration with your internal databases, WhatsApp, and invoicing.",
  },
  {
    q: "Can our custom CRM integrate with WhatsApp, Stripe, and accounting software?",
    a: "Yes. We engineer direct API connections and webhook pipelines for WhatsApp Business (automated messaging and lead capture), Stripe/PayPal (payment tracking and subscription alerts), and accounting tools (Xero, QuickBooks, or custom invoicing engines).",
  },
  {
    q: "What is the difference between Digi Biz OS and Custom CRM / Software Development?",
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