# FrontierHuman

An intent-detection benchmark for humans. An AI agent asks a clarifying question ("Should I delete the old migration? Yes or no?"), the human answers tersely ("or", "yes", "b I guess", "a, wait no"), and you pick what they actually meant, the way a strong agent would.

**Take it:** https://frontier-human.sharkyloop.com/

- 20 items across six categories: trailing "or", non-answers, ordinal reference, pointers & repair, implicit constraint, sarcasm & hedging.
- 15 hard and 5 medium. Each wrong option is a documented agent failure mode, and many are the answer a strong model would give.
- English and Simplified Chinese (EN / 中 toggle; defaults to the browser language). The Chinese items are adapted, not word-for-word, so each keeps its ambiguity (trailing "or" becomes a bare 吗).
- The report shows your score, verdict, a rubric of all five bands with yours highlighted, comparisons with strong-agent and literal-reader baselines, per-category criteria and an explanation for every item.
- Magic link: finishing puts `?r=<version>.<code>` in the URL. The code packs your answers (2 bits each, plus a checksum) in base64url, so the link rebuilds the same report on any device with no backend. Links from an older version of the exam, or damaged links, show a notice instead.
- Share to X, LinkedIn, Facebook, Reddit, Weibo, WeChat (QR code) or the system share sheet. Shared links point at a static page per score and language (`/s/<score>/?r=…`, `/s/<score>/zh/?r=…`) whose Open Graph and Twitter tags show that score's cover, and the page opens the full report.
- "Follow Sharky" card on the report (sharkyloop's plush style: mascot, soft border, pill links to X and Discord), plus round X and Discord buttons in the header next to the language toggle, on phones too. They share the toggle's colours and height.
- "↓ Cover" saves a 1080×1350 PNG result card (score, verdict, QR of the report link) in the current language and theme, for places where links don't preview.
- Wish box: a floating "Wish for a change" chat with Sharky on every page except during the exam. The button is a small round Sharky in the corner; its label unfolds on hover or keyboard focus, and stays open on screens 1500 px and wider. There is no backend: a wish opens X as a reply to Sharky's wish post, tagged `[frontier-human]`, and the sharkyloop agent reads it there and changes the site if it can. Granted wishes are listed from `site/data/wishes.json`.
- Pixel-art logo on a 16×16 grid: Sharky, the agent, with a question mark over its head. It is used for the header, the favicons and the result card; the covers show the sharkyloop mascot.
- Plush sharkyloop design (rounded type, shark blues, foam fills, dashed "stitched" outlines, the shark mascot on the home screen) with light and dark themes (follows `prefers-color-scheme`; the toggle choice is saved), tuned for phones down to 360 px wide.
- Google Analytics (GA4). The measurement ID is set once, in the first script in `site/index.html`.

## Layout

| Path | What |
| --- | --- |
| `research.md` | Research summary with sources |
| `site/data/items.json` | The 20 exam items (English) |
| `site/data/items.zh.json` | Chinese text for the same items, keyed by id |
| `site/vendor/qrcode.js` | qrcode-generator 1.5.2 (MIT), for the QR codes |
| `site/wish.js`, `site/data/wishes.json` | The wish box and the list of granted wishes it shows |
| `site/logo.js`, `site/rubric.js` | Logo pixels and verdict bands, shared by the app and the build scripts |
| `site/covers/` | Social covers: `default-{en,zh}.png` and `{en,zh}/<score>.png` (1200×630) |
| `tools/build-assets.mjs` | Renders the logo SVGs, favicons and covers (needs Playwright, or `CHROME_PATH` pointing at an installed Chrome; run after changing the logo, bands or cover copy, then bump `COVER_V` in `tools/build-pages.mjs`) |
| `tools/fonts/` | Nunito (OFL), embedded in the covers so they render the same on every machine |
| `tools/build-pages.mjs` | Writes `site/zh/` and the per-score share pages from `site/index.html` (no dependencies; also runs in the Pages workflow) |
| `site/` | Static site (plain HTML/CSS/JS, no build step) |

When you change `styles.css`, `app.js` or `wish.js`, bump the `?v=` number on their tags in `site/index.html` so visitors with a cached copy get the new files together with the new HTML.
| `.github/workflows/pages.yml` | Validates both item files, builds the share pages, checks every cover exists and deploys `site/` to GitHub Pages on push to `main` |

## Run locally

```sh
node tools/build-pages.mjs
python3 -m http.server 8000 --directory site
# open http://localhost:8000
```

Answers are kept in `localStorage` and the magic link.
