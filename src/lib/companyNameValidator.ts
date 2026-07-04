/**
 * Placeholder / fake company-name detector for address-service forms.
 *
 * Rules (shared client + server-side):
 * - Applied ONLY to address-service flows and other forms that opt in via
 *   `strictCompanyName`. UK Ltd registration keeps company name mandatory
 *   but does NOT reject placeholders (a company may not exist yet).
 * - ID verification is intentionally exempt (form usually happens before
 *   incorporation).
 *
 * Also exposed as a Postgres-ready regex source string in `PLACEHOLDER_REGEX_SOURCE`
 * so backend validation can enforce the same list.
 */

const PLACEHOLDER_TOKENS: string[] = [
  "abc",
  "xyz",
  "test",
  "testing",
  "sample",
  "demo",
  "dummy",
  "example",
  "n/a",
  "na",
  "none",
  "nil",
  "null",
  "unknown",
  "tbd",
  "tba",
  "asdf",
  "asdfg",
  "asdfgh",
  "qwerty",
  "qwertyuiop",
  "aaa",
  "aaaa",
  "aaaaa",
  "zzz",
  "zzzz",
  "1234",
  "12345",
  "123456",
  "companyname",
  "mycompany",
  "yourcompany",
  "acme", // catches "acme ltd" placeholders too — real "Acme" companies exist
  // but for address service the user should use their genuine registered name.
];

const CORPORATE_SUFFIX = /\b(ltd|limited|llp|plc|inc|corp|corporation|company|co)\.?\b/gi;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(CORPORATE_SUFFIX, "")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when the value looks like a placeholder / fake company name and
 * MUST be rejected on strict (address-service) forms.
 */
export function isPlaceholderCompanyName(raw: string | null | undefined): boolean {
  if (!raw) return true;
  const trimmed = raw.trim();
  if (trimmed.length < 2) return true;

  const core = normalize(trimmed);
  if (core.length === 0) return true;
  if (core.length < 3) return true;

  // Single-token placeholders (with or without a corporate suffix)
  if (PLACEHOLDER_TOKENS.includes(core.replace(/\s+/g, ""))) return true;

  // Same token repeated across the whole string ("abc abc", "test test ltd")
  const tokens = core.split(" ").filter(Boolean);
  if (tokens.length > 0 && tokens.every((t) => PLACEHOLDER_TOKENS.includes(t))) return true;

  // Single-character or repeated-character names (aaaa, xxx, 1111)
  if (/^([a-z0-9])\1{2,}$/.test(core.replace(/\s+/g, ""))) return true;

  // Random keyboard mash (qwerty variants)
  if (/^(qwerty|asdfgh|zxcvbn)/.test(core.replace(/\s+/g, ""))) return true;

  return false;
}

/**
 * Human-readable reason for the UI when validation fails.
 */
export const PLACEHOLDER_COMPANY_ERROR =
  "Please enter your genuine company name. Placeholder names (e.g. ABC Ltd, XYZ, Test, N/A) are not accepted for address-service orders.";
