import { isRecord } from './request-security.ts'
export interface ValidAgentOrder {
  service_slug: string
  package_name?: string
  amount_gbp: number
  currency?: 'GBP' | 'USD'
  checkout_request_id: string
  customer: { full_name: string; email: string; whatsapp?: string; whatsapp_e164?: string; country?: string; address_line1?: string; address_line2?: string; city?: string; state?: string; postal_code?: string }
  order?: { notes?: string; details?: { label: string; value: string }[]; kyc_verified?: boolean }
  documents?: { label: string; filename: string; path?: string; base64?: string; contentType?: string }[]
}
const text = (value: unknown, maximum = 10000): value is string => typeof value === 'string' && value.length <= maximum
const optionalText = (value: unknown, maximum = 10000) => value === undefined || text(value, maximum)
export function isValidAgentOrder(value: unknown): value is ValidAgentOrder {
  if (!isRecord(value) || !text(value.service_slug, 200) || !value.service_slug.trim() || !text(value.checkout_request_id, 200) || !value.checkout_request_id.trim()) return false
  if (typeof value.amount_gbp !== 'number' || !Number.isFinite(value.amount_gbp) || value.amount_gbp < 0) return false
  if (!optionalText(value.package_name, 500) || (value.currency !== undefined && value.currency !== 'GBP' && value.currency !== 'USD')) return false
  const customer = value.customer
  if (!isRecord(customer) || !text(customer.full_name, 300) || !customer.full_name.trim() || !text(customer.email, 320) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return false
  for (const key of ['whatsapp','whatsapp_e164','country','address_line1','address_line2','city','state','postal_code']) if (!optionalText(customer[key], 1000)) return false
  if (value.order !== undefined) {
    const order = value.order
    if (!isRecord(order) || !optionalText(order.notes) || (order.kyc_verified !== undefined && typeof order.kyc_verified !== 'boolean')) return false
    if (order.details !== undefined && (!Array.isArray(order.details) || order.details.length > 100 || !order.details.every(item => isRecord(item) && text(item.label, 500) && text(item.value, 10000)))) return false
  }
  if (value.documents !== undefined) {
    if (!Array.isArray(value.documents) || value.documents.length > 10) return false
    for (const document of value.documents) {
      if (!isRecord(document) || !text(document.label, 500) || !text(document.filename, 500) || !optionalText(document.contentType, 200)) return false
      if (!optionalText(document.base64, 6 * 1024 * 1024) || !optionalText(document.path, 2000)) return false
      if (!document.path && !document.base64) return false
      if (typeof document.path === 'string' && (document.path.startsWith('/') || document.path.includes('\\') || document.path.split('/').includes('..'))) return false
    }
  }
  return true
}
