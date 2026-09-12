/**
 * Merges content/index.md into index.html between the AUTO-GENERATED markers.
 *
 * index.md uses plain markdown plus a few directives (no raw HTML):
 *   # Title                  → <h1 id="home-heading-main">
 *   ## Section               → <h2 id="home-heading-section">
 *   a bare paragraph         → <p class="statement">
 *   @p [extra-classes]       → <p class="statement [extra-classes]">  (only when you need a class)
 *   @section-support … @end  → funding block (inline markdown inside)
 *
 * Everything lands in one region: index-main.
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

const BEGIN_MAIN = "<!-- AUTO-GENERATED:index-main:BEGIN -->";
const END_MAIN = "<!-- AUTO-GENERATED:index-main:END -->";

/** True for lines that start a directive or heading, so a bare paragraph knows where to stop. */
function isDirective(line) {
  return (
    line.startsWith("#") ||
    line.startsWith("@p") ||
    line === "@section-support" ||
    line === "@end" ||
    line.startsWith("<!--")
  );
}

/**
 * @param {string} src
 * @returns {string}
 */
function compileHomeMd(src) {
  const lines = src.split(/\r?\n/);
  /** @type {string[]} */
  const out = [];
  let i = 0;

  const parseInline = (text) => marked.parseInline(text.trim(), { async: false });

  /** Add target/rel only to absolute http(s) links */
  const relExternal = (html) =>
    html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');

  const slug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  /** Collect the lines of one paragraph, stopping at a blank line or the next directive. */
  const takeParagraph = () => {
    const bodyLines = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || isDirective(t)) break;
      bodyLines.push(lines[i]);
      i++;
    }
    return bodyLines.join("\n");
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("<!--")) {
      while (i < lines.length && !lines[i].includes("-->")) i++;
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      out.push(`<h2 id="home-heading-${slug(title)}">${parseInline(title)}</h2>`);
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      const title = line.slice(2).trim();
      out.push(`<h1 id="home-heading-main">${parseInline(title)}</h1>`);
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
      out.push(
        `<div class="section-support">\n  <p class="statement funding-note">\n    ${inner}\n  </p>\n</div>`
      );
      continue;
    }

    if (line.startsWith("@p")) {
      const extra = line.slice(2).trim();
      const classAttr = extra ? `statement ${extra}` : "statement";
      i++;
      // Skip a blank line between the directive and its text.
      while (i < lines.length && !lines[i].trim()) i++;
      const inner = relExternal(parseInline(takeParagraph()));
      out.push(`<p class="${classAttr}">${inner}</p>`);
      continue;
    }

    // Anything else is a plain paragraph.
    out.push(`<p class="statement">${relExternal(parseInline(takeParagraph()))}</p>`);
  }

  return out.join("\n");
}

/**
 * @param {string} s
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} html
 * @param {string} begin
 * @param {string} end
 * @param {string} fragment
 */
function replaceSection(html, begin, end, fragment) {
  const re = new RegExp(`${escapeRegex(begin)}[\\s\\S]*?${escapeRegex(end)}`, "m");
  if (!re.test(html)) {
    console.error(`build-index: markers not found: ${begin}`);
    process.exit(1);
  }
  const indented = fragment
    .split("\n")
    .map((line) => "          " + line)
    .join("\n");
  return html.replace(re, `${begin}\n${indented}\n          ${end}`);
}

const md = fs.readFileSync(mdPath, "utf8");
marked.setOptions({ gfm: true });
const fragment = compileHomeMd(md);

let index = fs.readFileSync(htmlPath, "utf8");
index = replaceSection(index, BEGIN_MAIN, END_MAIN, fragment.trim());

fs.writeFileSync(htmlPath, index);
console.log("build-index: updated index.html from content/index.md");
