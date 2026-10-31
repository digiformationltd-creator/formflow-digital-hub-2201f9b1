import { useEffect, type DependencyList } from "react";

export type Crumb = { name: string; path: string };

export interface SeoOptions {
  title: string;
  description: string;
  keywords?: string;
  path?: string; // canonical path, e.g. /uk-services/uk-ltd-formation
  image?: string;
  type?: "website" | "article" | "product";
  breadcrumbs?: Crumb[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

export const CANONICAL_DOMAIN = "https://www.digiformation.co.uk";
export const ORG_NAME = "Digiformation Ltd";
export const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e1a9b0ff-8dd8-4ac0-9e91-93c8f05bf262/id-preview-c28e8368--7fdd4386-cc12-4de2-bfa1-e37e725edfcd.lovable.app-1777405986202.png";

const upsertMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  const [first, ...duplicates] = document.querySelectorAll<HTMLMetaElement>(selector);
  duplicates.forEach((duplicate) => duplicate.remove());
  let el = first ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setName = (n: string, c: string) => upsertMeta(`meta[name="${n}"]`, "name", n, c);
const setProp = (p: string, c: string) => upsertMeta(`meta[property="${p}"]`, "property", p, c);

const setCanonical = (href: string) => {
  const links = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
  const [first, ...duplicates] = links;
  duplicates.forEach((link) => link.remove());
  let el = first ?? null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

// Prerender serializes script text into HTML. Escape HTML delimiters while
// preserving the original JSON value after parsing.
export const serializeJsonLd = (data: unknown): string => {
  const json = JSON.stringify(data);
  if (json === undefined) throw new TypeError('JSON-LD requires a serializable value');
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
};

const setJsonLd = (id: string, data: unknown) => {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.text = serializeJsonLd(data);
};

const removeJsonLd = (id: string) => document.getElementById(id)?.remove();

const normalizePath = (path: string) => {
  const pathname = path.split(/[?#]/, 1)[0];
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
};

export const applySeo = (opts: SeoOptions) => {
  const relPath = opts.path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const cleanPath = normalizePath(relPath);
  const fullCanonical = `${CANONICAL_DOMAIN}${cleanPath}`;
  
  const image = opts.image
    ? (opts.image.startsWith("http") ? opts.image : `${CANONICAL_DOMAIN}${opts.image.startsWith("/") ? "" : "/"}${opts.image}`)
    : DEFAULT_IMAGE;

  document.querySelectorAll("title").forEach((title, index) => { if (index > 0) title.remove(); });
  document.title = opts.title;
  setName("description", opts.description);
  if (opts.keywords) setName("keywords", opts.keywords);
  else document.querySelectorAll('meta[name="keywords"]').forEach((meta) => meta.remove());
  setName(
    "robots",
    opts.noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  );
  setName('googlebot', opts.noindex ? 'noindex, nofollow' : 'index, follow');
  setName("author", ORG_NAME);

  // Open Graph
  setProp("og:title", opts.title);
  setProp("og:description", opts.description);
  setProp("og:type", opts.type || "website");
  setProp("og:url", fullCanonical);
  setProp("og:image", image);
  setProp("og:image:alt", `${opts.title} — ${ORG_NAME}`);
  setProp("og:site_name", ORG_NAME);
  setProp("og:locale", "en_GB");

  // Twitter
  setName("twitter:card", "summary_large_image");
  setName("twitter:title", opts.title);
  setName("twitter:description", opts.description);
  setName("twitter:image", image);
  setName("twitter:site", "@Digiformation00");
  setName("twitter:creator", "@Digiformation00");

  setCanonical(fullCanonical);
  // This site currently has one English edition, not invented regional editions.
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
  for (const language of ['en', 'x-default']) {
    const alternate = document.createElement('link');
    alternate.rel = 'alternate';
    alternate.hreflang = language;
    document.head.appendChild(alternate);
    alternate.href = fullCanonical;
  }

  // Remove route-owned JSON-LD before applying the next route's values. This
  // prevents stale breadcrumb/article schema after client-side navigation.
  if (opts.breadcrumbs && opts.breadcrumbs.length) {
    setJsonLd("ldjson-breadcrumbs", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: opts.breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.path.startsWith("http") ? b.path : `${CANONICAL_DOMAIN}${b.path.startsWith("/") ? "" : "/"}${b.path}`,
      })),
    });
  } else {
    removeJsonLd("ldjson-breadcrumbs");
  }

  // Page-specific JSON-LD
  if (opts.jsonLd) {
    setJsonLd("ldjson-page", opts.jsonLd);
  } else {
    removeJsonLd("ldjson-page");
  }
};

export const useSeo = (opts: SeoOptions, _deps: DependencyList = []) => {
  // Applying after every committed render also handles route/parameter changes.
  // This writes head DOM only, never React state, and avoids stale captured options.
  useEffect(() => {
    applySeo(opts);
  });
};

/** Reset route-owned head state before a new route applies its specific SEO. */
export const resetRouteSeo = (pathname: string) => {
  const path = normalizePath(pathname);
  document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]').forEach((script) => {
    // The source document owns the global graph; every other schema belongs to
    // the outgoing route and must not survive a lazy SPA transition.
    if (script.id !== 'ldjson-global') script.remove();
  });
  const noindex = /(?:\/checkout$|^\/(?:auth|reset-password|dashboard|admin|checkout|unsubscribe|client-area)(?:\/|$))/.test(path);
  applySeo({
    title: `${path.split('/').filter(Boolean).join(' — ').replace(/-/g, ' ') || 'DigiFormation'} | DigiFormation`,
    description: 'DigiFormation company formation, compliance and digital business services.',
    path,
    noindex,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${CANONICAL_DOMAIN}${path}#webpage`, url: `${CANONICAL_DOMAIN}${path}` },
  });
};
