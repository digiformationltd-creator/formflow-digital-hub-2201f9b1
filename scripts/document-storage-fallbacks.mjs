// Mechanical cleanup: document deliberately swallowed browser-storage errors.
// Storage is best effort and the existing UI fallback must stay unchanged.
import fs from 'node:fs';
for (const name of ['src/lib/attribution.ts', 'src/businessos/lib/addressDraft.ts', 'src/components/checkout/CheckoutFlow.tsx']) {
  const file = new URL('../' + name, import.meta.url);
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/catch\s*\{\s*\}/g, 'catch { /* Browser storage may be unavailable; preserve the in-memory UI state. */ }');
  if (after !== before) fs.writeFileSync(file, after);
}
