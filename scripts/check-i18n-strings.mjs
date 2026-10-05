// ---------------------------------------------------------------------------
// scripts/check-i18n-strings.mjs
//
// Two checks:
//
// 1. French typography guard. French convention requires a non-breaking
//    space (U+00A0) before : ; ! ? and inside « » guillemets — not a plain
//    space (U+0020). Scans every leaf string in public/locales/fr/*.json and
//    fails if it finds the plain-space form (brain/decisions.md, 2026-10-04
//    copy review).
//
// 2. FR/EN key-parity guard. For every public/locales/fr/*.json, the
//    matching public/locales/en/*.json must exist and carry the identical
//    set of leaf key paths — catches drift where one locale gains or loses a
//    key without the other (task 1b180958).
//
// Usage: node scripts/check-i18n-strings.mjs
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const LOCALES_DIR = join(__dirname, "..", "public", "locales");
const FR_DIR = join(LOCALES_DIR, "fr");
const EN_DIR = join(LOCALES_DIR, "en");

const VIOLATIONS = [
  { name: "space before colon", needle: " :" },
  { name: "space before semicolon", needle: " ;" },
  { name: "space before exclamation mark", needle: " !" },
  { name: "space before question mark", needle: " ?" },
  { name: "space after opening guillemet", needle: "« " },
  { name: "space before closing guillemet", needle: " »" },
];

function walk(value, pathParts, onLeaf) {
  if (typeof value === "string") {
    onLeaf(pathParts.join("."), value);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walk(child, [...pathParts, key], onLeaf);
    }
  }
}

function leafKeyPaths(data) {
  const paths = new Set();
  walk(data, [], (keyPath) => paths.add(keyPath));
  return paths;
}

function checkFrenchTypography(files) {
  let failures = 0;

  for (const file of files) {
    const fullPath = join(FR_DIR, file);
    const data = JSON.parse(readFileSync(fullPath, "utf8"));

    walk(data, [], (keyPath, str) => {
      for (const { name, needle } of VIOLATIONS) {
        if (str.includes(needle)) {
          console.error(`[FAIL] ${file}:${keyPath} — ${name}: "${str}"`);
          failures++;
        }
      }
    });
  }

  return failures;
}

function checkKeyParity(files) {
  let failures = 0;

  for (const file of files) {
    const frPath = join(FR_DIR, file);
    const enPath = join(EN_DIR, file);

    if (!existsSync(enPath)) {
      console.error(`[FAIL] ${file} — exists in fr/ but missing in en/`);
      failures++;
      continue;
    }

    const frData = JSON.parse(readFileSync(frPath, "utf8"));
    const enData = JSON.parse(readFileSync(enPath, "utf8"));
    const frKeys = leafKeyPaths(frData);
    const enKeys = leafKeyPaths(enData);

    const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));
    const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));

    for (const key of missingInEn) {
      console.error(`[FAIL] ${file}:${key} — present in fr/, missing in en/`);
      failures++;
    }
    for (const key of missingInFr) {
      console.error(`[FAIL] ${file}:${key} — present in en/, missing in fr/`);
      failures++;
    }
  }

  return failures;
}

function main() {
  const files = readdirSync(FR_DIR).filter((f) => f.endsWith(".json"));

  const typographyFailures = checkFrenchTypography(files);
  const parityFailures = checkKeyParity(files);
  const failures = typographyFailures + parityFailures;

  if (failures > 0) {
    console.error(`\ni18n string check FAILED with ${failures} violation(s).`);
    process.exitCode = 1;
    return;
  }

  console.log("i18n string check passed — no French typography violations, no FR/EN key drift.");
}

main();
