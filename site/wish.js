// Wish box: a small chat with Sharky where visitors ask for changes to this site.
// There is no backend. A wish is sent as a reply to Sharky's wish post on X, where the
// sharkyloop agent reads it and, if it can, changes the site. Granted wishes are listed
// from data/wishes.json.
const WISH_POST = "2124192119237816321";
const TAG = "[frontier-human]";
const MAX = 220;
const ROOT = new URL("./", document.baseURI);

const COPY = {
  en: {
    open: "Wish for a change",
    title: "Wish box",
    close: "Close",
    hello: "Hi, I'm Sharky. Wish for a change to this site, like a new question, a fix, or a different look, and I'll make it if I can.",
    how: "Wishes travel as a reply to my wish post on X. I read every one. I can't promise every wish.",
    grantedHead: "Wishes that already changed this site:",
    placeholder: "I wish this site…",
    send: "Send",
    label: "Your wish",
    ready: "Nice one. Post it on X so it reaches me:",
    post: "Post wish on X →",
    after: "Once it's posted I'll reply there with what I changed.",
    by: (a) => `wished by @${a}`
  },
  zh: {
    open: "许愿改网站",
    title: "许愿箱",
    close: "关闭",
    hello: "嗨，我是 Sharky。想让这个网站变个样？加一道题、修个问题、换个风格，许个愿，能做的我就做。",
    how: "愿望会作为回复发到我在 X 上的许愿帖。每一条我都会看，但不保证都能实现。",
    grantedHead: "已经改变了这个网站的愿望：",
    placeholder: "我希望这个网站…",
    send: "发送",
    label: "你的愿望",
    ready: "收到。把它发到 X，我才能看到：",
    post: "去 X 发布愿望 →",
    after: "发布后，我会在那条回复下告诉你改了什么。",
    by: (a) => `来自 @${a} 的愿望`
  }
};

const lang = () => (document.documentElement.lang.startsWith("zh") ? "zh" : "en");
const c = (k) => COPY[lang()][k];

function node(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const fab = node("button", "wish-fab");
fab.type = "button";
fab.setAttribute("aria-haspopup", "dialog");
fab.setAttribute("aria-expanded", "false");
const fabImg = node("img");
fabImg.src = new URL("sharky-mark.webp", ROOT).href;
fabImg.width = 96;
fabImg.height = 96;
fabImg.alt = "";
const fabText = node("span");
fab.append(fabImg, fabText);

const panel = node("section", "wish-panel");
panel.hidden = true;
panel.setAttribute("role", "dialog");
panel.setAttribute("aria-labelledby", "wish-title");
const head = node("header", "wish-head");
const title = node("h2");
title.id = "wish-title";
const closeBtn = node("button", "wish-close", "×");
closeBtn.type = "button";
head.append(title, closeBtn);
const log = node("div", "wish-log");
log.setAttribute("aria-live", "polite");
const form = node("form", "wish-form");
const input = node("textarea");
input.rows = 2;
input.maxLength = MAX;
input.required = true;
const send = node("button", "wish-send");
send.type = "submit";
form.append(input, send);
panel.append(head, log, form);

let granted = [];
let sent = []; // wishes typed this visit

function bubble(who, text) {
  const b = node("div", `wish-msg from-${who}`);
  b.append(node("p", "", text));
  log.append(b);
  return b;
}

function render() {
  fabText.textContent = c("open");
  title.textContent = c("title");
  closeBtn.setAttribute("aria-label", c("close"));
  input.placeholder = c("placeholder");
  input.setAttribute("aria-label", c("label"));
  send.textContent = c("send");
  log.textContent = "";
  bubble("sharky", c("hello"));
  bubble("sharky", c("how"));
  if (granted.length) {
    const b = bubble("sharky", c("grantedHead"));
    const ul = node("ul");
    for (const g of granted.slice(-5).reverse()) {
      const li = node("li", "", (lang() === "zh" && g.change_zh) || g.change);
      if (g.author) li.append(node("small", "", c("by")(g.author)));
      ul.append(li);
    }
    b.append(ul);
  }
  for (const wish of sent) answer(wish);
  log.scrollTop = log.scrollHeight;
}

function answer(wish) {
  bubble("you", wish);
  const b = bubble("sharky", c("ready"));
  const a = node("a", "wish-post", c("post"));
  a.href = `https://x.com/intent/post?in_reply_to=${WISH_POST}&text=${encodeURIComponent(`${TAG} ${wish}`)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.addEventListener("click", () => window.gtag && window.gtag("event", "wish_post"));
  b.append(a, node("p", "wish-note", c("after")));
}

function setOpen(open) {
  panel.hidden = !open;
  fab.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("wish-open", open);
  if (open) {
    window.gtag && window.gtag("event", "wish_open");
    log.scrollTop = log.scrollHeight;
    input.focus();
  } else {
    fab.focus();
  }
}

fab.addEventListener("click", () => setOpen(panel.hidden));
closeBtn.addEventListener("click", () => setOpen(false));
panel.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setOpen(false);
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.target === input) {
    e.preventDefault();
    form.requestSubmit();
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const wish = input.value.replace(/\s+/g, " ").trim();
  if (!wish) return;
  sent.push(wish);
  input.value = "";
  answer(wish);
  log.scrollTop = log.scrollHeight;
});

new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

document.body.append(fab, panel);
render();

fetch(new URL("data/wishes.json", ROOT))
  .then((r) => (r.ok ? r.json() : { granted: [] }))
  .then((d) => {
    granted = Array.isArray(d.granted) ? d.granted : [];
    if (granted.length) render();
  })
  .catch(() => {});
