/**
 * Merges content/index.md into index.html between AUTO-GENERATED markers.
 *
 * index.md uses directives (no raw HTML):
 *   # Title  /  ## Section (Research | Collaborate)
 *   @p [extra-classes]     → <p class="statement [extra-classes]">
 *   …paragraph text, **bold**, [links](url)…
 *   @section-support … @end   → funding block (inline markdown inside)
 *
 * Output is split into three regions: overview, research, collaborate.
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

const BEGIN_OVERVIEW = "<!-- AUTO-GENERATED:index-overview:BEGIN -->";
const END_OVERVIEW = "<!-- AUTO-GENERATED:index-overview:END -->";
const BEGIN_RESEARCH = "<!-- AUTO-GENERATED:index-research:BEGIN -->";
const END_RESEARCH = "<!-- AUTO-GENERATED:index-research:END -->";
const BEGIN_COLLABORATE = "<!-- AUTO-GENERATED:index-collaborate:BEGIN -->";
const END_COLLABORATE = "<!-- AUTO-GENERATED:index-collaborate:END -->";

/**
 * @param {string} src
 * @returns {{ overview: string; research: string; collaborate: string }}
 */
function compileHomeMd(src) {
  const lines = src.split(/\r?\n/);
  /** @type {{ overview: string[]; research: string[]; collaborate: string[] }} */
  const sections = { overview: [], research: [], collaborate: [] };
  /** @type {'overview' | 'research' | 'collaborate'} */
  let current = "overview";
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

    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      if (title === "Research") {
        current = "research";
        let html = marked.parse(line + "\n", { async: false }).trim();
        html = html.replace("<h2>", '<h2 id="home-heading-research">');
        html = html.replace(
          "</h2>",
          '<span class="visually-hidden">: HCI and human–AI interaction</span></h2>'
        );
        sections.research.push(html);
        i++;
        continue;
      }
      if (title === "Collaborate") {
        current = "collaborate";
        const html = marked.parse(line + "\n", { async: false }).trim();
        sections.collaborate.push(html.replace("<h2>", '<h2 id="home-heading-collaborate">'));
        i++;
        continue;
      }
      console.warn(`build-index: unexpected ## heading "${title}", appending to ${current}`);
      sections[current].push(marked.parse(line + "\n", { async: false }).trim());
      i++;
      continue;
    }

    if (line.startsWith("# ") && !line.startsWith("## ")) {
      const html = marked.parse(line + "\n", { async: false }).trim();
      sections.overview.push(html.replace("<h1>", '<h1 id="home-heading-overview">'));
      i++;
      continue;
    }

    if (line === "@section-support") {
      current = "collaborate";
      i++;
      const bodyLines = [];
      while (i < lines.length && lines[i].trim() !== "@end") {
        bodyLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      const inner = relExternal(parseInline(bodyLines.join("\n")));
      sections.collaborate.push(
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
      const inner = relExternal(parseInline(bodyLines.join("\n")));
      sections[current].push(`<p class="${classAttr}">${inner}</p>`);
      continue;
    }

    console.warn(`build-index: skipping unrecognized line ${i + 1}: ${line.slice(0, 40)}…`);
    i++;
  }

  return {
    overview: sections.overview.join("\n"),
    research: sections.research.join("\n"),
    collaborate: sections.collaborate.join("\n"),
  };
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
const fragments = compileHomeMd(md);

let index = fs.readFileSync(htmlPath, "utf8");
index = replaceSection(index, BEGIN_OVERVIEW, END_OVERVIEW, fragments.overview.trim());
index = replaceSection(index, BEGIN_RESEARCH, END_RESEARCH, fragments.research.trim());
index = replaceSection(index, BEGIN_COLLABORATE, END_COLLABORATE, fragments.collaborate.trim());

fs.writeFileSync(htmlPath, index);
console.log("build-index: updated index.html from content/index.md");
