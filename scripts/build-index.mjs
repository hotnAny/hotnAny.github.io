/**
 * Merges content/index.md into index.html between the AUTO-GENERATED markers.
 *
 * index.md uses plain markdown plus a few directives (no raw HTML):
 *   # Title                  → <h1 id="home-heading-main">
 *   ## Section               → <h2 id="home-heading-section">
 *   a bare paragraph         → <p class="statement">
 *   @p [extra-classes]       → <p class="statement [extra-classes]">  (only when you need a class)
 *   @section-support … @end  → funding block (inline markdown inside)
 *   @videos                  → row of video cards from content/selected-research.yml
 *
 * Everything lands in one region: index-main.
 *
 * Run: npm run build:index
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "content", "index.md");
const htmlPath = path.join(root, "index.html");
const projectsPath = path.join(root, "content", "selected-research.yml");

const BEGIN_INTRO = "<!-- AUTO-GENERATED:index-intro:BEGIN -->";
const END_INTRO = "<!-- AUTO-GENERATED:index-intro:END -->";
const BEGIN_MAIN = "<!-- AUTO-GENERATED:index-main:BEGIN -->";
const END_MAIN = "<!-- AUTO-GENERATED:index-main:END -->";

/** True for lines that start a directive or heading, so a bare paragraph knows where to stop. */
function isDirective(line) {
  return (
    line.startsWith("#") ||
    /^---\s*$/.test(line) ||
    line.startsWith("@p") ||
    line === "@section-support" ||
    line === "@videos" ||
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

    if (line === "@videos") {
      i++;
      /** @type {{title?: string, video?: string, text?: string}[]} */
      const projects = yaml.load(fs.readFileSync(projectsPath, "utf8")) || [];
      const cards = projects.map((p) => {
        const f = Object.fromEntries(
          Object.entries(p).map(([k, v]) => [k, v == null ? "" : String(v).trim()])
        );
        // Any Drive share link (…/file/d/<id>/view?…) becomes a thumbnail + play button;
        // clicking opens the Drive player in a lightbox (see the script at the end of index.html).
        // The thumbnail is `image` (path from the site root) or, if absent, Drive's own.
        const id = f.video?.match(/\/d\/([\w-]{20,})/)?.[1];
        const title = (f.title || "").replace(/"/g, "&quot;");
        const thumb = f.image
          ? encodeURI(f.image)
          : `https://drive.google.com/thumbnail?id=${id}&amp;sz=w800`;
        const frame = id
          ? `<button class="video-poster" type="button" data-src="https://drive.google.com/file/d/${id}/preview" data-title="${title}" aria-label="Play ${title} video" style="background-image: url('${thumb}')"><span class="video-play" aria-hidden="true"></span></button>`
          : `<span class="video-play" aria-hidden="true"></span>`;
        return [
          `  <figure class="video-card">`,
          `    <div class="video-frame">${frame}</div>`,
          `    <figcaption>`,
          `      <h3 class="video-title">${parseInline(f.title || "")}</h3>`,
          f.text ? `      <div class="video-text">${relExternal(parseInline(f.text))}</div>` : "",
          `    </figcaption>`,
          `  </figure>`,
        ]
          .filter(Boolean)
          .join("\n");
      });
      out.push(`<div class="video-row">\n${cards.join("\n")}\n</div>`);
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
 * @param {string} [indent] leading whitespace of the marker lines
 */
function replaceSection(html, begin, end, fragment, indent = " ".repeat(10)) {
  const re = new RegExp(`${escapeRegex(begin)}[\\s\\S]*?${escapeRegex(end)}`, "m");
  if (!re.test(html)) {
    console.error(`build-index: markers not found: ${begin}`);
    process.exit(1);
  }
  const indented = fragment
    .split("\n")
    .map((line) => indent + line)
    .join("\n");
  return html.replace(re, `${begin}\n${indented}\n${indent}${end}`);
}

const md = fs.readFileSync(mdPath, "utf8");
marked.setOptions({ gfm: true });

// The first `---` line splits the intro (beside the portrait) from the rest of the page.
const split = md.match(/^---[ \t]*$/m);
if (!split) {
  console.error("build-index: content/index.md needs a --- line to end the intro");
  process.exit(1);
}
const introFragment = compileHomeMd(md.slice(0, split.index));
const mainFragment = compileHomeMd(md.slice(split.index + split[0].length));

let index = fs.readFileSync(htmlPath, "utf8");
index = replaceSection(index, BEGIN_INTRO, END_INTRO, introFragment.trim(), " ".repeat(14));
index = replaceSection(index, BEGIN_MAIN, END_MAIN, mainFragment.trim());

fs.writeFileSync(htmlPath, index);
console.log("build-index: updated index.html from content/index.md");
