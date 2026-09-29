import * as React from 'npm:react@18.3.1'
import { Button, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandEmail, Card, CardLine, SectionTitle, styles, SITE_NAME } from './_brand.tsx'

// Business inbox that receives every new order placed on the site. This must
// track the live domain: the business moved to digiformation.co.uk and this
// address was left behind on the old one, so real orders were landing in an
// inbox nobody reads any more.
const BUSINESS_EMAIL = 'info@digiformation.co.uk'

interface Props {
  customerName?: string
  customerEmail?: string
  whatsapp?: string
  country?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  service?: string
  packageName?: string
  price?: string
  orderRef?: string
  invoiceNumber?: string
  invoiceUrl?: string
  pagePath?: string
  notes?: string
  documents?: { label: string; url: string; filename: string }[]
}

// This was the one template of the fourteen that built its own bare HTML shell
// — no logo, no accent bar, no footer band — so the alert for a real order
// looked unbranded next to everything the customer receives. It now uses the
// same BrandEmail shell as the rest, which is also what keeps the logo and the
// site link defined in one place instead of fourteen.
const OrderNotificationEmail = ({
  customerName,
  customerEmail,
  whatsapp,
  country,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  service,
  packageName,
  price,
  orderRef,
  invoiceNumber,
  invoiceUrl,
  pagePath,
  notes,
  documents,
}: Props) => (
  <BrandEmail
    preview={`New order from ${customerName || customerEmail || 'a customer'} — ${service || 'Digiformation'}`}
    heading="New order received"
  >
    <Text style={styles.text}>
      A new order has just been placed on {SITE_NAME}.
    </Text>

    <SectionTitle>Order</SectionTitle>
    <Card>
      <CardLine label="Service" value={service} />
      <CardLine label="Package" value={packageName && packageName !== service ? packageName : undefined} />
      <CardLine label="Price" value={price} />
      <CardLine label="Reference" value={orderRef} />
      <CardLine label="Invoice #" value={invoiceNumber} />
      <CardLine label="Page" value={pagePath} />
    </Card>

    {invoiceUrl && (
      <Section style={{ margin: '0 0 20px' }}>
        <Button href={invoiceUrl} style={styles.button}>Download Invoice (PDF)</Button>
      </Section>
    )}

    <SectionTitle>Customer</SectionTitle>
    <Card>
      <CardLine label="Name" value={customerName} />
      <CardLine label="Email" value={customerEmail} />
      <CardLine label="WhatsApp" value={whatsapp} />
      <CardLine label="Address line 1" value={addressLine1} />
      <CardLine label="Address line 2" value={addressLine2} />
      <CardLine label="City" value={city} />
      <CardLine label="State / County" value={state} />
      <CardLine label="Postal code" value={postalCode} />
      <CardLine label="Country" value={country} />
    </Card>

    {documents && documents.length > 0 && (
      <>
        <SectionTitle>Submitted documents</SectionTitle>
        <Card>
          {documents.map((d) => (
            <Text key={d.url} style={styles.cardLine}>
              <strong>{d.label}:</strong>{' '}
              <a href={d.url} style={styles.link}>{d.filename}</a>
            </Text>
          ))}
          <Text style={styles.muted}>Links valid for 7 days.</Text>
        </Card>
      </>
    )}

    {notes && (
      <>
        <SectionTitle>Notes</SectionTitle>
        <Text style={styles.text}>{notes}</Text>
      </>
    )}
  </BrandEmail>
)

export const template = {
  component: OrderNotificationEmail,
  to: BUSINESS_EMAIL,
  subject: (d: Record<string, any>) => {
    const who = (d.customerName && String(d.customerName).trim()) || d.customerEmail || 'New customer'
    const svc = d.service || 'Digiformation'
    const ref = d.orderRef ? ` [${d.orderRef}]` : ''
    return `New order from ${who} — ${svc}${d.packageName ? ` (${d.packageName})` : ''}${ref}`
  },
  displayName: 'Order notification (business)',
  previewData: {
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    whatsapp: '+44 7000 000000',
    country: 'United Kingdom',
    service: 'UK LTD Formation — England & Wales',
    packageName: 'Silver',
    price: '£170',
    orderRef: 'ORD-12345',
    pagePath: '/uk-services/uk-ltd-formation/checkout',
    notes: 'Please contact me on WhatsApp.',
  },
} satisfies TemplateEntry
