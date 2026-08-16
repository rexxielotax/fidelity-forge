import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "node_modules", "tslib");
const destDir = join(
  __dirname,
  "..",
  ".vercel",
  "output",
  "functions",
  "__server.func",
  "node_modules"
);
const dest = join(destDir, "tslib");

if (!existsSync(src)) {
  console.error("[copy-tslib] node_modules/tslib not found — is tslib installed?");
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("[copy-tslib] Copied tslib (with package.json) into the deployed function bundle.");
