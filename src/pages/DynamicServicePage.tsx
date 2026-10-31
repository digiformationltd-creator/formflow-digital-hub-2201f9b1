import { Link, useParams } from "react-router-dom";
import ServicePage from "@/components/ServicePage";
import { ukServices, ukCompliance, usaServices, banking } from "@/data/navigation";
import Layout from "@/components/layout/Layout";
import { slugFromPath } from "@/data/serviceCatalog";
import NotFound from './NotFound';

const allServices = [
  ...ukServices.map(s => ({ ...s, group: "UK Services", base: "/uk-services" })),
  ...ukCompliance.map(s => ({ ...s, group: "UK Compliance", base: "/uk-compliance" })),
  ...usaServices.map(s => ({ ...s, group: "USA Services", base: "/usa-services" })),
  ...banking.map(s => ({ ...s, group: "Banking & Payments", base: "/banks-payment-solutions" })),
];

export const DynamicServicePage = () => {
  const params = useParams();
  const slug = params["*"] || Object.values(params).filter(Boolean).pop() || "";
  const path = `/${window.location.pathname.replace(/^\/+/, "")}`;
  const match = allServices.find(s => s.path === path);

  if (!match) {
    return <NotFound />;
  }

  const catalogSlug = slugFromPath(match.path);

  return (
    <ServicePage
      eyebrow={match.group}
      title={match.name}
      contactService={match.name}
      checkoutSlug={catalogSlug}
      description={`Explore ${match.name.toLowerCase()} support from DigiFormation. Confirm the filing scope, required documents, eligibility and applicable fees before ordering.`}
    >
      {path === '/uk-services/auth-code' && (
        <div className="max-w-3xl space-y-4"><h2 className="text-2xl font-semibold">Request and protect your company authentication code</h2><p>The company authentication code authorizes online filings. It is different from the personal code issued after identity verification. Treat it as sensitive: share it only with a trusted person for an agreed company filing, not with an unsolicited caller.</p><p>Before requesting support, confirm your company number and whether you can receive post at the registered office. Companies House also provides a home-address request route when appropriate. Delivery and recovery depend on the official process; immediate access is not guaranteed.</p><a className="underline" href="https://www.gov.uk/guidance/company-authentication-codes-for-online-filing">Read Companies House code and recovery guidance</a></div>
      )}
      {path === '/uk-services/activation-code' && (
        <div className="max-w-3xl space-y-4"><h2 className="text-2xl font-semibold">Confirm which service you need to activate</h2><p>An activation request must identify the specific government service and the notice you received. A company authentication code, personal identity-verification code and a tax-service activation notice are different items; requesting the wrong one can delay your filing.</p><p>Tell us the service name and company number so we can confirm the scope before you order. Keep your email password, Government Gateway password and one-time sign-in codes private. Where an agent needs permission, use the relevant official authorization process instead of sharing your login.</p><Link className="underline" to="/contact">Ask about an activation notice</Link></div>
      )}
      {path === '/uk-services/uk-vat-registration' && (
        <div className="max-w-3xl space-y-4"><h2 className="text-2xl font-semibold">Check registration and return obligations separately</h2><p>VAT registration depends on your taxable supplies and circumstances, including whether the business is established in the UK. Incorporating a UK company alone does not decide your VAT position. Non-established businesses can have different registration rules.</p><p>Prepare trading records and explain where the business operates before choosing registration or submission support. Ask a qualified tax adviser about your circumstances and confirm which returns and periods are included in any quoted service. HMRC makes the registration decision.</p><a className="underline" href="https://www.gov.uk/register-for-vat">Check HMRC’s current VAT registration guidance</a></div>
      )}
      {path === '/uk-services/company-annual-filing' && (
        <div className="max-w-3xl space-y-4">
          <h2 className="text-2xl font-semibold">Prepare for your confirmation statement</h2>
          <p>A confirmation statement checks the information held on the Companies House register. It is different from annual accounts and a Company Tax Return; ordering one filing does not automatically cover the others.</p>
          <p>Check your company’s filing date, current officers, ownership details and any identity-verification requirements before proceeding. Ask us to confirm what the quoted service includes and whether government fees or separate updates are additional. Do not share your email or government-account sign-in password.</p>
          <p><a className="underline" href="https://www.gov.uk/file-your-confirmation-statement-with-companies-house">Read the official confirmation-statement guidance</a>, or <Link className="underline" to="/uk-compliance/confirmation-statement">review our confirmation-statement service</Link> before choosing a filing option.</p>
        </div>
      )}
    </ServicePage>
  );
};
