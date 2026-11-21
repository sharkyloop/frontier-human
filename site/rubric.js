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

export const SHARE_TEXT = {
  en: (s, n, v) => `${s}/${n} on FrontierHuman: ${v}. What did they mean?`,
  zh: (s, n, v) => `我在 FrontierHuman 拿了 ${s}/${n}：${v}。何意味？`
};

export const bandFor = (score) => BANDS.find((b) => score >= b.min);

export const SITE = "https://frontier-human.sharkyloop.com/";

export const sharePath = (score, lang) => `s/${score}/${lang === "zh" ? "zh/" : ""}`;
