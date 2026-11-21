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
  en: { h1: "What did they <mark>mean?</mark>", agent: "Agent", human: "Human", q: "Should I delete the old migration? Yes or no?", a: "or" },
  zh: { h1: "何<mark>意味？</mark>", agent: "Agent", human: "人类", q: "要我删掉旧的 migration 吗？删吗？", a: "吗" }
};

// Covers follow the site's plush sharkyloop look: white ground, stitched dashes, foam patches, rounded type.
const shell = (body, lang) => `<!doctype html><html lang="${lang === "zh" ? "zh-CN" : "en"}"><head><meta charset="utf-8"><style>
:root {${FONTS} --round: ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, -apple-system, "Segoe UI", var(--cjk);
  --fg:#2f5f85; --deep:${L.ink}; --accent:#5b8db5; --aqua:${L.accent}; --foam:${L.bg}; --stitch:#b9dcea; --line:#cfe6ee; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #fff; color: var(--fg); font-family: var(--round); padding: 20px; }
.frame { height: 100%; border: 4px dashed var(--stitch); border-radius: 44px; display: grid; grid-template-rows: 92px 1fr; overflow: hidden; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: 0 34px; border-bottom: 4px dashed var(--line); font-weight: 800; font-size: 40px; letter-spacing: -0.01em; color: var(--deep); }
.bar span { color: var(--aqua); }
.bar .r { font-size: 22px; font-weight: 700; letter-spacing: 0; padding: 8px 22px; background: var(--foam); border-radius: 999px; }
.main { display: grid; grid-template-columns: 404px 1fr; align-items: center; min-height: 0; }
.logo { margin-left: 44px; width: 340px; height: 340px; display: grid; place-items: center; background: var(--foam); border: 4px dashed var(--stitch); border-radius: 60px; }
.logo svg { width: 256px; height: 256px; }
.side { padding: 20px 48px 20px 16px; display: grid; align-content: center; gap: 26px; min-width: 0; }
h1 { font-size: 92px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; color: var(--deep); }
html[lang="zh-CN"] h1 { font-size: 116px; letter-spacing: 0; }
mark { display: inline-block; background: var(--foam); color: var(--accent); border: 5px dashed var(--stitch); border-radius: 0.28em; padding: 0 0.16em 0.04em; transform: rotate(-2deg); }
.chat { display: grid; gap: 12px; }
.turn { display: grid; grid-template-columns: 96px 1fr; gap: 12px; align-items: start; }
.who { justify-self: end; margin-top: 10px; padding: 4px 14px; border-radius: 999px; background: var(--foam); color: var(--deep); font-weight: 800; font-size: 17px; white-space: nowrap; }
.txt { justify-self: start; padding: 12px 20px; background: var(--foam); border-radius: 8px 26px 26px 26px; font-weight: 600; font-size: 24px; line-height: 1.25; }
.reply .who { background: var(--deep); color: #fff; }
.reply .txt { background: var(--deep); color: #fff; font-weight: 900; font-size: 64px; line-height: 1; padding: 6px 28px 14px; border-radius: 8px 30px 30px 30px; }
.score { display: grid; grid-template-columns: auto 1fr; border: 4px dashed var(--stitch); border-radius: 52px; overflow: hidden; box-shadow: 0 0 0 8px #fff, 0 16px 36px rgb(63 114 156 / 0.18); }
.num { background: var(--deep); color: #fff; font-weight: 900; font-size: 190px; line-height: 0.88; letter-spacing: -0.04em; padding: 28px 40px 24px 32px; border-radius: 0 68px 68px 0; font-variant-numeric: tabular-nums; white-space: nowrap; }
.num small { font-size: 62px; letter-spacing: -0.01em; }
.band { font-weight: 800; line-height: 1.06; letter-spacing: -0.02em; padding: 22px 28px; display: flex; align-items: center; font-size: var(--bs); color: var(--deep); }
</style></head><body><div class="frame">
<div class="bar"><div>frontier<span>human</span></div><div class="r">frontier-human.sharkyloop.com</div></div>
<div class="main"><div class="logo">${logoSvg(mark(L))}</div><div class="side">${body}</div></div>
</div></body></html>`;

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
