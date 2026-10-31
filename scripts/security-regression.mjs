// Deterministic handler tests only. Never imports the real SDK, env or network.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const results = [], sources = {};
const service = 'OFFLINE_SERVICE_FIXTURE_ONLY';
const inboundSecret = 'OFFLINE_INBOUND_FIXTURE_32_CHARACTERS_ONLY';
const prospectId = '00000000-0000-4000-8000-000000000001';
const prospect = { id: prospectId, business_name: 'Offline example', contact_email: 'example@example.test', has_website: true, country: 'UK' };

function sandbox({ admin = false, invalidUser = false, missingConfig = false, failRpc = false, rateLimit = false } = {}) {
  const cache = new Map(), calls = [], receipts = new Set(), claims = new Set();
  let network = 0, handler;
  const client = {
    auth: { getUser: async () => ({ data: { user: invalidUser ? null : { id: prospectId } }, error: invalidUser ? new Error('invalid') : null }) },
    from: (table) => {
      calls.push({ op: 'from', table });
      const chain = {};
      for (const op of ['select', 'eq', 'update', 'insert']) chain[op] = (...args) => { if (op === 'update' || op === 'insert') calls.push({ op, table, args }); return chain; };
      chain.maybeSingle = async () => ({ data: admin ? { role: 'admin' } : null, error: null });
      return chain;
    },
    rpc: async (name, args) => {
      calls.push({ op: 'rpc', name });
      if (failRpc) return { data: null, error: new Error('sensitive backend detail') };
      if (rateLimit) return { data: { rate_limited: true }, error: null };
      if (name === 'process_prospect_inbound_reply') {
        const duplicate = receipts.has(args.p_message_id); receipts.add(args.p_message_id);
        return { data: { duplicate, matched: true }, error: null };
      }
      if (name === 'claim_prospect_qualification') {
        const claimed = !claims.has(args.p_prospect_id); claims.add(args.p_prospect_id);
        return { data: { claimed, claim_token: prospectId, prospect }, error: null };
      }
      if (name === 'finish_prospect_qualification') return { data: { finished: true, campaign: args.p_result.primary }, error: null };
      throw new Error('Unexpected RPC');
    },
  };
  const env = new Map([['SUPABASE_URL', 'https://never-contact.invalid'], ['SUPABASE_SERVICE_ROLE_KEY', service], ['SUPABASE_ANON_KEY', 'OFFLINE_ANON_ONLY'], ['PROSPECT_INBOUND_SECRET', inboundSecret], ['LOVABLE_API_KEY', ''], ['ORDER_AGENT_API_KEY', 'OFFLINE_ORDER_AGENT_ONLY']]);
  function load(filename) {
    const full = path.resolve(root, filename);
    if (cache.has(full)) return cache.get(full);
    const source = fs.readFileSync(full, 'utf8');
    sources[path.relative(root, full)] = createHash('sha256').update(source).digest('hex');
    const exports = {}; cache.set(full, exports);
    vm.runInNewContext(ts.transpileModule(source, { fileName: full, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
      exports, Request, Response, Headers, TextDecoder, Uint8Array, AbortSignal, Date, RangeError, SyntaxError, crypto: globalThis.crypto,
      require: (specifier) => specifier.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(full), specifier))) : specifier.endsWith('/cors') ? { corsHeaders: {} } : /^(?:npm|jsr):@supabase\//.test(specifier) ? { createClient: () => { calls.push({ op: 'client' }); return client; } } : (() => { throw new Error('Unexpected import'); })(),
      Deno: { env: { get: key => missingConfig ? undefined : env.get(key) }, serve: fn => { handler = fn; } },
      console: { error() {}, warn() {}, log() {} },
      fetch: async () => { network++; throw new Error('NETWORK_DISABLED'); },
    }, { filename: full, timeout: 1000 });
    return exports;
  }
  return { load, calls, network: () => network, invoke: (body, headers = {}, method = 'POST') => handler(new Request('https://offline.invalid/test', { method, headers: { 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) })) };
}
async function test(id, fn) {
  const started = Date.now();
  try { await fn(); results.push({ id, pass: true, ms: Date.now() - started }); }
  catch (error) { results.push({ id, pass: false, error: error.message }); }
}
const inbound = 'supabase/functions/prospect-inbound-reply/index.ts';
const qualifier = 'supabase/functions/qualify-prospect-now/index.ts';
const payload = { from: 'example@example.test', message_id: 'event-offline-1', subject: 'Offline', text: 'Fixture' };
for (const endpoint of [inbound, qualifier]) {
  for (const [label, headers] of [['anonymous', {}], ['forged-role', { Authorization: 'Bearer eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.' }], ['ordinary-user', { Authorization: 'Bearer OFFLINE_ORDINARY_USER' }]]) {
    await test(endpoint.split('/')[2] + '-' + label, async () => {
      const fake = sandbox(); fake.load(endpoint);
      const response = await fake.invoke(endpoint === inbound ? payload : { prospect_id: prospectId }, headers);
      assert.equal(response.status, 401); assert.equal(fake.calls.length, 0); assert.equal(fake.network(), 0);
    });
  }
  await test(endpoint.split('/')[2] + '-missing-config', async () => {
    const fake = sandbox({ missingConfig: true }); fake.load(endpoint);
    assert.equal((await fake.invoke(payload)).status, 503); assert.equal(fake.calls.length, 0);
  });
}
const inboundHeaders = { 'X-Prospect-Inbound-Secret': inboundSecret };
await test('inbound-authorized-and-replay', async () => {
  const fake = sandbox(); fake.load(inbound);
  assert.equal((await fake.invoke(payload, inboundHeaders)).status, 200);
  assert.equal((await (await fake.invoke(payload, inboundHeaders)).json()).duplicate, true);
  assert.equal(fake.calls.filter(call => call.op === 'rpc').length, 2);
  assert.equal(fake.calls.some(call => call.op === 'from'), false);
});
for (const [label, body, status] of [['invalid-json', '{', 400], ['missing-id', { from: payload.from }, 400], ['oversize', { ...payload, text: 'x'.repeat(33000) }, 413], ['invalid-sender', { ...payload, from: '*%' }, 400]]) {
  await test('inbound-' + label, async () => { const fake = sandbox(); fake.load(inbound); assert.equal((await fake.invoke(body, inboundHeaders)).status, status); assert.equal(fake.calls.length, 0); });
}
for (const [label, config, status] of [['database-error', { failRpc: true }, 503], ['abuse-cap', { rateLimit: true }, 429]]) {
  await test('inbound-' + label, async () => { const fake = sandbox(config); fake.load(inbound); const response = await fake.invoke(payload, inboundHeaders); assert.equal(response.status, status); assert.doesNotMatch(await response.text(), /sensitive backend detail/); });
}
const serviceHeaders = { Authorization: 'Bearer ' + service };
await test('qualifier-authorized-and-replay', async () => {
  const fake = sandbox(); fake.load(qualifier);
  assert.equal((await (await fake.invoke({ prospect_id: prospectId }, serviceHeaders)).json()).ok, true);
  assert.equal((await (await fake.invoke({ prospect_id: prospectId }, serviceHeaders)).json()).skipped, true);
  assert.equal(fake.calls.filter(call => call.name === 'finish_prospect_qualification').length, 1); assert.equal(fake.network(), 0);
});
await test('qualifier-invalid-id', async () => { const fake = sandbox(); fake.load(qualifier); assert.equal((await fake.invoke({ prospect_id: 'bad' }, serviceHeaders)).status, 400); assert.equal(fake.calls.length, 0); });
for (const [label, config, status] of [['ordinary-cross-user', {}, 403], ['verified-admin', { admin: true }, 200], ['invalid-token', { invalidUser: true }, 401]]) {
  await test('automation-' + label, async () => { const fake = sandbox(config); const helper = fake.load('supabase/functions/_shared/request-security.ts'); assert.equal(await helper.authorizeAutomation(new Request('https://offline.invalid', { headers: { Authorization: 'Bearer OFFLINE_HUMAN' } })), status); assert.equal(fake.network(), 0); });
}
const campaign = 'supabase/functions/prospect-campaign-control/index.ts';
for (const [label, body, status] of [
  ['null', null, 400], ['array', [], 400], ['bad-id', { prospect_id: 'bad', action: 'stop' }, 400],
  ['bad-action', { prospect_id: prospectId, action: 'delete' }, 400],
  ['object-reason', { prospect_id: prospectId, action: 'stop', reason: {} }, 400],
  ['array-payload', { prospect_id: prospectId, action: 'order', payload: [] }, 400],
  ['oversize', { prospect_id: prospectId, action: 'stop', detail: 'x'.repeat(33000) }, 413],
  ['valid-enroll', { prospect_id: prospectId, action: 'enroll' }, 200],
]) await test('campaign-' + label, async () => {
  const fake = sandbox({ admin: true }); fake.load(campaign);
  const response = await fake.invoke(body, { Authorization: 'Bearer OFFLINE_ADMIN' });
  assert.equal(response.status, status);
  assert.equal(fake.calls.some(c => c.op === 'update' || c.op === 'insert'), status === 200);
  assert.equal(fake.network(), 0);
});
await test('campaign-ordinary-user-denied', async () => {
  const fake = sandbox(); fake.load(campaign);
  assert.equal((await fake.invoke({ prospect_id: prospectId, action: 'enroll' }, { Authorization: 'Bearer OFFLINE_USER' })).status, 403);
  assert.equal(fake.calls.some(c => c.op === 'update' || c.op === 'insert'), false);
});
await test('campaign-get-denied-before-sdk', async () => {
  const fake = sandbox(); fake.load(campaign);
  assert.equal((await fake.invoke(null, {}, 'GET')).status, 405); assert.equal(fake.calls.length, 0);
});
for (const [label, body, status] of [['null', null, 400], ['array', [], 400], ['malformed', '{', 400], ['oversize', { text: 'x'.repeat(33000) }, 413], ['empty-text', { text: '' }, 400]]) {
  await test('ai-parse-' + label, async () => {
    const fake = sandbox(); fake.load('supabase/functions/ai-command-parse/index.ts');
    assert.equal((await fake.invoke(body)).status, status); assert.equal(fake.network(), 0); assert.equal(fake.calls.length, 0);
  });
}
for (const [label, value] of [['null', null], ['array', []], ['text-object', { customerName: {} }], ['nonfinite-days', { daysRemaining: 'Infinity' }], ['blank-days', { daysRemaining: '' }], ['paragraph-object', { paragraphs: [{}] }], ['bad-document', { documents: [{ url: 'https://example.test' }] }]]) await test('email-data-reject-' + label, async () => {
  const fake = sandbox(); const helper = fake.load('supabase/functions/_shared/email-template-data.ts');
  assert.throws(() => helper.decodeEmailTemplateData(value)); assert.equal(fake.network(), 0);
});
await test('email-data-known-contract-and-normalization', async () => {
  const fake = sandbox(); const helper = fake.load('supabase/functions/_shared/email-template-data.ts');
  const data = helper.decodeEmailTemplateData({ customerName: 'Fixture', daysRemaining: '4', paragraphs: ['Fixture'], documents: [{ label: 'Fixture', url: 'https://example.test/doc', filename: 'fixture.pdf' }], user_id: prospectId, unexpected: { ignored: true } });
  assert.equal(data.daysRemaining, 4); assert.equal(data.customerName, 'Fixture'); assert.equal(data.documents[0].filename, 'fixture.pdf'); assert.equal(data.user_id, prospectId); assert.equal(data.unexpected, undefined); assert.equal(data.heading, '');
});
const validOrder = { service_slug: 'uk-ltd-formation', checkout_request_id: 'offline-checkout-1', amount_gbp: 100, customer: { full_name: 'Offline Fixture', email: 'fixture@example.test' } };
for (const [label, value, expected] of [
  ['minimal-valid', validOrder, true],
  ['nested-valid', { ...validOrder, currency: 'GBP', order: { notes: 'Fixture', kyc_verified: false, details: [{ label: 'Fixture', value: 'Fixture' }] }, documents: [{ label: 'Fixture', filename: 'fixture.pdf', path: 'offline/fixture.pdf' }] }, true],
  ['array-body', [], false], ['bad-customer', { ...validOrder, customer: [] }, false],
  ['object-phone', { ...validOrder, customer: { ...validOrder.customer, whatsapp: {} } }, false],
  ['unsupported-currency', { ...validOrder, currency: 'BAD' }, false],
  ['negative-price', { ...validOrder, amount_gbp: -1 }, false],
  ['string-kyc', { ...validOrder, order: { kyc_verified: 'true' } }, false],
  ['bad-details', { ...validOrder, order: { details: [{ label: 'Fixture', value: {} }] } }, false],
  ['null-document', { ...validOrder, documents: [null] }, false],
  ['missing-document-content', { ...validOrder, documents: [{ label: 'Fixture', filename: 'fixture.pdf' }] }, false],
  ['traversal-document', { ...validOrder, documents: [{ label: 'Fixture', filename: 'fixture.pdf', path: '../other/fixture.pdf' }] }, false],
]) await test('order-data-' + label, async () => {
  const fake = sandbox(); const helper = fake.load('supabase/functions/_shared/order-agent-request.ts');
  assert.equal(helper.isValidAgentOrder(value), expected); assert.equal(fake.network(), 0);
});
for (const [label, body, status, headers] of [
  ['no-key', validOrder, 401, {}],
  ['null', null, 400, { 'X-Agent-API-Key': 'OFFLINE_ORDER_AGENT_ONLY' }],
  ['malformed-json', '{', 400, { 'X-Agent-API-Key': 'OFFLINE_ORDER_AGENT_ONLY' }],
  ['nested-invalid', { ...validOrder, customer: { ...validOrder.customer, whatsapp: {} }, documents: [{ label: 'Fixture', filename: 'fixture.pdf', base64: 'PRIVATE_OFFLINE_DOCUMENT_MARKER' }], unexpected_password: 'PRIVATE_OFFLINE_PASSWORD_MARKER' }, 400, { 'X-Agent-API-Key': 'OFFLINE_ORDER_AGENT_ONLY' }],
  ['declared-oversize', validOrder, 413, { 'X-Agent-API-Key': 'OFFLINE_ORDER_AGENT_ONLY', 'content-length': String(8 * 1024 * 1024 + 1) }],
  ['valid-reaches-catalog', validOrder, 400, { 'X-Agent-API-Key': 'OFFLINE_ORDER_AGENT_ONLY' }],
]) await test('order-handler-' + label, async () => {
  const fake = sandbox(); fake.load('supabase/functions/agent-create-order/index.ts');
  const response = await fake.invoke(body, headers);
  assert.equal(response.status, status); assert.equal(fake.network(), 0);
  if (label === 'valid-reaches-catalog') {
    assert.equal((await response.json()).error, 'Unknown service_slug');
    assert.equal(fake.calls.some(c => c.op === 'from' && c.table === 'services'), true);
  }
  assert.doesNotMatch(JSON.stringify(fake.calls), /PRIVATE_OFFLINE_DOCUMENT_MARKER|PRIVATE_OFFLINE_PASSWORD_MARKER/);
});
const output = { at: new Date().toISOString(), scope: 'Node VM offline handler contracts, not Deno or PostgreSQL integration', allPassed: results.every(result => result.pass), results, sources, actualDatabaseCalls: 0, actualNetworkCalls: 0, limitations: ['SQL transactional/concurrent replay semantics are mocked, not executed', 'Migration NOT APPLIED', 'Provider adapter and Vault deployment configuration NOT VERIFIED', 'No actual tenant records queried', 'SMTP rendering/delivery and native auth webhook SDK parser not exercised'] };
fs.mkdirSync(path.join(root, 'audit/phase-02'), { recursive: true });
fs.writeFileSync(path.join(root, 'audit/phase-02/security-regression.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify({ passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass), scope: output.scope }, null, 2));
if (!output.allPassed) process.exitCode = 1;
