/**
 * Digibizverse CRM bridge — mirrors website events (orders, enquiries, leads)
 * into the desktop CRM's public event gate, so every order that lands on the
 * site also shows up live in the software with a report + a branded email.
 *
 * Set `VITE_CRM_EVENT_URL` to the software's public URL (its one-click Cloudflare
 * Tunnel address, e.g. https://xxxx.trycloudflare.com). Optionally set
 * `VITE_CRM_EVENT_KEY` if the CRM's SITE_INGEST_KEY is configured. If the URL is
 * not set, this is a silent no-op — checkout is never blocked or delayed.
 */
type CrmEvent =
  | { type: "order"; number?: string; title?: string; amount?: number; currency?: string; name?: string; email?: string; whatsapp?: string; notes?: string }
  | { type: "lead"; name?: string; email?: string; phone?: string; company?: string; source?: string; message?: string }
  | { type: "ticket"; subject?: string; name?: string; email?: string; message?: string };

export function notifyDigibizCrm(event: CrmEvent): void {
  try {
    const base = (import.meta.env.VITE_CRM_EVENT_URL as string | undefined)?.trim().replace(/\/+$/, "");
    if (!base) return; // not configured yet → no-op
    const key = (import.meta.env.VITE_CRM_EVENT_KEY as string | undefined)?.trim();
    // Fire-and-forget; keepalive lets it complete even as the page navigates.
    void fetch(`${base}/api/crm/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { "x-digi-key": key } : {}) },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never break the page */
  }
}
