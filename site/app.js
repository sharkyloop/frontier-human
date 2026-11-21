import { BANDS, BAND_TEXT, SHARE_TEXT, bandFor, sharePath } from "./rubric.js";
import { LOGO_COLORS, drawLogo } from "./logo.js";

const STORAGE_KEY = "frontierhuman:v2";
const THEME_KEY = "frontierhuman:theme";
const LANG_KEY = "frontierhuman:lang";
const LETTERS = ["A", "B", "C", "D"];
const ROOT = new URL("./", document.baseURI);

const I18N = {
  en: {
    title: "FrontierHuman",
    research: "Research",
    h1: 'What did they <mark>mean?</mark>',
    demoQ: "Should I delete the old migration? Yes or no?",
    demoA: "or",
    agent: "Agent",
    human: "Human",
    start: (n) => `Start ${n} →`,
    resume: "Resume",
    report: "Report",
    next: "Next →",
    finish: "Finish",
    prev: "Previous question",
    progress: "Progress",
    choices: "Interpretations",
    vs: "Comparison",
    you: "You",
    strongAgent: "Strong agent",
    literalReader: "Literal reader",
    rubric: "Rubric",
    category: "Category",
    difficulty: "Difficulty",
    review: "Review",
    all: "All",
    allItems: "All items",
    missedItems: "Missed items",
    correctItems: "Correct items",
    correct: "correct",
    missed: "missed",
    intended: "intended",
    yourPick: "your pick",
    retake: "Retake",
    takeIt: "Take it →",
    copyLink: "Copy link",
    copied: "Copied",
    copyFailed: "Copy failed",
    magicLink: "Report link",
    share: "Share…",
    follow: "Follow Sharky",
    followX: "Sharky on X",
    followDiscord: "Sharky on Discord",
    wechat: "WeChat",
    weibo: "Weibo",
    scan: "Scan in WeChat",
    badLink: "Broken link.",
    oldLink: "Old link. The exam has changed.",
    cover: "↓ Cover",
    cardScan: "Scan for the full report",
    coverLabel: "Download cover image",
    close: "Close",
    shareText: SHARE_TEXT.en,
    bands: BAND_TEXT.en,
    criteria: {
      or: "Reads “or” as a soft no, a pointer to an option already raised, or a request to explain.",
      nonanswer: "Recovers the choice behind “yes”, “both?” or “wait no” instead of forcing an option.",
      ordinal: "Binds letters and numbers to the list that defined them.",
      anaphora: "Resolves “that” to the topic and treats “wait…” as a correction.",
      constraint: "Keeps hard constraints from earlier turns; lets newer choices beat soft wishes.",
      hedging: "Hears “sure…” and “why not” as the no they are."
    }
  },
  zh: {
    title: "FrontierHuman · 何意味？",
    research: "研究",
    h1: "何<mark>意味？</mark>",
    demoQ: "要我删掉旧的 migration 吗？删吗？",
    demoA: "吗",
    agent: "Agent",
    human: "人类",
    start: (n) => `开始 ${n} 题 →`,
    resume: "继续",
    report: "报告",
    next: "下一题 →",
    finish: "完成",
    prev: "上一题",
    progress: "进度",
    choices: "解读",
    vs: "对比",
    you: "你",
    strongAgent: "强 Agent",
    literalReader: "字面读者",
    rubric: "评分标准",
    category: "类别",
    difficulty: "难度",
    review: "逐题回顾",
    all: "全部",
    allItems: "全部题目",
    missedItems: "答错的题",
    correctItems: "答对的题",
    correct: "答对",
    missed: "答错",
    intended: "本意",
    yourPick: "你的选择",
    retake: "重测",
    takeIt: "去测一测 →",
    copyLink: "复制链接",
    copied: "已复制",
    copyFailed: "复制失败",
    magicLink: "报告链接",
    share: "分享…",
    follow: "关注 Sharky",
    followX: "在 X 上关注 Sharky",
    followDiscord: "加入 Sharky 的 Discord",
    wechat: "微信",
    weibo: "微博",
    scan: "微信扫一扫",
    badLink: "链接无效。",
    oldLink: "旧版链接，题目已更新。",
    cover: "↓ 封面",
    cardScan: "扫码看完整报告",
    coverLabel: "下载封面图",
    close: "关闭",
    shareText: SHARE_TEXT.zh,
    bands: BAND_TEXT.zh,
    criteria: {
      or: "能把“吗”读成委婉拒绝、指向已提过的方案，或请你解释。",
      nonanswer: "能从“嗯”“两个都？”“等等，不对”里还原真实选择，而不是硬选一个。",
      ordinal: "把字母和数字对应到定义它们的那个列表。",
      anaphora: "把“那个”对应到话题本身，把“等等…”当作更正。",
      constraint: "守住早先的硬约束；让更新的选择胜过软偏好。",
      hedging: "听得出“行吧……”和“反正不差这一个”其实是不要。"
    }
  }
};

const app = document.getElementById("app");
let base = null;
let zh = null;
let lang = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
let state = loadState();
let reviewFilter = "all";
let view = { name: "intro" };

const t = (key) => I18N[lang][key];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { answers: {}, index: 0, finished: false };
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function resetState() {
  state = { answers: {}, index: 0, finished: false };
  saveState();
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function el(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/* ---------- Data ---------- */

function items() {
  return base.items;
}

function text(item) {
  if (lang !== "zh") return item;
  const z = zh.items[item.id];
  return {
    ...item,
    ...z,
    history: item.history.map((m, k) => ({ who: m.who, text: z.history[k] }))
  };
}

function labels(kind) {
  return lang === "zh" ? zh[kind] : base[kind];
}

/* ---------- Magic link ---------- */

function b64urlEncode(bytes) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) return null;
  try {
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function checksum(bytes) {
  return bytes.reduce((acc, b) => (acc * 31 + b + 7) & 255, 0x5a);
}

function encodeAnswers(answers) {
  const n = answers.length;
  const bytes = new Uint8Array(Math.ceil(n / 4) + 1);
  answers.forEach((a, i) => (bytes[i >> 2] |= (a & 3) << ((i & 3) * 2)));
  bytes[bytes.length - 1] = checksum(bytes.subarray(0, bytes.length - 1));
  return `${base.version}.${b64urlEncode(bytes)}`;
}

function decodeAnswers(code) {
  const m = /^(\d+)\.([A-Za-z0-9_-]+)$/.exec(code || "");
  if (!m) return { error: "bad" };
  if (Number(m[1]) !== base.version) return { error: "old" };
  const bytes = b64urlDecode(m[2]);
  const n = items().length;
  if (!bytes || bytes.length !== Math.ceil(n / 4) + 1) return { error: "bad" };
  if (checksum(bytes.subarray(0, bytes.length - 1)) !== bytes[bytes.length - 1]) return { error: "bad" };
  const answers = [];
  for (let i = 0; i < n; i++) answers.push((bytes[i >> 2] >> ((i & 3) * 2)) & 3);
  return { answers };
}

function magicLink(code, you) {
  return `${new URL(sharePath(you, lang), ROOT).href}?r=${code}`;
}

function answersFromState() {
  return items().map((it) => state.answers[it.id]);
}

// In-app browsers get extra scroll room on the exam page (see .inapp in styles.css).
if (/Twitter|FBAN|FBAV|Instagram|MicroMessenger|Weibo|Line\//i.test(navigator.userAgent)) document.documentElement.classList.add("inapp");

/* ---------- Chrome: theme + language ---------- */

const themeBtn = document.getElementById("theme");

function syncChrome() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeBtn.setAttribute("aria-label", lang === "zh" ? (dark ? "切换到浅色" : "切换到深色") : dark ? "Switch to light theme" : "Switch to dark theme");
  themeBtn.setAttribute("aria-pressed", String(dark));
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = t(n.dataset.i18n)));
  document.querySelectorAll("[data-i18n-label]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nLabel)));
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = t("title");
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
}

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  syncChrome();
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  if (saved) return;
  document.documentElement.dataset.theme = e.matches ? "dark" : "light";
  syncChrome();
});

document.querySelectorAll("[data-lang]").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    syncChrome();
    if (base) rerender();
  })
);

syncChrome();

/* ---------- Rendering ---------- */

function show(next, fragment) {
  view = next;
  app.replaceChildren(fragment);
  window.scrollTo(0, 0);
}

function rerender() {
  const y = window.scrollY;
  switch (view.name) {
    case "intro":
      renderIntro();
      break;
    case "question":
      renderQuestion();
      break;
    case "report":
      renderReport(view.answers, view.shared);
      break;
    case "notice":
      renderNotice(view.kind);
      break;
  }
  window.scrollTo(0, y);
}

function turnHtml(who, txt, cls = "") {
  return `<div class="turn ${cls}"><div class="who">${who}</div><div class="text">${esc(txt)}</div></div>`;
}

function chatHtml(item) {
  const history = item.history.map((m) => turnHtml(m.who === "user" ? t("human") : t("agent"), m.text, "past")).join("");
  return `<div class="chat">${history}${turnHtml(t("agent"), item.question)}${turnHtml(t("human"), item.reply, "reply")}</div>`;
}

/* ---------- Intro ---------- */

function renderIntro() {
  const answered = Object.keys(state.answers).length;
  const total = items().length;
  const secondary = state.finished
    ? `<button class="btn" data-go="report">${t("report")}</button>`
    : answered > 0
      ? `<button class="btn" data-go="resume">${t("resume")} ${pad(answered)}/${total}</button>`
      : "";

  show(
    { name: "intro" },
    el(`
    <section class="intro">
      <h1>${t("h1")}</h1>
      <div class="demo box">
        <div class="chat">
          ${turnHtml(t("agent"), t("demoQ"))}
          ${turnHtml(t("human"), t("demoA"), "reply")}
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-accent btn-xl" data-go="start">${t("start")(total)}</button>
        ${secondary}
      </div>
      <a class="intro-sharky" href="${FOLLOW.home}" target="_blank" rel="noopener" aria-label="sharkyloop"><img src="sharky.webp" width="320" height="320" alt="" /></a>
    </section>
  `)
  );
}

/* ---------- Exam ---------- */

function renderQuestion() {
  const list = items();
  const total = list.length;
  const i = Math.min(state.index, total - 1);
  const item = text(list[i]);
  const selected = state.answers[item.id];
  const cells = list.map((it, k) => `<i class="${k === i ? "now" : state.answers[it.id] !== undefined ? "done" : ""}"></i>`).join("");

  show(
    { name: "question" },
    el(`
    <section>
      <div class="exam-top">
        <div class="counter">${pad(i + 1)}<small>/${total}</small></div>
        <div class="cells" role="progressbar" aria-label="${t("progress")}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${Object.keys(state.answers).length}">${cells}</div>
      </div>
      <div class="q box">
        <div class="context">${esc(item.context)}</div>
        ${chatHtml(item)}
        <div class="options" role="radiogroup" aria-label="${t("choices")}">
          ${item.options
            .map(
              (o, k) => `
            <button class="option ${selected === k ? "selected" : ""}" role="radio" aria-checked="${selected === k}" data-opt="${k}">
              <span class="letter">${LETTERS[k]}</span><span class="label">${esc(o)}</span>
            </button>`
            )
            .join("")}
        </div>
      </div>
      <div class="exam-nav">
        <button class="btn" data-go="prev" aria-label="${t("prev")}" ${i === 0 ? "disabled" : ""}>←</button>
        <button class="btn btn-accent" data-go="next" ${selected === undefined ? "disabled" : ""}>${i === total - 1 ? t("finish") : t("next")}</button>
      </div>
    </section>
  `)
  );
}

function choose(k) {
  const item = items()[state.index];
  state.answers[item.id] = k;
  saveState();
  app.querySelectorAll(".option").forEach((b) => {
    const on = Number(b.dataset.opt) === k;
    b.classList.toggle("selected", on);
    b.setAttribute("aria-checked", String(on));
  });
  const next = app.querySelector('[data-go="next"]');
  if (next) next.disabled = false;
}

function next() {
  const item = items()[state.index];
  if (state.answers[item.id] === undefined) return;
  if (state.index < items().length - 1) {
    state.index += 1;
    saveState();
    renderQuestion();
  } else {
    state.finished = true;
    saveState();
    openReport(answersFromState(), false);
  }
}

function prev() {
  if (state.index > 0) {
    state.index -= 1;
    saveState();
    renderQuestion();
  }
}

/* ---------- Report ---------- */

function score(answers) {
  return items().reduce((s, it, i) => s + (answers[i] === it.correct ? 1 : 0), 0);
}

function meterRow(name, value, max, cls = "", sub = "") {
  return `<div class="row ${cls}"><div class="name">${esc(name)}${sub ? `<small>${esc(sub)}</small>` : ""}</div><div class="meter"><span style="width:${(value / max) * 100}%"></span></div><div class="val">${value}/${max}</div></div>`;
}

function groupScores(answers, key) {
  const groups = {};
  items().forEach((it, i) => {
    const g = (groups[it[key]] ||= { n: 0, you: 0 });
    g.n += 1;
    if (answers[i] === it.correct) g.you += 1;
  });
  return groups;
}

function openReport(answers, shared) {
  const code = encodeAnswers(answers);
  history.replaceState(null, "", `${ROOT.pathname}?r=${code}`);
  renderReport(answers, shared);
}

const FOLLOW = { x: "https://x.com/sharkyloop", discord: "https://discord.gg/panmXtkMA", home: "https://sharkyloop.com/" };
const ICONS = {
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>'
};

function shareTargets(link, msg) {
  const u = encodeURIComponent(link);
  const m = encodeURIComponent(msg);
  return {
    x: `https://x.com/intent/tweet?text=${m}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${m}`,
    weibo: `https://service.weibo.com/share/share.php?url=${u}&title=${m}`
  };
}

function qrSvg(link) {
  if (typeof window.qrcode !== "function") return "";
  const qr = window.qrcode(0, "M");
  qr.addData(link);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: t("scan") });
}

function renderReport(answers, shared) {
  const list = items();
  const total = list.length;
  const you = score(answers);
  const literal = list.reduce((s, it) => s + (it.literal === it.correct ? 1 : 0), 0);
  const band = bandFor(you);
  const verdict = t("bands")[band.id][0];
  const code = encodeAnswers(answers);
  const link = magicLink(code, you);
  const msg = t("shareText")(you, total, verdict);
  const targets = shareTargets(link, msg);
  const cats = labels("categories");
  const diffs = labels("difficulties");
  const catScores = groupScores(answers, "category");
  const diffScores = groupScores(answers, "difficulty");

  show(
    { name: "report", answers, shared },
    el(`
    <section>
      <div class="score">
        <div class="num" aria-label="${you} / ${total}">${you}<small>/${total}</small></div>
        <div class="verdict">${esc(verdict)}</div>
      </div>

      <div class="share">
        <div class="link">
          <input id="magic" type="text" readonly value="${esc(link)}" aria-label="${t("magicLink")}" />
          <button data-go="copy">${t("copyLink")}</button>
        </div>
        <div class="socials">
          ${navigator.share ? `<button class="primary" data-go="native">${t("share")}</button>` : ""}
          <a href="${targets.x}" target="_blank" rel="noopener" data-share="x">X</a>
          <a href="${targets.linkedin}" target="_blank" rel="noopener" data-share="linkedin">LinkedIn</a>
          <a href="${targets.facebook}" target="_blank" rel="noopener" data-share="facebook">Facebook</a>
          <a href="${targets.reddit}" target="_blank" rel="noopener" data-share="reddit">Reddit</a>
          <a href="${targets.weibo}" target="_blank" rel="noopener" data-share="weibo">${t("weibo")}</a>
          <button data-go="wechat" aria-haspopup="dialog" aria-controls="qr">${t("wechat")}</button>
          <button class="cover" data-go="cover" aria-label="${t("coverLabel")}">${t("cover")}</button>
        </div>
        <dialog class="qr" id="qr" aria-labelledby="qr-title">
          <div class="code">${qrSvg(link)}</div>
          <div class="scan" id="qr-title">${t("scan")}</div>
          <button class="btn" data-go="qr-close">${t("close")}</button>
        </dialog>
      </div>

      <aside class="sharky" aria-label="${t("follow")}">
        <a class="sharky-logo" href="${FOLLOW.home}" target="_blank" rel="noopener" aria-label="sharkyloop"><img src="sharky.webp" width="160" height="160" alt="" loading="lazy" /></a>
        <div class="sharky-body">
          <div class="sharky-title">${t("follow")}</div>
          <div class="sharky-links">
            <a href="${FOLLOW.x}" target="_blank" rel="noopener" aria-label="${t("followX")}">${ICONS.x}@sharkyloop</a>
            <a href="${FOLLOW.discord}" target="_blank" rel="noopener" aria-label="${t("followDiscord")}">${ICONS.discord}Discord</a>
          </div>
        </div>
      </aside>

      <h2 class="h2">${t("rubric")}</h2>
      <div class="table bands">
        ${BANDS.map((b) => `<div class="row ${b === band ? "on" : ""}" ${b === band ? 'aria-current="true"' : ""}><div class="range">${b.min}–${b.max}</div><div class="band">${esc(t("bands")[b.id][0])}</div><div class="mean">${esc(t("bands")[b.id][1])}</div></div>`).join("")}
      </div>

      <h2 class="h2">${t("vs")}</h2>
      <div class="table">
        ${meterRow(t("you"), you, total, "you")}
        ${meterRow(t("strongAgent"), total, total)}
        ${meterRow(t("literalReader"), literal, total)}
      </div>

      <h2 class="h2">${t("category")}</h2>
      <div class="table crit">
        ${Object.keys(cats)
          .filter((k) => catScores[k])
          .map((k) => meterRow(cats[k].label, catScores[k].you, catScores[k].n, "", t("criteria")[k]))
          .join("")}
      </div>

      <h2 class="h2">${t("difficulty")}</h2>
      <div class="table crit">
        ${Object.keys(diffs)
          .filter((k) => diffScores[k])
          .map((k) => meterRow(diffs[k].label, diffScores[k].you, diffScores[k].n))
          .join("")}
      </div>

      <h2 class="h2">${t("review")}</h2>
      <div class="filters">
        <button data-filter="all" class="${reviewFilter === "all" ? "on" : ""}" aria-label="${t("allItems")}">${t("all")}</button>
        <button data-filter="missed" class="${reviewFilter === "missed" ? "on" : ""}" aria-label="${t("missedItems")}">✕ ${total - you}</button>
        <button data-filter="correct" class="${reviewFilter === "correct" ? "on" : ""}" aria-label="${t("correctItems")}">✓ ${you}</button>
      </div>
      <div class="review" id="review">${reviewHtml(answers)}</div>

      <div class="report-actions">
        <button class="btn btn-accent" data-go="retake">${shared ? t("takeIt") : t("retake")}</button>
      </div>
    </section>
  `)
  );
}

function reviewHtml(answers) {
  return items()
    .map((raw, i) => {
      const it = text(raw);
      const pick = answers[i];
      const ok = pick === it.correct;
      if (reviewFilter === "missed" && ok) return "";
      if (reviewFilter === "correct" && !ok) return "";
      const opts = it.options
        .map((o, k) => {
          const cls = k === it.correct ? "correct" : k === pick ? "wrong" : "";
          const tag = k === it.correct ? "✓" : k === pick ? "✕" : "";
          const aria = k === it.correct ? t("intended") : k === pick ? t("yourPick") : "";
          return `<div class="opt ${cls}"><span class="letter">${LETTERS[k]}</span><span class="label">${esc(o)}</span><span class="tag"${aria ? ` aria-label="${aria}"` : ""}>${tag}</span></div>`;
        })
        .join("");
      return `
      <details class="item ${ok ? "hit" : "miss"}">
        <summary>
          <span class="n">${pad(i + 1)}</span>
          <span class="mark" aria-label="${ok ? t("correct") : t("missed")}">${ok ? "✓" : "✕"}</span>
          <span class="r">${esc(it.reply)}</span>
          <span class="pick">${pick === undefined ? "–" : LETTERS[pick]}</span>
        </summary>
        <div class="body">
          <div class="context">${esc(it.context)}</div>
          ${chatHtml(it)}
          <div class="opts">${opts}</div>
          <div class="cue">${esc(it.cue)}</div>
          <p class="why">${esc(it.explanation)}</p>
        </div>
      </details>`;
    })
    .join("");
}

function renderNotice(kind) {
  show(
    { name: "notice", kind },
    el(`
    <section class="notice">
      <h1>${kind === "old" ? t("oldLink") : t("badLink")}</h1>
      <button class="btn btn-accent btn-xl" data-go="home">${t("start")(items().length)}</button>
    </section>
  `)
  );
}

function toast(msg) {
  const n = document.createElement("div");
  n.className = "toast";
  n.setAttribute("role", "status");
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 1400);
}

async function copyLink() {
  const input = document.getElementById("magic");
  try {
    await navigator.clipboard.writeText(input.value);
    toast(t("copied"));
  } catch {
    input.select();
    toast(document.execCommand && document.execCommand("copy") ? t("copied") : t("copyFailed"));
  }
}

function wrapLines(ctx, str, width) {
  const tokens = str.match(/[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+|\s+/g) || [];
  const lines = [];
  let line = "";
  for (const tok of tokens) {
    const next = line + tok;
    if (line.trim() && ctx.measureText(next.trimEnd()).width > width) {
      lines.push(line.trimEnd());
      line = tok.trimStart();
    } else line = next;
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

function coverCanvas(answers, link) {
  const W = 1080, H = 1350, M = 72;
  const css = getComputedStyle(document.documentElement);
  const v = (k) => css.getPropertyValue(k).trim();
  const c = { bg: v("--bg"), fg: v("--fg"), panel: v("--panel"), foam: v("--foam"), stitch: v("--stitch"), line: v("--line"), deep: v("--deep"), aqua: v("--aqua"), muted: v("--muted"), on: v("--on-accent") };
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const round = v("--round");
  const total = items().length;
  const you = score(answers);
  const verdict = t("bands")[bandFor(you).id][0];

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pill = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  // A patch: rounded fill with a solid seam.
  const patch = (x, y, w, h, r, fill, seam = c.stitch) => {
    pill(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = seam;
    pill(x + 2.5, y + 2.5, w - 5, h - 5, r - 2.5);
    ctx.stroke();
    ctx.restore();
  };
  const seamLine = (y) => {
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = c.line;
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(W - M, y);
    ctx.stroke();
    ctx.restore();
  };

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  patch(28, 28, W - 56, H - 56, 64, c.panel);

  ctx.textBaseline = "alphabetic";
  ctx.font = `800 54px ${round}`;
  ctx.fillStyle = c.deep;
  ctx.fillText("frontier", M, 136);
  ctx.fillStyle = c.aqua;
  ctx.fillText("human", M + ctx.measureText("frontier").width, 136);
  seamLine(182);

  const side = 420, cell = 20, top = 232;
  patch(M, top, side, side, 72, c.foam);
  drawLogo(ctx, M + (side - cell * 16) / 2, top + (side - cell * 16) / 2, cell, LOGO_COLORS[theme]);

  const sx = M + side + 32, sw = W - M - sx;
  pill(sx, top, sw, side, 72);
  ctx.fillStyle = c.deep;
  ctx.fill();
  ctx.fillStyle = c.on;
  ctx.font = `900 250px ${round}`;
  const num = String(you);
  const nw = ctx.measureText(num).width;
  ctx.font = `900 76px ${round}`;
  const dw = ctx.measureText(`/${total}`).width;
  const nx = sx + (sw - nw - dw) / 2;
  ctx.font = `900 250px ${round}`;
  ctx.fillText(num, nx, top + side / 2 + 88);
  ctx.font = `900 76px ${round}`;
  ctx.fillText(`/${total}`, nx + nw + 4, top + side / 2 + 88);

  ctx.fillStyle = c.deep;
  let size = 96;
  let lines;
  do {
    size -= 6;
    ctx.font = `800 ${size}px ${round}`;
    lines = wrapLines(ctx, verdict, W - 2 * M);
  } while (lines.length > 2 && size > 46);
  lines.slice(0, 2).forEach((l, k) => ctx.fillText(l, M, 770 + k * (size + 10)));

  const qy = 1000, qs = 270;
  seamLine(qy - 44);
  patch(M, qy, qs, qs, 36, "#ffffff", "#b9dcea");
  if (typeof window.qrcode === "function") {
    const qr = window.qrcode(0, "M");
    qr.addData(link);
    qr.make();
    const n = qr.getModuleCount();
    const m = Math.floor((qs - 56) / n);
    const ox = M + Math.round((qs - m * n) / 2), oy = qy + Math.round((qs - m * n) / 2);
    ctx.fillStyle = "#1f4466";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) ctx.fillRect(ox + k * m, oy + r * m, m, m);
  }
  ctx.fillStyle = c.deep;
  ctx.font = `800 44px ${round}`;
  wrapLines(ctx, t("cardScan"), W - M * 2 - qs - 40).slice(0, 2).forEach((l, k) => ctx.fillText(l, M + qs + 40, qy + 90 + k * 54));
  ctx.font = `700 28px ${round}`;
  ctx.fillStyle = c.muted;
  ctx.fillText(ROOT.host + ROOT.pathname.replace(/\/$/, ""), M + qs + 40, qy + qs - 24);
  return canvas;
}

function downloadCover() {
  const link = document.getElementById("magic").value;
  const canvas = coverCanvas(view.answers, link);
  canvas.toBlob((blob) => {
    if (!blob) return toast(t("copyFailed"));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frontierhuman-${score(view.answers)}-${lang}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}

/* ---------- Events ---------- */

function goHome() {
  history.replaceState(null, "", ROOT.pathname);
  renderIntro();
}

app.addEventListener("click", (e) => {
  if (e.target.id === "qr") return e.target.close();
  const opt = e.target.closest("[data-opt]");
  if (opt) return choose(Number(opt.dataset.opt));

  const filter = e.target.closest("[data-filter]");
  if (filter) {
    reviewFilter = filter.dataset.filter;
    app.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("on", b === filter));
    document.getElementById("review").innerHTML = reviewHtml(view.answers);
    return;
  }

  const go = e.target.closest("[data-go]");
  if (!go) return;
  switch (go.dataset.go) {
    case "start":
      resetState();
      history.replaceState(null, "", ROOT.pathname);
      renderQuestion();
      break;
    case "resume":
      renderQuestion();
      break;
    case "report":
      openReport(answersFromState(), false);
      break;
    case "next":
      next();
      break;
    case "prev":
      prev();
      break;
    case "home":
      goHome();
      break;
    case "retake":
      resetState();
      reviewFilter = "all";
      goHome();
      break;
    case "copy":
      copyLink();
      break;
    case "wechat":
      document.getElementById("qr").showModal();
      break;
    case "qr-close":
      document.getElementById("qr").close();
      break;
    case "cover":
      downloadCover();
      break;
    case "native": {
      const link = document.getElementById("magic").value;
      const you = score(view.answers);
      navigator.share({ title: "FrontierHuman", text: t("shareText")(you, items().length, t("bands")[bandFor(you).id][0]), url: link }).catch(() => {});
      break;
    }
  }
});

document.querySelector('[data-action="home"]').addEventListener("click", (e) => {
  e.preventDefault();
  if (base) goHome();
});

document.addEventListener("keydown", (e) => {
  if (!app.querySelector(".options")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest("button") && e.key === "Enter") return;
  const n = "1234".indexOf(e.key);
  const l = e.key.length === 1 ? "abcd".indexOf(e.key.toLowerCase()) : -1;
  if (n >= 0) choose(n);
  else if (l >= 0) choose(l);
  else if (e.key === "Enter") next();
  else if (e.key === "ArrowLeft") prev();
});

/* ---------- Boot ---------- */

async function boot() {
  try {
    const [en, z] = await Promise.all(["data/items.json", "data/items.zh.json"].map((u) => fetch(u, { cache: "no-cache" }).then((r) => r.json())));
    base = en;
    zh = z;
  } catch {
    app.textContent = "Couldn't load the exam.";
    return;
  }
  const params = new URLSearchParams(location.search);
  if (params.has("reset")) resetState();
  if (params.has("r")) {
    const decoded = decodeAnswers(params.get("r"));
    if (decoded.error) return renderNotice(decoded.error);
    const mine = state.finished && encodeAnswers(answersFromState()) === encodeAnswers(decoded.answers);
    return renderReport(decoded.answers, !mine);
  }
  renderIntro();
}

boot();
