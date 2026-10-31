import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), maybeSingle: vi.fn(), eq: vi.fn(), select: vi.fn(), from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getSession: mocks.getSession }, from: mocks.from } }));
import { checkAdminSession, clearAdminCache, isOwnerEmail } from '@/lib/auth/session';

beforeEach(() => {
  vi.clearAllMocks(); clearAdminCache();
  const query = { select: mocks.select, eq: mocks.eq, maybeSingle: mocks.maybeSingle };
  mocks.from.mockReturnValue(query); mocks.select.mockReturnValue(query); mocks.eq.mockReturnValue(query);
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'offline-user', email: 'client@example.test' } } }, error: null });
});
describe('owner and admin session regression', () => {
  it.each(['info@digiformation.co.uk', 'info@digiformation.uk', ' INFO@DIGIFORMATION.CO.UK '])('recognizes the configured owner without ReferenceError: %s', email => expect(isOwnerEmail(email)).toBe(true));
  it.each([undefined, null, '', 'info@digiformation.co.uk.example.test', 'other@example.test'])('rejects absent or lookalike owner emails: %s', email => expect(isOwnerEmail(email)).toBe(false));
  it('does not authorize an ordinary customer as an admin', async () => { expect(await checkAdminSession()).toEqual({ ok: false, reason: 'not_admin' }); expect(mocks.eq).toHaveBeenCalledWith('user_id', 'offline-user'); });
  it('accepts a real returned admin-role row and caches that user only', async () => { mocks.maybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null }); expect((await checkAdminSession()).ok).toBe(true); expect((await checkAdminSession()).ok).toBe(true); expect(mocks.maybeSingle).toHaveBeenCalledTimes(1); });
  it('fails closed on role lookup failure', async () => { mocks.maybeSingle.mockResolvedValue({ data: null, error: new Error('offline failure') }); expect(await checkAdminSession()).toEqual({ ok: false, reason: 'role_check_failed' }); });
  it('does not query roles for signed-out visitors', async () => { mocks.getSession.mockResolvedValue({ data: { session: null }, error: null }); expect(await checkAdminSession()).toEqual({ ok: false, reason: 'signed_out' }); expect(mocks.from).not.toHaveBeenCalled(); });
});
