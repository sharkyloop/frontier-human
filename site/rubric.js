export const BANDS = [
  { id: "agent", min: 17, max: 20 },
  { id: "strong", min: 13, max: 16 },
  { id: "context", min: 9, max: 12 },
  { id: "leaning", min: 5, max: 8 },
  { id: "literal", min: 0, max: 4 }
];

export const BAND_TEXT = {
  en: {
    agent: ["Agent-level intent detection", "Reads non-answers, reversals and tone the way a strong agent does."],
    strong: ["Strong collaborator", "Reliable; slips on spread-out cues or clever compromises."],
    context: ["Context-aware", "Uses context, but often takes the words at face value."],
    leaning: ["Literal-leaning", "Mostly answers the words, not the person."],
    literal: ["Literal reader", "Takes every reply at face value."]
  },
  zh: {
    agent: ["Agent 级意图识别", "能像强 Agent 一样读懂没选的回答、反转和语气。"],
    strong: ["默契搭档", "大多可靠；线索分散或遇到聪明折中时会失手。"],
    context: ["能读语境", "会用上下文，但常按字面理解。"],
    leaning: ["偏字面", "多数时候回应的是字面，而不是人。"],
    literal: ["字面读者", "每句回复都按字面理解。"]
  }
};

// One line per band for the share covers.
export const SHARE_QUIP = {
  en: {
    agent: "Hears the no inside “sure…”",
    strong: "Mostly reads the room.",
    context: "Gets it about half the time.",
    leaning: "Took “sure…” as a yes.",
    literal: "They said “or”. Heard “or”."
  },
  zh: {
    agent: "听得出“行吧……”里的不行",
    strong: "基本能读懂空气",
    context: "一半时候能听懂",
    leaning: "把“行吧……”当成了同意",
    literal: "人家说“吗”，就只听到“吗”"
  }
};

// What a shared result says, by band: the score, then a confession or a dare.
const SHARE_LINE = {
  en: {
    agent: "I can tell a “sure…” from a yes. Can you?",
    strong: "An agent asked, a human said “or”, and I mostly got it. Your turn.",
    context: "Turns out “yes or” doesn't mean yes. What did they mean?",
    leaning: "I took “sure…” as a yes. It was not a yes. Beat me?",
    literal: "They said “or”. I heard “or”. Apparently that's wrong. Try it."
  },
  zh: {
    agent: "“行吧……”到底行不行，我听得出来。你呢？",
    strong: "Agent 问了一句，人只回了个“吗”，我基本都猜对了。到你了。",
    context: "原来“要吗”不等于“要”。何意味？",
    leaning: "我把“行吧……”当成了同意，结果并不是。你能比我强吗？",
    literal: "人家回了个“吗”，我就只听到了“吗”。来试试？"
  }
};

export const SHARE_TEXT = {
  en: (s, n, v) => `${s}/${n} on FrontierHuman: ${v}. ${SHARE_LINE.en[bandFor(s).id]}`,
  zh: (s, n, v) => `我在 FrontierHuman 拿了 ${s}/${n}：${v}。${SHARE_LINE.zh[bandFor(s).id]}`
};

export function bandFor(score) {
  return BANDS.find((b) => score >= b.min);
}

export const SITE = "https://frontier-human.sharkyloop.com/";

export const sharePath = (score, lang) => `s/${score}/${lang === "zh" ? "zh/" : ""}`;
