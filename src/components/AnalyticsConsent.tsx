import { useEffect, useState } from 'react';
import { CONSENT_EVENT, getAnalyticsConsent, setAnalyticsConsent } from '@/lib/analytics-consent';

export default function AnalyticsConsent() {
  // Keep the static export stable; the browser resolves the saved choice.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const sync = () => setVisible(getAnalyticsConsent() === 'unknown');
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  return <>
    <button type="button" className="fixed bottom-3 left-3 z-40 rounded border border-border bg-background px-3 py-2 text-xs text-foreground" onClick={() => setVisible(true)}>Cookie settings</button>
    {visible && <section aria-label="Analytics cookie choices" className="fixed bottom-16 left-3 right-3 z-50 max-w-lg rounded-xl border border-border bg-background p-5 text-foreground shadow-lg">
      <h2 className="text-lg font-semibold">Optional analytics</h2>
      <p className="mt-2 text-sm">With your permission, we use analytics to understand visits and improve the website. You can use our services without accepting and change your choice here anytime. <a href="/privacy-policy" className="underline">Privacy policy</a></p>
      <div className="mt-4 flex gap-3">
        <button type="button" className="rounded border border-border px-4 py-2" onClick={() => { setAnalyticsConsent('denied'); setVisible(false); }}>Reject analytics</button>
        <button type="button" className="rounded border border-border px-4 py-2" onClick={() => { setAnalyticsConsent('granted'); setVisible(false); }}>Accept analytics</button>
      </div>
    </section>}
  </>;
}
