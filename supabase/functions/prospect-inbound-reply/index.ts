// Integration-only inbound reply endpoint. A trusted adapter/provider must send
// X-Prospect-Inbound-Secret over HTTPS. This is NOT native Resend/Svix signature
// verification. Do not connect an unsigned provider until the adapter is set up.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { isRecord, jsonResponse, readBoundedJson, secretMatches } from '../_shared/request-security.ts'

function extractEmail(input: unknown): string | null {
  if (Array.isArray(input)) return extractEmail(input[0])
  if (isRecord(input)) return extractEmail(input.email ?? input.address)
  if (typeof input !== 'string' || input.length > 512) return null
  const candidate = (input.match(/<([^>]+)>/)?.[1] || input).trim().toLowerCase()
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(candidate) && candidate.length <= 254 ? candidate : null
}

Deno.serve(async (request) => {
  // Server-to-server only: no wildcard CORS or browser preflight permission.
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  const integrationSecret = Deno.env.get('PROSPECT_INBOUND_SECRET') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const url = Deno.env.get('SUPABASE_URL') || ''
  if (integrationSecret.length < 32 || !serviceKey || !url) return jsonResponse({ error: 'Integration unavailable' }, 503)
  if (!secretMatches(request.headers.get('X-Prospect-Inbound-Secret') || '', integrationSecret)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }
  let body: unknown
  try { body = await readBoundedJson(request) }
  catch (error) { return jsonResponse({ error: error instanceof RangeError ? 'Payload too large' : 'Invalid JSON' }, error instanceof RangeError ? 413 : 400) }
  if (!isRecord(body)) return jsonResponse({ error: 'Object payload required' }, 400)
  const data = isRecord(body.data) ? body.data : body
  const sender = extractEmail(data.from ?? data.sender ?? data.email ?? data.From)
  const messageId = data.message_id ?? data.id
  const subject = data.subject ?? data.Subject ?? ''
  const text = data.text ?? data.snippet ?? data.body ?? ''
  if (!sender || typeof messageId !== 'string' || !/^[\x21-\x7e]{1,256}$/.test(messageId)
    || typeof subject !== 'string' || subject.length > 500 || typeof text !== 'string' || text.length > 16000) {
    return jsonResponse({ error: 'Valid sender, unique message_id and bounded text fields required' }, 400)
  }
  try {
    const client = createClient(url, serviceKey)
    // One transaction handles event uniqueness, hourly cap and ALL side effects.
    // If the migration is missing or fails, no fallback unsafe writes occur.
    const { data: result, error } = await client.rpc('process_prospect_inbound_reply', {
      p_message_id: messageId, p_sender: sender, p_subject: subject, p_text: text,
    })
    if (error || !isRecord(result)) return jsonResponse({ error: 'Reply processing unavailable' }, 503)
    if (result.rate_limited === true) return jsonResponse({ error: 'Rate limit exceeded' }, 429, { 'Retry-After': '3600' })
    return jsonResponse({ ok: true, matched: result.matched === true, duplicate: result.duplicate === true })
  } catch {
    return jsonResponse({ error: 'Reply processing unavailable' }, 503)
  }
})
