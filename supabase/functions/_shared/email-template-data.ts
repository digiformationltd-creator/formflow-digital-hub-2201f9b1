import { isRecord } from './request-security.ts'

const stringFields = ['customerName', 'customerEmail', 'whatsapp', 'country', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'service', 'packageName', 'price', 'orderRef', 'invoiceNumber', 'invoiceUrl', 'pagePath', 'notes', 'liveSelfieLink', 'loginUrl', 'documentName', 'docDate', 'ticketRef', 'subject', 'message', 'status', 'note', 'address', 'expireDate', 'companyName', 'companyNumber', 'dueDate', 'reminderType', 'registeredAddress', 'greeting', 'heading', 'preview', 'body_text', 'user_id', 'invoice_url', 'login_url'] as const
type StringField = typeof stringFields[number]
export type EmailTemplateData = Partial<Record<StringField, string>> & {
  heading: string
  daysRemaining?: number
  documents?: { label: string; url: string; filename: string }[]
  paragraphs?: string[]
}

// Decode the shared template contract; do not assert arbitrary JSON as React props.
export function decodeEmailTemplateData(value: unknown): EmailTemplateData {
  if (!isRecord(value)) throw new TypeError('Template data must be an object')
  const data: EmailTemplateData = { heading: '' }
  for (const key of stringFields) {
    if (value[key] === undefined) continue
    if (typeof value[key] !== 'string' || value[key].length > 50000) throw new TypeError('Invalid template text field')
    data[key] = value[key]
  }
  if (value.daysRemaining !== undefined) {
    const days = value.daysRemaining
    if ((typeof days !== 'number' && typeof days !== 'string') || (typeof days === 'string' && !days.trim())) throw new TypeError('Invalid daysRemaining')
    const number = Number(days)
    if (!Number.isFinite(number)) throw new TypeError('Invalid daysRemaining')
    data.daysRemaining = number
  }
  if (value.paragraphs !== undefined) {
    if (!Array.isArray(value.paragraphs) || value.paragraphs.length > 100 || !value.paragraphs.every(p => typeof p === 'string' && p.length <= 50000)) throw new TypeError('Invalid paragraphs')
    data.paragraphs = value.paragraphs
  }
  if (value.documents !== undefined) {
    if (!Array.isArray(value.documents) || value.documents.length > 100) throw new TypeError('Invalid documents')
    data.documents = value.documents.map(document => {
      if (!isRecord(document) || typeof document.label !== 'string' || typeof document.url !== 'string' || typeof document.filename !== 'string') throw new TypeError('Invalid document')
      return { label: document.label, url: document.url, filename: document.filename }
    })
  }
  return data
}
