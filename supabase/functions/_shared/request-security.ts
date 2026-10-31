import { createClient } from 'npm:@supabase/supabase-js@2'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// A decoded JWT role is not authentication. Compare the configured service key
// or verify the real human caller with Auth and an admin role lookup.
export function secretMatches(received: string, expected: string): boolean {
  if (!received || !expected || received.length !== expected.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index++) {
    difference |= received.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  return difference === 0
}

export function isServiceRequest(request: Request, serviceKey: string): boolean {
  const authorization = request.headers.get('Authorization') || ''
  return authorization.startsWith('Bearer ') && secretMatches(authorization.slice(7).trim(), serviceKey)
}

export async function authorizeAutomation(request: Request): Promise<200 | 401 | 403 | 503> {
  const url = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!url || !serviceKey) return 503
  if (isServiceRequest(request, serviceKey)) return 200
  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ') || !authorization.slice(7).trim()) return 401
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  if (!anonKey) return 503
  try {
    const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) return 401
    const { data: role, error: roleError } = await client.from('user_roles')
      .select('role').eq('user_id', data.user.id).eq('role', 'admin').maybeSingle()
    if (roleError) return 503
    return role ? 200 : 403
  } catch {
    return 503
  }
}

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })
}

export async function readBoundedText(request: Request, maximumBytes = 32768): Promise<string> {
  const length = Number(request.headers.get('content-length'))
  if (Number.isFinite(length) && length > maximumBytes) throw new RangeError('Payload too large')
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('JSON body required')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > maximumBytes) {
        await reader.cancel()
        throw new RangeError('Payload too large')
      }
      chunks.push(chunk.value)
    }
  } finally {
    reader.releaseLock()
  }
  const buffer = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength }
  return new TextDecoder().decode(buffer)
}

export async function readBoundedJson(request: Request, maximumBytes = 32768): Promise<unknown> {
  return JSON.parse(await readBoundedText(request, maximumBytes))
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
