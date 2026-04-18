/**
 * Merges content/index.md into index.html between AUTO-GENERATED markers.
 *
 * index.md uses directives (no raw HTML):
 *   # Title  /  ## Section
 *   @p [extra-classes]     → <p class="statement [extra-classes]">
 *   …paragraph text, **bold**, [links](url)…
 *   @section-support … @end   → funding block (inline markdown inside)
 *
 * Run: npm run build:index
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "content", "index.md");
const htmlPath = path.join(root, "index.html");

const BEGIN = "<!-- AUTO-GENERATED:index-content:BEGIN -->";
const END = "<!-- AUTO-GENERATED:index-content:END -->";

/**
 * @param {string} src
 * @returns {string} HTML fragment
 */
function compileHomeMd(src) {
  const lines = src.split(/\r?\n/);
  const chunks = [];
  let i = 0;

  const parseInline = (text) => marked.parseInline(text.trim(), { async: false });

  /** Add target/rel only to absolute http(s) links */
  const relExternal = (html) =>
    html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("<!--")) {
      while (i < lines.length && !lines[i].includes("-->")) i++;
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      chunks.push(marked.parse(line + "\n", { async: false }).trim());
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      chunks.push(marked.parse(line + "\n", { async: false }).trim());
      i++;
      continue;
    }

    if (line === "@section-support") {
      i++;
      const bodyLines = [];
      while (i < lines.length && lines[i].trim() !== "@end") {
        bodyLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      const inner = relExternal(parseInline(bodyLines.join("\n")));
      chunks.push(
        `<div class="section-support">\n  <p class="statement funding-note">\n    ${inner}\n  </p>\n</div>`
      );
      continue;
    }

    if (line.startsWith("@p")) {
      const extra = line.slice(2).trim();
      const classAttr = extra ? `statement ${extra}` : "statement";
      i++;
      const bodyLines = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith("@p") || t === "@section-support" || t === "@end") break;
        if (t.startsWith("# ")) break;
        if (t.startsWith("## ")) break;
        bodyLines.push(lines[i]);
        i++;
      }
      const inner = parseInline(bodyLines.join("\n"));
      chunks.push(`<p class="${classAttr}">${inner}</p>`);
      continue;
    }

    console.warn(`build-index: skipping unrecognized line ${i + 1}: ${line.slice(0, 40)}…`);
    i++;
  }

  return chunks.join("\n");
}

const md = fs.readFileSync(mdPath, "utf8");
marked.setOptions({ gfm: true });
const fragment = compileHomeMd(md).trim();

const index = fs.readFileSync(htmlPath, "utf8");
const re = new RegExp(`${BEGIN}[\\s\\S]*?${END}`, "m");
if (!re.test(index)) {
  console.error("build-index: markers not found in index.html");
  process.exit(1);
}

const indented = fragment
  .split("\n")
  .map((line) => "        " + line)
  .join("\n");

const next = index.replace(re, `${BEGIN}\n${indented}\n        ${END}`);
fs.writeFileSync(htmlPath, next);
console.log("build-index: updated index.html from content/index.md");
