import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CheckoutFlow, { CheckoutItem } from "@/components/checkout/CheckoutFlow";
import { bankingProviders } from "@/data/banking";
import { useSeo } from "@/lib/seo";
import { isPackageEligible } from "@/data/promotions";

const deriveRegion = (requirements: string[]): "uk" | "usa" | "both" => {
  const line = requirements.find((r) => /Number$/.test(r)) || "";
  if (/UK \/ USA/.test(line)) return "both";
  if (/USA/.test(line)) return "usa";
  return "uk";
};

const phoneLabelFor = (region: "uk" | "usa" | "both") =>
  region === "usa" ? "USA Number (for bank OTP)" : region === "both" ? "UK / USA Number (for bank OTP)" : "UK Number (for bank OTP)";

const BankingCheckout = () => {
  const { slug } = useParams();
  const provider = bankingProviders.find((p) => p.slug === slug);

  useSeo(
    {
      title: provider ? `Checkout — ${provider.name} | Digiformation Ltd` : "Checkout | Digiformation Ltd",
      description: provider
        ? `Complete your ${provider.name} account setup with Digiformation. Secure checkout for business banking and payment gateway services.`
        : "Secure checkout for banking and payment gateway services.",
      noindex: true,
    },
    [slug],
  );

  if (!provider) return <Navigate to="/banks-payment-solutions" replace />;

  const priceNum = Number(provider.setupPrice.replace(/[^0-9.]/g, "")) || 0;
  const region = deriveRegion(provider.requirements);

  const isEligible = isPackageEligible("banking", provider.slug);

  const items: CheckoutItem[] = [
    {
      id: `bank-${provider.slug}`,
      name: `${provider.name} Account Setup`,
      description: provider.tagline,
      price: priceNum,
      fixed: true,
    },
  ];

  if (isEligible) {
    items.push({
      id: "free-website-launch-offer",
      name: "Complimentary Business Website (Domain Not Included)",
      description: `DigiFormation 2026 Promotional Launch Offer — 4-page modern React website included (£0.00). Domain name not included.`,
      price: 0,
      fixed: true,
    });
  }

  // Universal bonus: 30-Day DigiBusiness Software Free Trial included with all banking services
  items.push({
    id: "free-software-trial-30d",
    name: "30-Day DigiBusiness Software Free Trial",
    description: "DigiBusiness Software (Digi Biz OS Gen 2) full desktop license key with 12 AI engines — 30 days completely free (£0.00)",
    price: 0,
    fixed: true,
  });

  const defaultIds = [`bank-${provider.slug}`, "free-software-trial-30d"];
  if (isEligible) {
    defaultIds.push("free-website-launch-offer");
  }

  return (
    <Layout>
      <CheckoutFlow
        serviceTitle={`${provider.name} Account Setup`}
        serviceCode="BNK"
        currency="GBP"
        items={items}
        defaultSelectedIds={defaultIds}
        lockSelection
        contextLabel={`Service: ${provider.name} Account Setup`}
        backHref={`/banks-payment-solutions/${provider.slug}`}
        backLabel={`Back to ${provider.name}`}
        eyebrow="Banks & Payment Solutions"
        fixedPackageName={`${provider.name} Account Setup`}
        liveSelfieMode="none"
        showCompanyName
        companyNameOptional
        hideBusinessActivity
        showProofOfAddress
        showWebsite
        whatsappLabel={phoneLabelFor(region)}
        whatsappPlaceholder={
          region === "usa" ? "+1 ..." : region === "both" ? "+44 ... or +1 ..." : "+44 ..."
        }
        showSeparateWhatsapp
        whatsappContactLabel="WhatsApp contact number"
        whatsappContactPlaceholder="+44 ... or +1 ..."
      />
    </Layout>
  );
};

export default BankingCheckout;
