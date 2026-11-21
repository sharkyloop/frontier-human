// Renders the logo files, favicons and social covers into site/.
// Needs Playwright: `npm i -D playwright && npx playwright install chromium`,
// then `node tools/build-assets.mjs [logo-512-output.png]`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { LOGO_COLORS, logoSvg } from "../site/logo.js";
import { BAND_TEXT, bandFor } from "../site/rubric.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const total = JSON.parse(fs.readFileSync(path.join(root, "data/items.json"), "utf8")).items.length;
const out = (rel) => {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  return f;
};

const L = LOGO_COLORS.light;
const D = LOGO_COLORS.dark;
const mark = (c) => ({ ink: c.ink, accent: c.accent });
fs.writeFileSync(out("logo-light.svg"), logoSvg(mark(L)) + "\n");
fs.writeFileSync(out("logo-dark.svg"), logoSvg(mark(D)) + "\n");
fs.writeFileSync(
  out("favicon.svg"),
  logoSvg({ ...L, bg: L.bg, pad: 0 }).replace(
    "<rect",
    `<style>@media (prefers-color-scheme: dark){rect{fill:${D.bg}}path:first-of-type{fill:${D.ink}}path:last-of-type{fill:${D.accent}}}</style><rect`
  ) + "\n"
);

const FONTS = `
  --cjk: "PingFang SC", "Noto Sans CJK SC", "Noto Sans SC", "WenQuanYi Micro Hei", "Droid Sans Fallback", sans-serif;
  --display: "Arial Black", "Helvetica Neue", Helvetica, Arial, var(--cjk);
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, "Liberation Mono", "DejaVu Sans Mono", var(--cjk), monospace;`;

const COVER = {
  en: { h1: "What did they <mark>mean?</mark>", agent: "AGENT", human: "HUMAN", q: "Should I delete the old migration? Yes or no?", a: "or" },
  zh: { h1: "何<mark>意味？</mark>", agent: "AGENT", human: "人类", q: "要我删掉旧的 migration 吗？删吗？", a: "吗" }
};

const shell = (body, lang) => `<!doctype html><html lang="${lang === "zh" ? "zh-CN" : "en"}"><head><meta charset="utf-8"><style>
:root {${FONTS} --bg:${L.bg}; --fg:${L.ink}; --accent:${L.accent}; --panel:#f8fbff; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: var(--bg); color: var(--fg); font-family: var(--display);
  border: 14px solid var(--fg); display: grid; grid-template-rows: 86px 1fr; }
.bar { display: flex; justify-content: space-between; align-items: stretch; border-bottom: 8px solid var(--fg); font-weight: 900; font-size: 32px; }
.bar > div { display: flex; align-items: center; padding: 0 28px; }
.bar span { background: var(--accent); color: #fff; padding: 0 6px; margin-left: 2px; }
.bar .r { border-left: 8px solid var(--fg); font-family: var(--mono); font-size: 22px; font-weight: 700; }
.main { display: grid; grid-template-columns: 420px 1fr; }
.logo { border-right: 8px solid var(--fg); display: grid; place-items: center; background: var(--panel); }
.logo svg { width: 352px; height: 352px; }
.side { padding: 34px 36px; display: grid; align-content: center; gap: 26px; min-width: 0; }
h1 { font-size: 92px; line-height: 0.9; letter-spacing: -0.05em; text-transform: uppercase; }
html[lang="zh-CN"] h1 { font-size: 120px; letter-spacing: 0; }
mark { background: var(--accent); color: #fff; padding: 0 8px; }
.chat { border: 6px solid var(--fg); box-shadow: 10px 10px 0 var(--fg); background: var(--panel); }
.turn { display: grid; grid-template-columns: 110px 1fr; }
.turn + .turn { border-top: 6px solid var(--fg); }
.who { font-family: var(--mono); font-weight: 800; font-size: 16px; letter-spacing: 0.08em; padding: 14px; border-right: 6px solid var(--fg); }
.txt { font-family: var(--mono); font-weight: 700; font-size: 24px; line-height: 1.25; padding: 12px 16px; }
.reply .who { background: var(--fg); color: var(--bg); }
.reply .txt { font-family: var(--display); font-weight: 900; font-size: 64px; line-height: 1; padding: 8px 16px 14px; }
.score { display: grid; grid-template-columns: auto 1fr; border: 8px solid var(--fg); box-shadow: 12px 12px 0 var(--fg); }
.num { background: var(--accent); color: #fff; font-weight: 900; font-size: 200px; line-height: 0.82; letter-spacing: -0.06em; padding: 22px 26px 14px; font-variant-numeric: tabular-nums; }
.num small { font-size: 64px; letter-spacing: -0.02em; }
.band { font-weight: 900; text-transform: uppercase; line-height: 0.98; letter-spacing: -0.03em; padding: 22px 26px; background: var(--panel); display: flex; align-items: center; font-size: var(--bs); }
.score .band { border-left: 8px solid var(--fg); }
</style></head><body>
<div class="bar"><div>FRONTIER<span>HUMAN</span></div><div class="r">frontier-human.sharkyloop.com</div></div>
<div class="main"><div class="logo">${logoSvg(mark(L))}</div><div class="side">${body}</div></div>
</body></html>`;

const defaultCover = (lang) => {
  const c = COVER[lang];
  return shell(`<h1>${c.h1}</h1><div class="chat"><div class="turn"><div class="who">${c.agent}</div><div class="txt">${c.q}</div></div><div class="turn reply"><div class="who">${c.human}</div><div class="txt">${c.a}</div></div></div>`, lang);
};

const scoreCover = (s, lang) => {
  const v = BAND_TEXT[lang][bandFor(s).id][0];
  const bs = lang === "zh" ? (v.length > 4 ? 56 : 60) : v.length > 20 ? 48 : 60;
  return shell(`<div class="score" style="--bs:${bs}px"><div class="num">${s}<small>/${total}</small></div><div class="band">${v}</div></div>`, lang);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
async function shot(html, file) {
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: out(file) });
}
let n = 0;
for (const lang of ["en", "zh"]) {
  await shot(defaultCover(lang), `covers/default-${lang}.png`);
  n++;
  for (let s = 0; s <= total; s++) {
    await shot(scoreCover(s, lang), `covers/${lang}/${s}.png`);
    n++;
  }
}

async function icon(size, file, bg, pad) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<style>*{margin:0}svg{display:block}</style>${logoSvg({ ...L, bg, pad, size })}`);
  await p.screenshot({ path: file, omitBackground: !bg });
  await p.close();
}
await icon(32, out("favicon-32.png"), L.bg, 0);
await icon(180, out("apple-touch-icon.png"), L.bg, 2);
if (process.argv[2]) await icon(512, process.argv[2], L.bg, 0);
await browser.close();
console.log(`covers: ${n}`);
