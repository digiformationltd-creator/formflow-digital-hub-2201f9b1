import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ insert: mocks.insert }), rpc: mocks.rpc } }));

beforeEach(() => {
  vi.resetModules();
  const values = new Map<string, string>();
  const storage: Storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: key => { values.delete(key); },
    clear: () => values.clear(),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
  vi.stubGlobal('localStorage', storage);
  Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
  vi.clearAllMocks();
  mocks.insert.mockResolvedValue({ error: null });
  mocks.rpc.mockResolvedValue({ error: null });
  Object.defineProperty(document, 'referrer', { configurable: true, value: '' });
});

describe('first-touch and last-touch capture', () => {
  it.each([
    ['https://www.google.co.uk/search?q=test', '', 'google', 'search'],
    ['https://www.bing.com/search?q=test', '', 'bing', 'search'],
    ['https://claude.ai/chat/example', '', 'claude', 'ai'],
    ['', '?utm_source=unknown-campaign&utm_medium=email', 'unknown-campaign', 'referral'],
    ['', '', 'direct', 'direct'],
  ])('dispatches %s %s as %s/%s', async (referrer, query, source, category) => {
    Object.defineProperty(document, 'referrer', { configurable: true, value: referrer });
    window.history.replaceState({}, '', '/contact' + query);
    const { trackPageView } = await import('@/lib/attribution');
    await trackPageView();
    await Promise.resolve();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ detected_source: source, detected_category: category }));
    expect(mocks.rpc).toHaveBeenCalledWith('upsert_visitor_attribution', expect.objectContaining({ payload: expect.objectContaining({ first_source: source, last_source: source }) }));
  });

  it('preserves first touch while moving last touch across a reload', async () => {
    window.history.replaceState({}, '', '/?utm_source=google&utm_medium=cpc&utm_campaign=first');
    const first = await import('@/lib/attribution');
    await first.trackPageView();
    vi.resetModules();
    window.history.replaceState({}, '', '/contact?utm_source=chatgpt&utm_medium=ai&utm_campaign=second');
    const second = await import('@/lib/attribution');
    await second.trackPageView();
    expect(mocks.rpc).toHaveBeenLastCalledWith('upsert_visitor_attribution', expect.objectContaining({ payload: expect.objectContaining({ first_source: 'google', last_source: 'chatgpt', first_campaign: 'first', last_campaign: 'second' }) }));
    expect(second.getAttributionSnapshot().utm_campaign).toBe('second');
  });
});
