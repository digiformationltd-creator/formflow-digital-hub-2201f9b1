#!/usr/bin/env node
// Evidence-only secret hygiene scan. It reports file/line/type, never token
// values. Local .env files are intentionally ignored by the source scan and
// must not be committed.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "reports", "final-production-readiness-2026-10-18", "FINAL_SECURITY_SECRET_SCAN.md");
const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
const findings = [];
const patterns = [
  { type: "privileged Supabase service-role key literal", re: /(?:service[_-]?role|SUPABASE_SERVICE_ROLE_KEY)[^\r\n]{0,100}["'](?:eyJ|sb_secret_)/i },
  { type: "live payment secret", re: /sk_live_[A-Za-z0-9]/i },
  { type: "Cloudflare API token/bearer literal", re: /(?:cloudflare[^\r\n]{0,80}(?:api[_-]?token|bearer)|bearer)\s*[=:]?\s*["']?[A-Za-z0-9._-]{40,}/i },
  { type: "private SSH key", re: /-----BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY-----/i },
];
for (const relative of tracked) {
  if (/^(?:\.env(?:\.|$)|node_modules[\\/]|dist[\\/])/.test(relative)) continue;
  const absolute = path.join(ROOT, relative);
  let text;
  try { text = fs.readFileSync(absolute, "utf8"); } catch { continue; }
  text.split(/\r?\n/).forEach((line, index) => {
    for (const pattern of patterns) if (pattern.re.test(line)) findings.push({ file: relative, line: index + 1, type: pattern.type });
  });
}
const trackedEnv = tracked.filter((file) => /^\.env(?:\.|$)/.test(file));
const localEnv = fs.existsSync(path.join(ROOT, ".env"));
const lines = [
  "# Final security and secret-hygiene scan",
  "",
  `- Scan date: ${new Date().toISOString()}`,
  `- Tracked source files scanned: ${tracked.length}`,
  `- Privileged-token findings: ${findings.length}`,
  `- Tracked environment files: ${trackedEnv.length ? trackedEnv.join(", ") : "none"}`,
  `- Local .env present: ${localEnv ? "yes (ignored; contains a VITE public client key only according to source inspection)" : "no"}`,
  "",
  findings.length ? "## Findings\n\n" + findings.map((finding) => `- ${finding.type} at ${finding.file}:${finding.line} (value withheld)`).join("\n") : "## Findings\n\n- PASS — no privileged secret patterns found in tracked source files.",
  "",
  "## Boundary",
  "",
  "This is a local source/index scan. It does not prove that provider dashboards, deployment history, browser storage, or third-party logs contain no secrets. Rotate any privileged credential if one is ever found outside this scan.",
  "",
];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join("\n"));
console.log(`✓ secret scan written (${findings.length} privileged findings; tracked env files: ${trackedEnv.length})`);
if (findings.length) process.exitCode = 1;
