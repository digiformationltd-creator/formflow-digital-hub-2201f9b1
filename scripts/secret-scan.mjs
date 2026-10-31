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
const sourceFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
const bundleFiles = [];
function walkBundle(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkBundle(absolute);
    else if (/\.(?:js|html|json|css)$/.test(entry.name)) bundleFiles.push(path.relative(ROOT, absolute));
  }
}
walkBundle(path.join(ROOT, 'dist'));
const findings = [];
let publicAnonReferences = 0;
const patterns = [
  { type: "privileged Supabase service-role key literal", re: /(?:service[_-]?role|SUPABASE_SERVICE_ROLE_KEY)[^\r\n]{0,100}["'](?:eyJ|sb_secret_)/i },
  { type: "live payment secret", re: /sk_live_[A-Za-z0-9]/i },
  { type: "Cloudflare API token/bearer literal", re: /(?:cloudflare[^\r\n]{0,80}(?:api[_-]?token|bearer)|bearer)\s*[=:]?\s*["']?[A-Za-z0-9._-]{40,}/i },
  { type: "private SSH key", re: /-----BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY-----/i },
];
for (const relative of [...new Set([...sourceFiles, ...bundleFiles])]) {
  if (/^(?:\.env(?:\.|$)|node_modules[\\/])/.test(relative)) continue;
  const absolute = path.join(ROOT, relative);
  let text;
  try { text = fs.readFileSync(absolute, "utf8"); } catch { continue; }
  text.split(/\r?\n/).forEach((line, index) => {
    for (const pattern of patterns) if (pattern.re.test(line)) {
      const match = line.match(pattern.re)?.[0];
      const jwt = match?.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)?.[0];
      let role;
      try { if (jwt) role = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()).role; } catch { /* Preserve unknown token findings. */ }
      if (pattern.type === 'Cloudflare API token/bearer literal' && role === 'anon') publicAnonReferences++;
      else findings.push({ file: relative, line: index + 1, type: pattern.type });
    }
  });
  for (const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url').toString());
      if (payload.role === 'service_role') findings.push({ file: relative, line: 0, type: 'privileged service-role JWT' });
    } catch { /* Non-JWT lookalikes do not identify a credential. */ }
  }
}
const trackedEnv = tracked.filter((file) => /^\.env(?:\.|$)/.test(file) && file !== '.env.example');
const localEnv = fs.existsSync(path.join(ROOT, ".env"));
const lines = [
  "# Final security and secret-hygiene scan",
  "",
  `- Scan date: ${new Date().toISOString()}`,
  `- Tracked source files scanned: ${tracked.length}`,
  `- Frontend bundle files scanned: ${bundleFiles.length}`,
  `- Public anon JWT references identified: ${publicAnonReferences} (public client keys, not privileged tokens)`,
  `- Privileged-token findings: ${findings.length}`,
  `- Tracked environment files: ${trackedEnv.length ? trackedEnv.join(", ") : "none"}`,
  `- Local .env present: ${localEnv ? "yes (ignored; contents not reproduced)" : "no"}`,
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
if (findings.length || trackedEnv.length) process.exitCode = 1;
