# FrontierHuman: research notes

FrontierHuman tests one narrow skill: an agent asks a clarifying question, the human answers tersely ("b", "yeah that", "whatever's simpler"), and the agent must recover the intended action. This file summarizes the research the 20 items are built on.

## 1. Clarification datasets: what people actually ask and answer

- **ClarQ** (Kumar & Black, ACL 2020): ~2M clarifying questions mined from StackExchange post/comment pairs across 173 domains. Real clarification exchanges are short and context-dependent; the answer to a clarifying question often only makes sense against the original post. [arXiv:2006.05986](https://arxiv.org/abs/2006.05986)
- **Qulac / ClariQ** (Aliannejadi et al., SIGIR 2019; ConvAI3 2020): crowdsourced *request → clarifying question → user answer* triples. User answers are frequently elliptical or negative ("No, I want to find out where I can purchase…"), so the system has to merge the answer with the original request rather than read it alone. ClariQ also frames the first decision: *when* to ask at all. [github.com/aliannejadi/ClariQ](https://github.com/aliannejadi/ClariQ)
- **AmbigQA** (Min et al., EMNLP 2020): over half of NQ-Open questions turn out to be ambiguous (entity, event, and time references). Ambiguity is the norm in natural requests, not an edge case. [arXiv:2004.10645](https://arxiv.org/abs/2004.10645)
- **CLAMBER** (Zhang et al., ACL 2024): ~12K queries over a taxonomy of epistemic misalignment, linguistic ambiguity (lexical, semantic), and aleatoric output. Two findings matter here: LLMs "struggle to use contextual cues to clarify pronouns", and chain-of-thought/few-shot prompting can make models *overconfident* about ambiguity. [arXiv:2405.12063](https://arxiv.org/abs/2405.12063)

## 2. Ask-vs-act in coding agents

- **Ambig-SWE** (ICLR 2026; arXiv 2025): an underspecified variant of SWE-bench Verified. Models struggle to tell well-specified from underspecified tasks, but when they *do* interact, resolve rates improve by up to 74% over non-interactive runs. The strongest agents explore the codebase first and ask only what cannot be discovered, keeping questions answerable by the user. [arXiv:2502.13069](https://arxiv.org/abs/2502.13069)
- **Ask or Assume?** (Findings of EMNLP 2026): an uncertainty-aware multi-agent scaffold that separates underspecification detection from execution reaches a 69.4% resolve rate on underspecified SWE-bench, close to fully specified runs, and asks fewer questions on easy tasks. [aclanthology.org/2026.findings-emnlp.15](https://aclanthology.org/2026.findings-emnlp.15.pdf)
- **HumanEvalComm** (Wu & Fard, 2024): HumanEval problems altered to be inconsistent, ambiguous, or incomplete. More than 60% of code-LLM responses still write code instead of asking. [arXiv:2406.00215](https://arxiv.org/abs/2406.00215)
- **ACT: Learning to Clarify** (Chen et al., ICLR 2025): RLHF-tuned assistants "overhedge or implicitly guess users' ground-truth intents rather than asking". Training on contrastive *clarify vs. answer* actions improves multi-turn disambiguation, including in AmbigSQL. [arXiv:2406.00222](https://arxiv.org/abs/2406.00222)
- **STaR-GATE** (Andukuri et al., COLM 2025): a model that learns to ask questions about a user's latent preferences produces responses preferred 72% of the time. Eliciting preferences works only if the answer is then *used*. [arXiv:2403.19154](https://arxiv.org/abs/2403.19154)

## 3. Grounding: why humans answer tersely

- **Clark & Brennan (1991), Clark & Wilkes-Gibbs (1986)**: the *principle of least collaborative effort*. Speakers minimize joint effort and rely on shared context to finish meaning, so short answers are rational. "b" is a complete answer *if* the listener tracks what "b" is bound to. [Grounding in communication (PDF)](https://web.stanford.edu/~clark/1990s/Clark,%20H.H.%20_%20Brennan,%20S.E.%20_Grounding%20in%20communication_%201991.pdf)
- **Grice's maxims** (Quantity, Manner): a hedge or a sarcastic "sure, why not" flouts a maxim on purpose, and the implied meaning is the intended one.
- **Navigating Rifts in Human-LLM Grounding** (Shaikh et al., 2025): in WildChat, MultiWOZ, and Bing Chat logs, people are 3x more likely to clarify and 16x more likely to issue follow-ups than LLMs; early grounding failures cascade into later failures. [arXiv:2503.13975](https://arxiv.org/abs/2503.13975)
- **LLMs Get Lost in Multi-Turn Conversation** (Laban et al., ICLR 2026): an average 39% drop from single-turn to multi-turn underspecified settings over 200K+ simulated conversations. Models "make assumptions in early turns", over-rely on them, and lose constraints stated earlier. [arXiv:2505.06120](https://arxiv.org/abs/2505.06120)

## 4. Non-answers: "or", "yes", "both?", "sure…", "wait no"

The hardest replies don't pick an option at all. Conversation analysis has studied each of these.

- **Turn-final "or"** (Drake, *Research on Language and Social Interaction* 48(3), 2015). In natural American English, "Does that bring up jealousy for you **or**" is an *epistemic downgrade* with three jobs: (a) it makes a disconfirmation easy, (b) it gestures toward an alternative left unsaid, and (c) it is treated as needing elaboration. A human reply of just "or" to a yes/no question uses the same resource, so its meaning depends on context: a soft no, a pointer to an alternative already in the air, or a request to explain. "yes or" and "no or" lean one way while leaving that door open. [doi:10.1080/08351813.2015.1058606](https://doi.org/10.1080/08351813.2015.1058606)
- **Preference organization** (Pomerantz 1984; Sacks 1987; Levinson 1983). Agreement comes quickly and plainly. Disagreement is delayed, softened, and prefaced with token agreement ("yes, but…", "well…"). A drawn-out "sure…" or "I mean… I guess" is the shape of a dispreferred answer, not a yes. Schegloff (1988) shows these pre-disagreements invite the first speaker to recast their proposal so the other person never has to say no. [Schegloff, *Discourse as an interactional achievement II* (PDF)](https://www.conversationanalysis.org/mp-files/discourse-as-interactional-achievement-ii-an-exercise-in-conversation-analysis.pdf/) · [emcawiki: Agreement](https://emcawiki.net/Agreement)
- **Delayed and non-conforming answers** (Stivers et al., *PNAS* 2009). Across 10 languages, answers that don't fit the question's terms, or that go against its bias, come with measurable hesitation. Hesitation is a signal, not noise. [Universals and cultural variation in turn-taking (PDF)](https://cognitionandculture.net/wp-content/uploads/Stivers_2009_universals.pdf)
- **Self-repair** (Schegloff, Jefferson & Sacks, *Language* 1977). Speakers prefer to fix their own talk, and the repair is often in progress mid-turn ("a, wait no"). An unfinished self-repair hasn't chosen anything yet. When both options are destructive, the reply may be rejecting the whole plan.
- **Sycophancy and flip-flopping** (Hong et al., *SYCON-Bench*, Findings of EMNLP 2025; Sharma et al. 2023). Models change their stance under user pressure, and alignment tuning makes this worse. The mirror-image failure in this exam is overriding a user's *latest* explicit choice because of an earlier soft preference, or re-asking until the user gives in. [aclanthology.org/2025.findings-emnlp.121](https://aclanthology.org/2025.findings-emnlp.121.pdf)
- **Pragmatic alternatives** (ALTPRAG, 2025): LLMs show emerging but imperfect sensitivity to why a speaker chose one phrasing over a near-equivalent. "or" vs. "or…?" vs. "no or" is exactly that kind of contrast. [arXiv:2505.18497](https://arxiv.org/abs/2505.18497)

## 5. Failure modes the items target

Distilled from the work above and from common coding-agent transcripts (Cursor, Claude Code, Copilot-style sessions where the agent offers "A or B?"):

| Failure mode | What goes wrong | Evidence |
| --- | --- | --- |
| Wrong ordinal binding | "b" / "the second one" bound to position in the latest sentence instead of the labeled list, or to prose order instead of the numbered recap | ClariQ elliptical answers; CLAMBER contextual-reference weakness |
| Recency over salience | "yeah, fix that" bound to the most recently mentioned item instead of the item under discussion | CLAMBER pronoun findings; Clark & Wilkes-Gibbs referring as a joint act |
| Dropped earlier constraint | "whatever's simpler" answered without the constraint the user stated turns ago (no internet at the cabin, guests in 20 minutes) | Laban et al. multi-turn degradation |
| Literal reading of hedges/sarcasm | "I guess, if it's needed?", "sure…" or "oh sure, one more alert" treated as a yes | Grice; Pomerantz; ACT overhedging/guessing |
| One reading of "or" for every context | "or" always treated as "or what?", or always as "offer an alternative" | Drake 2015: soft no vs. unsaid alternative vs. request to elaborate |
| Non-answer forced into an option | "yep" to "text or paper?" picked as one format; "both?" answered by fixing one app first | ClariQ; CLAMBER contradictions |
| Retraction read as the other option | "a, wait no" executed as (b) when both options are destructive | Schegloff, Jefferson & Sacks 1977; Ambig-SWE safety risks |
| Overriding a reversed preference | "b I guess" ignored because the user said "vegetarian if we can" earlier | SYCON-Bench stance dynamics |
| Clever compromise nobody asked for | A restyle "as a separate copy", a roast cauliflower in place of the chicken, a smaller extra | Ambig-SWE user burden; CLAMBER overconfidence |
| Ignored repair | "wait, that was supposed to be the pharmacy one" treated as a new request rather than a correction of the last action | Shaikh et al. grounding acts and repair |

## 6. Design principles for the items

1. **One defensible answer.** Every item has a cue in the context, question, or answer that a careful listener can point to. If two readings were equally plausible, a strong agent should ask again, so those items are excluded.
2. **No trivia.** No domain knowledge is needed beyond everyday life: the scenarios are errands an assistant might run (bookings, deliveries, family calendars), not code. The difficulty comes from pragmatics.
3. **Plausible distractors.** Each wrong option is a known failure mode from the table: the literal reading, the over-inference, the recency binding, the dropped constraint.
4. **Hard by default (v2).** 15 of the 20 items are hard and none are easy. Hard items include at least one of: a distractor a strong model would pick (the clever compromise or the confident misbinding), cues spread across earlier turns, a reply that reverses an earlier preference, a label that refers to something other than it seems, a polite yes that means no, or a case where asking again is correct.
5. **Same reply, different meaning.** The trailing-"or" family ("or", "or…?", "yes or", "no or") appears five times, and the two bare "or"s have opposite readings (soft no vs. an alternative already floated). "yes" appears twice (agree with the recommendation vs. both). Pattern-matching on the reply doesn't work.
6. **Some literal answers are right**, and asking again is right only when the reply is truly unfinished or the agent knows a risk the user hasn't weighed.
7. **Baselines.** The *strong agent* reference answers every item from its cue (it is the answer key). The *literal reader* baseline picks the most surface-level reading of each reply, as authored per item (`literal` in `site/data/items.json`).

## 7. Chinese adaptation

The Simplified Chinese items (`site/data/items.zh.json`) are adapted, not translated word for word, so each reply stays ambiguous in the same way:

- Turn-final "or" becomes a bare or turn-final 还是 ("还是", "还是……？", "要，还是", "不要，还是"), the word Chinese uses for "or" in a question. Left hanging, it trails off the same way Drake's "or" does: it can decline softly, point at an alternative, or hand the question back. An earlier version used a bare 吗 here; it was changed because a lone 吗 is not something people type.
- The non-committal "yes" becomes 嗯, which can mean "agreed", "I'm listening" or "both are fine" depending on the turn before.
- Hedges keep their sentence-final particles (行吧……, 那就 b 吧……), since 吧 and the trailing ellipsis carry the reluctance that "sure…" and "I guess" carry in English.
- Option letters, file names and other technical tokens stay in Latin script, as they would in a Chinese engineering chat.

Answer keys, categories and difficulty are shared across languages, so a magic link gives the same score in either language.
