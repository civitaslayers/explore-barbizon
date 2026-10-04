// ---------------------------------------------------------------------------
// scripts/check-i18n-strings.mjs
//
// French typography guard. French convention requires a non-breaking space
// (U+00A0) before : ; ! ? and inside « » guillemets — not a plain space
// (U+0020). Scans every leaf string in public/locales/fr/*.json and fails
// if it finds the plain-space form (brain/decisions.md, 2026-10-04 copy
// review).
//
// Usage: node scripts/check-i18n-strings.mjs
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FR_DIR = join(__dirname, "..", "public", "locales", "fr");

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

function main() {
  const files = readdirSync(FR_DIR).filter((f) => f.endsWith(".json"));
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

  if (failures > 0) {
    console.error(`\ni18n string check FAILED with ${failures} violation(s).`);
    process.exitCode = 1;
    return;
  }

  console.log("i18n string check passed — no French typography violations.");
}

main();
