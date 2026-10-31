import { describe, expect, it, beforeEach } from "vitest";
import { applySeo, resetRouteSeo, serializeJsonLd } from "@/lib/seo";

describe("route SEO contract", () => {
  it('serializes embedded HTML safely without changing JSON content', () => {
    const value = { '@type': 'Article', headline: '</script><script>globalThis.pwned=true</script>&\u2028\u2029' };
    const encoded = serializeJsonLd(value);
    expect(encoded).not.toContain('<');
    expect(JSON.parse(encoded)).toEqual(value);
    document.head.innerHTML = `<script type="application/ld+json">${encoded}</script>`;
    expect(document.head.querySelectorAll('script')).toHaveLength(1);
  });
  it('removes outgoing route graphs while preserving the explicitly owned global graph', () => {
    document.head.innerHTML = '<script id="ldjson-global" type="application/ld+json">{"@graph":[]}</script><script id="outgoing-graph" type="application/ld+json">{"@graph":[{"@type":"Article"}]}</script>';
    resetRouteSeo('/contact');
    expect(document.getElementById('ldjson-global')).not.toBeNull();
    expect(document.getElementById('outgoing-graph')).toBeNull();
  });
  it('clears article schema and moves canonical/hreflang through SPA routes', () => {
    for (const path of ['/blog/first', '/insights/report', '/contact', '/checkout', '/uk-services']) {
      resetRouteSeo(path);
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://www.digiformation.co.uk${path}`);
      for (const language of ['en', 'x-default']) expect(document.querySelector(`link[hreflang="${language}"]`)?.getAttribute('href')).toBe(`https://www.digiformation.co.uk${path}`);
      expect(document.querySelectorAll('#ldjson-page')).toHaveLength(1);
      expect(document.getElementById('ldjson-page')?.textContent).not.toContain('BlogPosting');
      expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe(path === '/checkout' ? 'noindex, nofollow' : 'index, follow');
      applySeo({ title: 'Article', description: 'Article', path, jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', url: `https://www.digiformation.co.uk${path}` } });
    }
  });
  beforeEach(() => {
    document.head.innerHTML = `
      <title>Shell</title>
      <meta name="description" content="shell" />
      <link rel="canonical" href="https://www.digiformation.co.uk/" />
      <link rel="canonical" href="https://www.digiformation.co.uk/duplicate" />
      <script id="ldjson-breadcrumbs" type="application/ld+json">{"stale":true}</script>
      <script id="ldjson-page" type="application/ld+json">{"stale":true}</script>
    `;
  });

  it("normalizes canonical URLs and removes stale route schema", () => {
    applySeo({
      title: "Example route",
      description: "Example description",
      path: "/example///",
    });

    expect(document.title).toBe("Example route");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Example description");
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.digiformation.co.uk/example",
    );
    expect(document.getElementById("ldjson-breadcrumbs")).toBeNull();
    expect(document.getElementById("ldjson-page")).toBeNull();
  });

  it("writes route schema and breadcrumbs without duplicate canonical nodes", () => {
    applySeo({
      title: "Article route",
      description: "Article description",
      path: "/blog/example",
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Article", path: "/blog/example" }],
      jsonLd: { "@context": "https://schema.org", "@type": "BlogPosting", headline: "Article route" },
    });

    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.getElementById("ldjson-breadcrumbs")?.textContent).toContain("BreadcrumbList");
    expect(document.getElementById("ldjson-page")?.textContent).toContain("BlogPosting");
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute("content")).toContain("Article route");
  });
});
