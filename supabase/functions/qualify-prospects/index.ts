// Batch qualifier: the existing admin dashboard AND authenticated service cron
// remain legitimate callers. Both use the same atomic claim as the insert job.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { authorizeAutomation, isRecord, isUuid, jsonResponse } from '../_shared/request-security.ts'
import { qualifyOne } from '../_shared/prospect-qualification.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders)
  const authorization = await authorizeAutomation(request)
  if (authorization !== 200) return jsonResponse({ error: authorization === 403 ? 'Admin role required' : 'Unauthorized or unavailable' }, authorization, corsHeaders)
  const client = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
  const summary = { processed: 0, qualified: 0, needs_review: 0, rejected: 0, enrolled: 0, skipped: 0, rate_limited: false, errors: 0 }
  try {
    const { data, error } = await client.from('email_prospects').select('id')
      .eq('qualification_status', 'pending').order('created_at', { ascending: true }).limit(25)
    if (error || !Array.isArray(data)) return jsonResponse({ error: 'Qualification unavailable' }, 503, corsHeaders)
    for (const row of data) {
      if (!isRecord(row) || !isUuid(row.id)) { summary.errors++; continue }
      try {
        const result = await qualifyOne(client, row.id)
        if (result.rate_limited) { summary.rate_limited = true; break }
        if (result.skipped) { summary.skipped++; continue }
        summary.processed++
        if (result.decision === 'qualified') { summary.qualified++; summary.enrolled++ }
        else if (result.decision === 'rejected') summary.rejected++
        else summary.needs_review++
      } catch { summary.errors++ }
    }
    return jsonResponse({ ok: summary.errors === 0, summary }, 200, corsHeaders)
  } catch { return jsonResponse({ error: 'Qualification unavailable' }, 503, corsHeaders) }
})
