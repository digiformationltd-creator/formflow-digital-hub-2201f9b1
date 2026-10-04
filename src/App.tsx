import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import WhatsAppFloat from "./components/WhatsAppFloat";
import AIAssistant from "./components/AIAssistant";
import ScrollToTop from "./components/ScrollToTop";
import RecoveryRedirect from "./components/RecoveryRedirect";
import AttributionTracker from "./components/AttributionTracker";
import GoogleAnalyticsTracker from "./components/GoogleAnalyticsTracker";

// Lazy-loaded routes for performance & minimal initial bundle
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const DynamicServicePage = lazy(() => import("./pages/DynamicServicePage").then((m) => ({ default: m.DynamicServicePage })));
const UKServicesHub = lazy(() => import("./pages/SectionHubs").then((m) => ({ default: m.UKServicesHub })));
const UKComplianceHub = lazy(() => import("./pages/SectionHubs").then((m) => ({ default: m.UKComplianceHub })));
const USAServicesHub = lazy(() => import("./pages/SectionHubs").then((m) => ({ default: m.USAServicesHub })));
const BankingHub = lazy(() => import("./pages/BankingHub"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.Contact })));
const Pricing = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.Pricing })));
const FAQ = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.FAQ })));
const ClientArea = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.ClientArea })));
const WebDevelopment = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.WebDevelopment })));
const Privacy = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/CorePages").then((m) => ({ default: m.Terms })));
const SoftwareDevelopment = lazy(() => import("./pages/SoftwareDevelopment"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const InsightPage = lazy(() => import("./pages/InsightPage").then((m) => ({ default: m.InsightPage })));
const InsightsIndex = lazy(() => import("./pages/InsightPage").then((m) => ({ default: m.InsightsIndex })));
const UKLtdFormation = lazy(() => import("./pages/UKLtdFormation"));
const UkLtdChooseJurisdiction = lazy(() => import("./pages/UkLtdChooseJurisdiction"));
const UkLtdCheckout = lazy(() => import("./pages/UkLtdCheckout"));
const LtdIdVerification = lazy(() => import("./pages/LtdIdVerification"));
const LtdIdVerificationCheckout = lazy(() => import("./pages/LtdIdVerificationCheckout"));
const RegisteredOfficeAddress = lazy(() => import("./pages/RegisteredOfficeAddress"));
const UtrCodes = lazy(() => import("./pages/UtrCodes"));
const CompliancePage = lazy(() => import("./pages/CompliancePage"));
const UKChangeServices = lazy(() => import("./pages/UKChangeServices"));
const UsaLlcFormation = lazy(() => import("./pages/UsaLlcFormation"));
const UsaLlcChooseState = lazy(() => import("./pages/UsaLlcChooseState"));
const UsaLlcCheckout = lazy(() => import("./pages/UsaLlcCheckout"));
const UsaServicePage = lazy(() => import("./pages/UsaServicePage"));
const BankingProviderPage = lazy(() => import("./pages/BankingProviderPage"));
const BankingCheckout = lazy(() => import("./pages/BankingCheckout"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Checkout = lazy(() => import("./pages/Checkout"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <RecoveryRedirect />
        <AttributionTracker />
        <GoogleAnalyticsTracker />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
          <Route path="/" element={<Index />} />

          {/* Section hubs */}
          <Route path="/uk-services" element={<UKServicesHub />} />
          <Route path="/uk-compliance" element={<UKComplianceHub />} />
          <Route path="/usa-services" element={<USAServicesHub />} />
          <Route path="/banks-payment-solutions" element={<BankingHub />} />

          {/* Dedicated service pages (must come before dynamic route) */}
          <Route path="/uk-services/uk-ltd-formation/choose-jurisdiction" element={<UkLtdChooseJurisdiction />} />
          <Route path="/uk-services/uk-ltd-formation/checkout" element={<UkLtdCheckout />} />
          <Route path="/uk-services/uk-ltd-formation" element={<UKLtdFormation />} />
          <Route path="/uk-services/ltd-id-verification/checkout" element={<LtdIdVerificationCheckout />} />
          <Route path="/uk-services/ltd-id-verification" element={<LtdIdVerification />} />
          <Route path="/uk-services/registered-office-address" element={<RegisteredOfficeAddress />} />
          <Route path="/uk-services/utr-codes" element={<UtrCodes />} />
          <Route path="/uk-services/utr-number" element={<UtrCodes />} />
          {/* Aliases under /ltd-formation-services */}
          <Route path="/ltd-formation-services" element={<UKLtdFormation />} />
          <Route path="/ltd-formation-services/uk-ltd-formation" element={<UKLtdFormation />} />
          <Route path="/ltd-formation-services/ltd-id-verification" element={<LtdIdVerification />} />
          <Route path="/ltd-formation/ltd-id-verification" element={<LtdIdVerification />} />
          <Route path="/ltd-formation-services/registered-office-address" element={<RegisteredOfficeAddress />} />
          <Route path="/ltd-formation-services/utr-codes" element={<UtrCodes />} />

          {/* UK Company Services - expanded change services */}
          <Route path="/uk-company-services/change-services" element={<UKChangeServices />} />
          <Route path="/uk-company-services/registered-office-address" element={<RegisteredOfficeAddress />} />
          <Route path="/uk-company-services/director-service-address" element={<RegisteredOfficeAddress />} />

          {/* UK Compliance dedicated data-driven pages */}
          <Route path="/uk-compliance/:slug" element={<CompliancePage />} />

          {/* USA dedicated pages (must come before dynamic route) */}
          <Route path="/usa-services/us-llc-formation/choose-state" element={<UsaLlcChooseState />} />
          <Route path="/usa-services/us-llc-formation/checkout" element={<UsaLlcCheckout />} />
          <Route path="/usa-services/us-llc-formation" element={<UsaLlcFormation />} />
          <Route path="/usa-services/usa-llc-formation" element={<UsaLlcFormation />} />
          <Route path="/llc-formation-services" element={<UsaLlcFormation />} />
          <Route path="/llc-formation-services/usa-llc-formation" element={<UsaLlcFormation />} />
          <Route path="/usa-services/ein-number" element={<UsaServicePage />} />
          <Route path="/usa-services/itin-number" element={<UsaServicePage />} />
          <Route path="/usa-services/annual-tax-filing" element={<UsaServicePage />} />
          <Route path="/usa-services/bio-report" element={<UsaServicePage />} />
          <Route path="/llc-formation-services/ein-number" element={<UsaServicePage />} />
          <Route path="/llc-formation-services/itin-number" element={<UsaServicePage />} />
          <Route path="/llc-formation-services/annual-tax-filing" element={<UsaServicePage />} />
          <Route path="/llc-formation-services/bio-report" element={<UsaServicePage />} />

          {/* Banking dedicated pages */}
          <Route path="/banks-payment-solutions/:slug/checkout" element={<BankingCheckout />} />
          <Route path="/banks-payment-solutions/:slug" element={<BankingProviderPage />} />

          {/* Dynamic service sub-pages (fallback) */}
          <Route path="/uk-services/:slug" element={<DynamicServicePage />} />
          <Route path="/usa-services/:slug" element={<DynamicServicePage />} />

          {/* Core pages */}
          <Route path="/software-development" element={<SoftwareDevelopment />} />
          <Route path="/software-and-ai" element={<SoftwareDevelopment />} />
          <Route path="/ai-agents" element={<SoftwareDevelopment />} />
          <Route path="/web-development" element={<WebDevelopment />} />
          <Route path="/3d-interactive-animated-web" element={<WebDevelopment />} />
          <Route path="/client-area" element={<ClientArea />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/packages" element={<Pricing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/insights" element={<InsightsIndex />} />
          <Route path="/insights/:slug" element={<InsightPage />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Client auth + dashboard */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/admin/*" element={<Admin />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <WhatsAppFloat />
        <AIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
