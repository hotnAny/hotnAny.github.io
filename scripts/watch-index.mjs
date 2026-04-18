/**
 * Watches content/index.md (and scripts/build-index.mjs) and runs npm run build:index on change.
 * No git involved — keep this running while you edit locally.
 *
 *   npm run watch:index
 */
import { watch } from "fs";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const buildScript = path.join(root, "scripts", "build-index.mjs");
const watched = [
  path.join(root, "content", "index.md"),
  buildScript,
];

function rebuild() {
  console.log(`[watch:index] ${new Date().toISOString()} rebuilding…`);
  try {
    execFileSync(process.execPath, [buildScript], { stdio: "inherit", cwd: root });
  } catch {
    // build-index already printed the error
  }
}

rebuild();

let debounce;
function schedule() {
  clearTimeout(debounce);
  debounce = setTimeout(rebuild, 200);
}

for (const file of watched) {
  watch(file, { persistent: true }, schedule);
}

console.log("[watch:index] watching content/index.md and scripts/build-index.mjs (Ctrl+C to stop)");
