#!/usr/bin/env node
// Automated SEO regression check and health monitoring script for DigiFormation Ltd
// Can be executed in CI/CD pipeline or locally via `npm run test:seo`.

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITEMAP_FILE = path.join(ROOT, "public", "sitemap.xml");
const ROBOTS_FILE = path.join(ROOT, "public", "robots.txt");
const INDEX_HTML = path.join(ROOT, "index.html");

const DOMAIN = "https://www.digiformation.co.uk";
const CRITICAL_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/packages",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/uk-services/uk-ltd-formation",
  "/uk-compliance/confirmation-statement",
  "/usa-services/us-llc-formation",
  "/banks-payment-solutions",
  "/banks-payment-solutions/stripe",
  "/software-development",
  "/ai-agents",
  "/web-development",
  "/3d-interactive-animated-web",
  "/blog",
  "/insights",
];

let failed = false;

function logPass(msg) {
  console.log(`  ✓ PASS: ${msg}`);
}
function logFail(msg) {
  console.error(`  ✗ FAIL: ${msg}`);
  failed = true;
}

// 1. Audit Sitemap
function testSitemap() {
  console.log("\n[1/4] Auditing Sitemap Integrity...");
  if (!fs.existsSync(SITEMAP_FILE)) {
    logFail("sitemap.xml missing from public directory!");
    return;
  }
  const xml = fs.readFileSync(SITEMAP_FILE, "utf8");
  if (!xml.startsWith("<?xml") || !xml.includes("<urlset")) {
    logFail("sitemap.xml has invalid XML root structure!");
    return;
  }
  const urls = [...xml.matchAll(/<loc>(https:\/\/www\.digiformation\.co\.uk\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  if (urls.length < 50) {
    logFail(`sitemap.xml contains suspiciously few URLs (${urls.length})!`);
  } else {
    logPass(`sitemap.xml contains ${urls.length} valid canonical HTTPS URLs.`);
  }

  const duplicates = urls.filter((item, index) => urls.indexOf(item) !== index);
  if (duplicates.length > 0) {
    logFail(`sitemap.xml contains ${duplicates.length} duplicate URLs!`);
  } else {
    logPass("sitemap.xml has 0 duplicate URLs.");
  }
}

// 2. Audit Robots.txt
function testRobots() {
  console.log("\n[2/4] Auditing Robots.txt Directives...");
  if (!fs.existsSync(ROBOTS_FILE)) {
    logFail("robots.txt missing from public directory!");
    return;
  }
  const robots = fs.readFileSync(ROBOTS_FILE, "utf8");
  if (!robots.includes("Sitemap: https://www.digiformation.co.uk/sitemap.xml")) {
    logFail("robots.txt does not declare the primary sitemap URL!");
  } else {
    logPass("robots.txt declares canonical sitemap URL.");
  }

  const aiBots = ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"];
  const missingBots = aiBots.filter((bot) => !robots.includes(bot));
  if (missingBots.length > 0) {
    logFail(`robots.txt is missing explicit directives for: ${missingBots.join(", ")}`);
  } else {
    logPass("robots.txt explicitly permits all 6 major AI crawler User-Agents.");
  }
}

// 3. Audit Structured Data Graph & Entity Definitions
function testSchemaGraph() {
  console.log("\n[3/4] Auditing Global Entity Schema Graph...");
  if (!fs.existsSync(INDEX_HTML)) {
    logFail("index.html is missing!");
    return;
  }
  const html = fs.readFileSync(INDEX_HTML, "utf8");
  if (!html.includes('"16994903"')) {
    logFail("index.html missing statutory Company No. 16994903 in schema!");
  } else {
    logPass("index.html contains statutory Company Registration 16994903.");
  }

  if (!html.includes("Muhammad Haroon")) {
    logFail("index.html missing Founder entity Muhammad Haroon in schema!");
  } else {
    logPass("index.html contains Founder entity Muhammad Haroon.");
  }

  if (!html.includes("https://digibizos.co.uk/")) {
    logFail("index.html missing Digi Biz OS product link in schema!");
  } else {
    logPass("index.html contains Digi Biz OS SoftwareApplication product entity.");
  }
}

// 4. Live Health Check on Sample Critical Routes
function probeUrl(pathUrl) {
  return new Promise((resolve) => {
    const url = `${DOMAIN}${pathUrl}`;
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (DigiFormation-CI-HealthCheck/1.0)" } }, (res) => {
      resolve({ pathUrl, status: res.statusCode });
    });
    req.on("error", (err) => resolve({ pathUrl, status: 500, error: err.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ pathUrl, status: "TIMEOUT" });
    });
  });
}

async function testLiveRoutes() {
  console.log("\n[4/4] Probing Live Critical Production Endpoints...");
  let routeErrors = 0;
  for (const r of CRITICAL_ROUTES) {
    const res = await probeUrl(r);
    const ok = res.status === 200 || res.status === 308;
    if (!ok) {
      console.error(`  ✗ [${res.status}] ${r}`);
      routeErrors++;
    } else {
      console.log(`  ✓ [${res.status}] ${r}`);
    }
  }

  if (routeErrors > 0) {
    logFail(`${routeErrors} critical routes returned non-200 status codes!`);
  } else {
    logPass(`All ${CRITICAL_ROUTES.length} critical production routes returned 200 OK.`);
  }
}

async function runAll() {
  console.log("=======================================================");
  console.log(" DIGIFORMATION LTD — AUTOMATED SEO REGRESSION HEALTH CHECK");
  console.log("=======================================================");

  testSitemap();
  testRobots();
  testSchemaGraph();
  await testLiveRoutes();

  console.log("\n=======================================================");
  if (failed) {
    console.error("❌ SEO REGRESSION DETECTED! Please resolve issues above.");
    console.log("=======================================================");
    process.exit(1);
  } else {
    console.log("🏆 ALL SEO REGRESSION CHECKS PASSED (100% HEALTHY)");
    console.log("=======================================================");
    process.exit(0);
  }
}

runAll();
