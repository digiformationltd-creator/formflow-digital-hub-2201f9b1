#!/usr/bin/env node
// Automated IndexNow protocol URL submission script for DigiFormation Ltd
// Pings https://api.indexnow.org/indexnow to notify Bing, Yandex, and IndexNow crawlers.

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");

const HOST = "www.digiformation.co.uk";
// Default IndexNow validation key identifier
const KEY = "digiformation-indexnow-2026";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function getSitemapUrls() {
  if (!fs.existsSync(SITEMAP)) {
    console.error("Sitemap not found at:", SITEMAP);
    return [];
  }
  const xml = fs.readFileSync(SITEMAP, "utf8");
  const urls = [];
  const regex = /<loc>(https:\/\/www\.digiformation\.co\.uk\/[^<]*)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

export function submitToIndexNow(urlList, dryRun = true) {
  return new Promise((resolve) => {
    const urls = urlList || getSitemapUrls().slice(0, 10);
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });

    console.log(`[IndexNow] Preparing submission of ${urls.length} URLs for host: ${HOST}`);
    console.log(`[IndexNow] Key Location: ${KEY_LOCATION}`);

    if (dryRun) {
      console.log(`[IndexNow] Dry-run verification completed successfully. Payload ready for submission.`);
      resolve({ status: 200, dryRun: true, count: urls.length });
      return;
    }

    const req = https.request(
      {
        hostname: "api.indexnow.org",
        port: 443,
        path: "/indexnow",
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => { resData += chunk; });
        res.on("end", () => {
          console.log(`[IndexNow API] Status: ${res.statusCode} ${res.statusMessage}`);
          resolve({ status: res.statusCode, body: resData, count: urls.length });
        });
      }
    );

    req.on("error", (err) => {
      console.error(`[IndexNow API Error] ${err.message}`);
      resolve({ status: 500, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

// If executed directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isLive = process.argv.includes("--live");
  submitToIndexNow(undefined, !isLive);
}
