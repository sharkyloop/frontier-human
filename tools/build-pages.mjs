// Writes the static entry points crawlers read: site/index.html's meta block,
// site/zh/, and site/s/<score>/ (+ /zh/) for every score. No dependencies.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BANDS, BAND_TEXT, SHARE_TEXT, SITE, bandFor, sharePath } from "../site/rubric.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const total = JSON.parse(fs.readFileSync(path.join(root, "data/items.json"), "utf8")).items.length;
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

const COPY = {
  en: {
    title: "FrontierHuman · What did they mean?",
    desc: "20 terse replies to an AI agent's clarifying questions. Read them the way a strong agent would.",
    alt: "FrontierHuman: Agent asks “Should I delete the old migration? Yes or no?” Human replies “or”.",
    scoreAlt: (s, v) => `FrontierHuman result: ${s}/${total}, ${v}.`,
    locale: "en_US",
    alternate: "zh_CN"
  },
  zh: {
    title: "FrontierHuman · 何意味？",
    desc: "Agent 问了个澄清问题，人只回了一两个字。20 道题，看你能不能像强 Agent 一样读懂。",
    alt: "FrontierHuman：Agent 问“要我删掉旧的 migration 吗？删吗？”，人类回“吗”。",
    scoreAlt: (s, v) => `FrontierHuman 成绩：${s}/${total}，${v}。`,
    locale: "zh_CN",
    alternate: "en_US"
  }
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function meta({ lang, url, title, desc, image, alt, alternates }) {
  const c = COPY[lang];
  const tags = [
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="FrontierHuman" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${c.locale}" />`,
    `<meta property="og:locale:alternate" content="${c.alternate}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(alt)}" />`,
    `<link rel="alternate" hreflang="en" href="${alternates.en}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${alternates.zh}" />`
  ];
  return `<!-- meta -->\n  ${tags.join("\n  ")}\n  <!-- /meta -->`;
}

function page({ lang, depth, ...m }) {
  let html = index.replace(/<!-- meta -->[\s\S]*?<!-- \/meta -->/, meta({ lang, ...m }));
  if (depth > 0) {
    html = html
      .replace('<html lang="en">', `<html lang="${lang === "zh" ? "zh-CN" : "en"}" data-lang-hint="${lang}">`)
      .replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n  <base href="${"../".repeat(depth)}" />`)
      .replace("<title>FrontierHuman</title>", `<title>${esc(m.title)}</title>`);
  }
  return html;
}

function write(rel, html) {
  const file = path.join(root, rel, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// Bump when the covers are re-rendered, so sites that cached the old image by URL fetch the new one.
const COVER_V = 3;

const home = { en: SITE, zh: `${SITE}zh/` };
for (const lang of ["en", "zh"]) {
  const c = COPY[lang];
  const m = { lang, url: home[lang], title: c.title, desc: c.desc, image: `${SITE}covers/default-${lang}.png?v=${COVER_V}`, alt: c.alt, alternates: home };
  if (lang === "en") write("", page({ ...m, depth: 0 }));
  else write("zh", page({ ...m, depth: 1 }));
}

let count = 0;
for (let s = 0; s <= total; s++) {
  const alternates = { en: SITE + sharePath(s, "en"), zh: SITE + sharePath(s, "zh") };
  for (const lang of ["en", "zh"]) {
    const v = BAND_TEXT[lang][bandFor(s).id][0];
    write(sharePath(s, lang), page({
      lang,
      depth: lang === "zh" ? 3 : 2,
      url: alternates[lang],
      title: `${s}/${total} · ${v} · FrontierHuman`,
      desc: SHARE_TEXT[lang](s, total, v),
      image: `${SITE}covers/${lang}/${s}.png?v=${COVER_V}`,
      alt: COPY[lang].scoreAlt(s, v),
      alternates
    }));
    count++;
  }
}
if (BANDS.at(-1).min !== 0 || BANDS[0].max !== total) throw new Error("bands do not cover 0–" + total);
console.log(`share pages: ${count} + zh home`);
