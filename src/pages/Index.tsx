import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSeo } from "@/lib/seo";
import DigiNav from "@/components/DigiNav";
import DigiHero from "@/components/DigiHero";
import QuickStartWidget from "@/components/QuickStartWidget";
import SnowParticles from "@/components/SnowParticles";

import DigiServicesSlider from "@/components/DigiServicesSlider";
import DigiStats from "@/components/DigiStats";
import DigiServices from "@/components/DigiServices";
import DigiWhyChoose from "@/components/DigiWhyChoose";
import DigiAbout from "@/components/DigiAbout";
import DigiTrustBar from "@/components/DigiTrustBar";
import DigiCaseStudies from "@/components/DigiCaseStudies";
import DigiTestimonials from "@/components/DigiTestimonials";
import DigiCTA from "@/components/DigiCTA";
import DigiFooter from "@/components/DigiFooter";

const Index = () => {
  useScrollReveal();

  useSeo({
    title: "UK LTD & US LLC Formation, Global Banking & AI Software Development | DigiFormation",
    description:
      "Official DigiFormation platform — Fully-managed UK Limited Company & US LLC formation for non-residents worldwide, international business banking, Stripe/PayPal gateways, custom software, CRM/ERP development, and AI agents.",
    keywords:
      "register UK limited company online, US LLC formation non resident, UK LTD formation 2026, Companies House ID verification, EIN without SSN, ITIN application, BOI report FinCEN, UK UTR HMRC, VAT registration UK, business bank account non resident, Stripe non resident, PayPal worldwide, Payoneer Wise WorldFirst Tide Airwallex Mercury, Delaware LLC Wyoming LLC, Amazon FBA UK LTD, Shopify Stripe worldwide, software development UK, AI agents, WhatsApp AI agent, CRM development, ERP development, Digi Biz OS, 3D web development",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SnowParticles />
      <DigiNav />
      <main>
        <DigiHero />

        <div id="quick-start"><QuickStartWidget /></div>
        <div id="stats"><DigiStats /></div>
        <div id="services-overview"><DigiServicesSlider /></div>
        <div id="services"><DigiServices /></div>
        <div id="case-studies"><DigiCaseStudies /></div>
        <div id="why-choose"><DigiWhyChoose /></div>
        <div id="trust"><DigiTrustBar /></div>
        <div id="about"><DigiAbout /></div>
        <div id="testimonials"><DigiTestimonials /></div>
        <DigiCTA />
      </main>
      <DigiFooter />
    </div>
  );
};

export default Index;
