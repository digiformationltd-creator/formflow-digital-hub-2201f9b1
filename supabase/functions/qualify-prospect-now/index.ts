// Trigger-only instant qualifier. Paired migration supplies the exact service
// credential from Vault; anonymous/user tokens must never dispatch paid work.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { isRecord, isServiceRequest, isUuid, jsonResponse, readBoundedJson } from '../_shared/request-security.ts'
import { qualifyOne } from '../_shared/prospect-qualification.ts'

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  const url = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!url || !serviceKey) return jsonResponse({ error: 'Qualification unavailable' }, 503)
  if (!isServiceRequest(request, serviceKey)) return jsonResponse({ error: 'Unauthorized' }, 401)
  let body: unknown
  try { body = await readBoundedJson(request, 1024) }
  catch (error) { return jsonResponse({ error: error instanceof RangeError ? 'Payload too large' : 'Invalid JSON' }, error instanceof RangeError ? 413 : 400) }
  if (!isRecord(body) || !isUuid(body.prospect_id) || Object.keys(body).some(key => key !== 'prospect_id')) {
    return jsonResponse({ error: 'A valid prospect_id is required' }, 400)
  }
  try {
    const result = await qualifyOne(createClient(url, serviceKey), body.prospect_id)
    return result.rate_limited ? jsonResponse({ error: 'Rate limit exceeded' }, 429, { 'Retry-After': '3600' }) : jsonResponse(result)
  } catch {
    return jsonResponse({ error: 'Qualification unavailable' }, 503)
  }
})
