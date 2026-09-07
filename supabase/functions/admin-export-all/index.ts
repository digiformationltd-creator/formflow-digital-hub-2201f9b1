// admin-export-all
// ---------------------------------------------------------------------------
// Admin-only full-database export. Runs with the service role so RLS cannot
// hide rows. Reads every base table in the public schema, paginating through
// all rows, and returns { generated_at, counts, tables }.
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const PAGE = 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  })
  const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
  if (!(roles ?? []).some((r: any) => r.role === 'admin')) {
    return json({ error: 'Forbidden — admin only' }, 403)
  }

  const { data: tableList, error: listErr } = await admin.rpc('list_public_tables')
  if (listErr) return json({ error: listErr.message }, 500)

  const tables: Record<string, any[]> = {}
  const counts: Record<string, number> = {}
  const errors: Record<string, string> = {}

  for (const table of (tableList as string[] ?? [])) {
    const rows: any[] = []
    let from = 0
    for (;;) {
      const { data, error } = await admin
        .from(table)
        .select('*')
        .range(from, from + PAGE - 1)
      if (error) {
        errors[table] = error.message
        break
      }
      const batch = data ?? []
      rows.push(...batch)
      if (batch.length < PAGE) break
      from += PAGE
    }
    tables[table] = rows
    counts[table] = rows.length
  }

  await admin.from('agent_audit_log').insert({
    agent_name: 'admin-export-all',
    action: 'export_full_database',
    status: Object.keys(errors).length ? 'partial' : 'success',
    flags: { tables: Object.keys(tables).length, rows: Object.values(counts).reduce((a, b) => a + b, 0) },
    customer_email: user.email ?? null,
  }).then(() => {}, () => {})

  return json({
    generated_at: new Date().toISOString(),
    table_count: Object.keys(tables).length,
    total_rows: Object.values(counts).reduce((a, b) => a + b, 0),
    counts,
    errors: Object.keys(errors).length ? errors : undefined,
    tables,
  })
})
