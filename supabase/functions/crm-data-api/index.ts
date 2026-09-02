// crm-data-api
// ------------------------------------------------------------------
// ONE read-only "A to Z" data API for external CRM / BI tools.
// Exposes every business table in the project through a single
// API key, with cursor/offset pagination and a snapshot endpoint.
//
// AUTH
//   Header: X-API-Key: <CRM_API_KEY>
//   (falls back to ORDER_AGENT_API_KEY for older integrations)
//
// ENDPOINTS (all GET, also accept POST JSON with the same fields)
//   ?resource=tables                     -> list every fetchable resource
//   ?resource=snapshot                   -> row counts for every resource
//   ?resource=<table>&limit=&offset=     -> rows from that table
//        &since=ISO      filter on the table's time column
//        &order=asc|desc
//   ?resource=all&limit=100              -> every table in one payload
//
// LIMITS: limit default 100, max 1000. Every call is audit-logged.
// ------------------------------------------------------------------

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-api-key, x-agent-api-key, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

/** table -> time column used for `since` filtering + ordering */
const RESOURCES: Record<string, string> = {
  // --- Orders / money ---
  client_orders: 'created_at',
  invoices: 'created_at',
  client_subscriptions: 'created_at',
  client_wallet_transactions: 'created_at',
  services: 'created_at',
  us_llc_state_pricing: 'created_at',

  // --- Clients / companies ---
  profiles: 'created_at',
  managed_clients: 'created_at',
  managed_companies: 'created_at',
  client_addresses: 'created_at',
  client_company_details: 'created_at',
  client_documents: 'created_at',
  client_tickets: 'created_at',
  team_members: 'created_at',
  user_roles: 'created_at',

  // --- Leads / marketing / attribution ---
  leads: 'created_at',
  lead_activities: 'created_at',
  lead_attribution: 'converted_at',
  contact_submissions: 'created_at',
  newsletter_subscribers: 'created_at',
  email_prospects: 'created_at',
  email_prospect_imports: 'created_at',
  prospect_campaign_runs: 'created_at',
  prospect_timeline: 'created_at',
  visitor_sessions: 'session_started_at',
  visitor_attribution: 'created_at',
  popup_dismissals: 'created_at',

  // --- Email system (every email in/out) ---
  email_send_log: 'created_at',
  email_reminder_log: 'sent_at',
  email_campaigns: 'created_at',
  email_templates: 'created_at',
  email_template_versions: 'created_at',
  suppressed_emails: 'created_at',

  // --- WhatsApp ---
  whatsapp_contacts: 'created_at',
  whatsapp_threads: 'created_at',
  whatsapp_message_log: 'created_at',
  whatsapp_broadcasts: 'created_at',
  whatsapp_broadcast_recipients: 'created_at',
  whatsapp_templates: 'created_at',
  whatsapp_clicks: 'created_at',
  whatsapp_consent_events: 'created_at',

  // --- Automation / audit / ops ---
  automation_rules: 'created_at',
  automation_runs: 'started_at',
  agent_audit_log: 'created_at',
  command_actions: 'created_at',
  tasks: 'created_at',
  cleanup_audit_log: 'created_at',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()
  const startedAt = Date.now()

  // ---- Auth ----
  const keys = [Deno.env.get('CRM_API_KEY'), Deno.env.get('ORDER_AGENT_API_KEY')].filter(
    (k): k is string => !!k && k.length > 10,
  )
  if (keys.length === 0) return json({ error: 'server_misconfigured', request_id: requestId }, 500)

  const provided =
    req.headers.get('x-api-key') ??
    req.headers.get('x-agent-api-key') ??
    (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!provided || !keys.some((k) => timingSafeEqual(provided, k))) {
    return json({ error: 'unauthorized', request_id: requestId }, 401)
  }

  // ---- Params ----
  const url = new URL(req.url)
  let p: Record<string, unknown> = {}
  if (req.method === 'POST') {
    const raw = await req.text()
    if (raw) {
      try {
        p = JSON.parse(raw)
      } catch {
        return json({ error: 'invalid_json', request_id: requestId }, 400)
      }
    }
  } else {
    p = Object.fromEntries(url.searchParams.entries())
  }

  const resource = String(p.resource ?? 'tables')
  const limit = Math.min(Math.max(Number(p.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
  const offset = Math.max(Number(p.offset) || 0, 0)
  const ascending = String(p.order ?? 'desc').toLowerCase() === 'asc'
  let sinceIso: string | null = null
  if (p.since) {
    const d = new Date(String(p.since))
    if (isNaN(d.getTime())) return json({ error: 'invalid_since', request_id: requestId }, 400)
    sinceIso = d.toISOString()
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const fetchTable = async (table: string, rowLimit = limit, rowOffset = offset) => {
    const timeCol = RESOURCES[table]
    let q = supabase.from(table).select('*', { count: 'exact' })
    if (sinceIso) q = q.gte(timeCol, sinceIso)
    q = q.order(timeCol, { ascending }).range(rowOffset, rowOffset + rowLimit - 1)
    const { data, error, count } = await q
    if (error) return { table, error: error.message }
    return {
      table,
      total: count ?? null,
      returned: data?.length ?? 0,
      offset: rowOffset,
      limit: rowLimit,
      next_offset: (data?.length ?? 0) === rowLimit ? rowOffset + rowLimit : null,
      rows: data ?? [],
    }
  }

  let body: Record<string, unknown>

  try {
    if (resource === 'tables') {
      body = {
        resources: Object.keys(RESOURCES).sort(),
        count: Object.keys(RESOURCES).length,
        usage: {
          rows: '?resource=client_orders&limit=100&offset=0&since=2026-01-01T00:00:00Z',
          snapshot: '?resource=snapshot',
          everything: '?resource=all&limit=100',
        },
      }
    } else if (resource === 'snapshot') {
      const names = Object.keys(RESOURCES)
      const counts = await Promise.all(
        names.map(async (t) => {
          let q = supabase.from(t).select('*', { count: 'exact', head: true })
          if (sinceIso) q = q.gte(RESOURCES[t], sinceIso)
          const { count, error } = await q
          return [t, error ? { error: error.message } : (count ?? 0)] as const
        }),
      )
      body = { since: sinceIso, counts: Object.fromEntries(counts) }
    } else if (resource === 'all') {
      const names = Object.keys(RESOURCES)
      const chunks: Record<string, unknown> = {}
      for (let i = 0; i < names.length; i += 8) {
        const batch = await Promise.all(names.slice(i, i + 8).map((t) => fetchTable(t)))
        for (const r of batch) chunks[r.table] = r
      }
      body = { since: sinceIso, limit, offset, data: chunks }
    } else if (RESOURCES[resource]) {
      body = await fetchTable(resource)
    } else {
      return json(
        {
          error: 'unknown_resource',
          resource,
          hint: 'Call ?resource=tables to list valid resources',
          request_id: requestId,
        },
        400,
      )
    }
  } catch (e) {
    return json({ error: 'internal_error', detail: String(e), request_id: requestId }, 500)
  }

  // ---- Audit (never blocks the response) ----
  try {
    await supabase.from('agent_audit_log').insert({
      agent_name: 'crm-data-api',
      action: `read:${resource}`,
      status: 'executed',
      request_payload: { resource, limit, offset, since: sinceIso, request_id: requestId },
      response_payload: { duration_ms: Date.now() - startedAt },
    })
  } catch (_) {
    // ignore
  }

  return json({
    ok: true,
    request_id: requestId,
    generated_at: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    resource,
    ...body,
  })
})
