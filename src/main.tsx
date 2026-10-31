import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Keep the exported static document visible while the initial route chunk
// loads. Subsequent navigation retains the existing React Router behavior.
const pathname = window.location.pathname;
const initialRoute = pathname === '/' ? () => import('./pages/Index')
  : pathname.startsWith('/blog/') ? () => import('./pages/BlogPost')
  : pathname === '/blog' ? () => import('./pages/BlogIndex')
  : pathname.startsWith('/insights') ? () => import('./pages/InsightPage')
  : pathname === '/uk-services/uk-ltd-formation' ? () => import('./pages/UKLtdFormation')
  : pathname === '/usa-services/us-llc-formation' ? () => import('./pages/UsaLlcFormation')
  : pathname.startsWith('/banks-payment-solutions/') ? () => import('./pages/BankingProviderPage')
  : pathname === '/software-development' ? () => import('./pages/SoftwareDevelopment')
  : () => Promise.resolve();
void initialRoute().catch(error => console.error('[startup] initial route preload failed', error)).finally(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
