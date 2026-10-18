import { describe, expect, it, beforeEach } from "vitest";
import { applySeo } from "@/lib/seo";

describe("route SEO contract", () => {
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
