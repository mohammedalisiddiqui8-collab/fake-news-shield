"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { deriveSourceCounts } from "../lib/investigationStats";

// ═══════════════════════════════════════════════════════════════════════════════
// Veritas Fake News Detection Engine v6
// Single source of truth for one investigation:
//   text → claims → LIVE external source cross-check → evidence → verdict
// Linguistic pattern analysis is a SUPPLEMENTARY signal only.
// The verdict and confidence are gated by retrieved external evidence.
// No fabricated sources, no fake evidence, no unsupported high confidence.
// ═══════════════════════════════════════════════════════════════════════════════

type Depth = "quick" | "standard" | "deep";

/** How many claims get a live external cross-check, per depth. */
const CROSSCHECK_LIMIT: Record<Depth, number> = { quick: 3, standard: 5, deep: 8 };
/** Max claims extracted — EQUAL to the cross-check limit so EVERY extracted
 *  claim is cross-checked and appears in Source Cross-Check (no claim is ever
 *  left silently unverified because of depth truncation). */
const CLAIM_LIMIT: Record<Depth, number> = CROSSCHECK_LIMIT;

const SENSATIONALIST: Array<[RegExp, number]> = [
  [/[A-Z]{3,}!{2,}/g, 8], [/shocking|unbelievable|mind[- ]?blowing/gi, 6],
  [/miracle|wonder|amazing|incredible/gi, 5], [/urgent|breaking|just in/gi, 4],
  [/exposed|revealed/gi, 6], [/secret|hidden|suppressed|banned|censored/gi, 6],
  [/cover[- ]?up|conspiracy/gi, 7], [/they don'?t want you to know/gi, 8],
  [/share (this|before|now)|before they delete/gi, 7],
  [/wake up|open your eyes|do your research/gi, 6],
  [/the truth (about|they|is)|what they'?re hiding/gi, 7],
  [/mainstream media (won'?t|doesn'?t|is paid)/gi, 8],
  [/you won'?t (believe|want to miss)/gi, 7],
];

const CLICKBAIT: Array<[RegExp, number]> = [
  [/you won'?t believe/i, 6], [/doctors? (don'?t|hate|are shocked)/i, 7],
  [/(one|a) (trick|simple|weird|secret)/i, 5], [/number \d+ will (shock|amaze|surprise)/i, 7],
  [/\d+%\s*of\s*(people|doctors)\s*(don'?t|won'?t)/i, 7],
  [/(before it'?s|while you still can)/i, 5],
  [/(click here|act now|limited time)/i, 6],
  [/(celebrities|hate|love) this (trick|secret)/i, 7],
];

const ANONYMOUS_SOURCING: Array<[RegExp, number]> = [
  [/experts? (say|claim|believe|warn)/gi, 4], [/studies (show|reveal|suggest|prove)/gi, 3],
  [/scientists? (say|warn|discover|reveal)/gi, 3], [/insiders? (reveal|say|claim)/gi, 5],
  [/sources? (say|claim|reveal)/gi, 4], [/anonymous (source|insider|official)/gi, 7],
  [/(people|everyone) (are saying|say|claim)/gi, 5],
];

const FEAR_MONGERING: Array<[RegExp, number]> = [
  [/(they|the elite|the powerful) (are|want|plan|will) to/gi, 5],
  [/big (pharma|tech|media|tobacco|oil)/gi, 6],
  [/deep state|new world order|illuminati/gi, 7],
  [/mind control|brainwash|programming/gi, 6],
  [/depopulation|eugenics|population control/gi, 7],
];

const CONSPIRACY: Array<[RegExp, number]> = [
  [/conspiracy|conspir(acy|ies|ing)/gi, 6], [/cover[- ]?up|covering up/gi, 6],
  [/wake up|open your eyes/gi, 6], [/do your (own )?research/gi, 5],
  [/sheeple/gi, 7], [/fake news|lamestream/gi, 5],
  [/deep state|shadow government/gi, 7], [/globalist|global elites|cabal/gi, 6],
  [/censored|silenced|suppressed/gi, 5],
];

const CREDIBLE_INDICATORS: Array<[RegExp, number]> = [
  [/according to (the |a |research |official )/gi, 5],
  [/published (in|on|by)/gi, 6], [/(study|research|report) (published|found|conducted)/gi, 6],
  [/(data|findings) (from|show|indicate)/gi, 5],
  [/(officials?|spokesperson) (said|stated|confirmed)/gi, 5],
  [/in a (press|public|official) statement/gi, 6],
  [/(CEO|CTO|CFO|president|director|minister)/gi, 4],
  [/(peer[- ]?reviewed|peer reviewed)/gi, 7],
  [/(found that|showed that|revealed that|confirmed that)/gi, 4],
];

const CREDIBLE_SOURCES = [
  /\breuters\b/i, /\bbc\b/i, /\bnew york times\b/i, /\bthe guardian\b/i,
  /\bnature\b/i, /\bscience\b/i, /\bthe lancet\b/i, /\bjournal of\b/i,
  /\buniversity of\b/i, /\bnasa\b/i, /\bcdc\b/i, /\bfda\b/i,
  /\bharvard\b/i, /\bmit\b/i, /\bstanford\b/i, /\boxford\b/i,
];

// ─── KEYWORD HIGHLIGHTING ─────────────────────────────────────────────────

function findTriggeredKeywords(text: string): string[] {
  const keywords: string[] = [];
  const allPatterns = [
    ...SENSATIONALIST, ...CLICKBAIT, ...ANONYMOUS_SOURCING,
    ...FEAR_MONGERING, ...CONSPIRACY,
  ];
  for (const [pattern] of allPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches.slice(0, 2)) {
        const clean = m.trim();
        if (clean.length > 2 && !keywords.includes(clean)) keywords.push(clean);
      }
    }
  }
  return keywords.slice(0, 15);
}

function weightedMatches(text: string, patterns: Array<[RegExp, number]>) {
  let total = 0, score = 0;
  const matches: string[] = [];
  for (const [pattern, weight] of patterns) {
    const found = text.match(pattern);
    if (found) {
      total += found.length;
      score += found.length * weight;
      matches.push(...found.slice(0, 2).map(m => m.trim()));
    }
  }
  return { total, score, matches: [...new Set(matches)].slice(0, 3) };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE EXTERNAL SOURCE CROSS-CHECK
// Retrieves real, independent news coverage for a claim via Google News RSS
// (server-side fetch, no API key). NOTHING here is fabricated: every returned
// source is an actual retrieved result with its real headline, publisher,
// date and URL. If the search fails or returns nothing useful, that is
// reported explicitly.
// ═══════════════════════════════════════════════════════════════════════════════

// Proposition-level relationship of a retrieved source to a claim:
//   supports        — source content AGREES with the claim's proposition
//   contradicts     — source content is INCOMPATIBLE with the claim's proposition
//   partial         — source addresses the proposition but only confirms part of it
//   does_not_address— source mentions the same topic/entity but never the proposition
//   unverified      — snippet too thin to compare the proposition reliably
//   insufficient    — sentinel notice (no real source retrieved)
type Relationship =
  | "supports" | "contradicts" | "partial"
  | "does_not_address" | "unverified" | "insufficient";

interface RetrievedSource {
  name: string;        // real publisher
  headline: string;    // real headline
  date: string;        // real pubDate (or "N/A")
  excerpt: string;     // real description/snippet from the result
  url: string;         // real URL ("" for sentinel notices)
  relationship: Relationship;
  /** Why this relationship was assigned (proposition-level detail). */
  reason?: string;
}

interface ClaimSearch {
  ok: boolean;
  error?: string;
  sources: RetrievedSource[];
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had",
  "has", "his", "her", "was", "one", "our", "out", "day", "get", "has", "have",
  "him", "its", "new", "now", "old", "see", "two", "way", "who", "did", "does",
  "did", "that", "this", "these", "those", "with", "from", "they", "been",
  "were", "said", "each", "which", "their", "will", "other", "about", "many",
  "then", "them", "would", "could", "into", "than", "also", "after", "before",
  "during", "between", "more", "some", "such", "only", "over", "under", "when",
  "what", "where", "how", "why", "who", "has", "have", "had", "being", "does",
  "did", "done", "may", "might", "must", "should", "shall", "very", "just",
  "because", "while", "although", "however", "both", "same", "own", "too",
]);

/** Content-bearing tokens for a claim, used for overlap scoring. */
function claimTokens(text: string): string[] {
  return [...new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9%$.\s-]/g, " ")
      .split(/\s+/)
      // Trim stray punctuation ("volume." → "volume") but keep "5.5%" and "5.5".
      .map(w => w.replace(/^[^\w%$]+/, "").replace(/[^\w%)]+$/, ""))
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w.replace(/[^a-z]/g, ""))),
  )];
}

// ─── PROPOSITION-LEVEL CLAIM ↔ EVIDENCE COMPARISON ────────────────────────
// A claim is decomposed into its full proposition: key entities, event,
// action, location/destination, date, quantities, relationships and
// superlatives. A retrieved source is compared against that PROPOSITION —
// never against the topic alone. Mentioning the same person, organization,
// event or topic is NOT corroboration. A source only SUPPORTS a claim when
// its content actually agrees with what the claim asserts, and it
// CONTRADICTS when its content is directly incompatible with the claim.

/** Headline-level signals that a source disputes the claim. Conservative. */
const DEBUNK_PATTERN =
  /\b(false|misleading|debunk(ed|ing)?|fact[- ]?check(ed|ing)?|hoax|misinformation|disinformation|untrue|not true|no evidence|false claim|wrong|baseless|conspiracy (claim|theory|theories))\b/i;

/** Evidentiary rank used when selecting the most relevant retrieved results. */
const RELATIONSHIP_RANK: Record<Relationship, number> = {
  contradicts: 4, supports: 4, partial: 3, unverified: 1,
  does_not_address: 0, insufficient: 0,
};

/** Number words → value so quantities compare ("ten days" == "10 days"). */
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};
const SCALE_WORDS = new Set(["hundred", "thousand", "million", "billion", "trillion"]);

/** Canonical place lexicon — generic (celestial bodies, countries, regions). */
const PLACE_LEXICON: Array<[string, RegExp]> = [
  ["mars", /\b(mars|martian)\b/i],
  ["moon", /\b(moon|lunar)\b/i],
  ["earth", /\b(earth|earthbound)\b/i],
  ["venus", /\bvenus\b/i],
  ["jupiter", /\b(jupiter|jovian)\b/i],
  ["saturn", /\b(saturn|saturnian)\b/i],
  ["mercury", /\bmercury\b/i],
  ["the sun", /\b(the sun|solar)\b/i],
  ["international space station", /\b(international space station|iss)\b/i],
  ["north korea", /\bnorth korea\b/i],
  ["south korea", /\bsouth korea\b/i],
  ["united states", /\b(united states|usa)\b/i],
  ["united kingdom", /\b(united kingdom|great britain)\b/i],
  ["afghanistan", /\bafghanistan\b/i], ["iraq", /\biraq\b/i],
  ["iran", /\biran\b/i], ["israel", /\bisrael\b/i],
  ["lebanon", /\blebanon\b/i], ["syria", /\bsyria\b/i],
  ["ukraine", /\bukraine\b/i], ["russia", /\brussia\b/i],
  ["china", /\bchina\b/i], ["taiwan", /\btaiwan\b/i],
  ["japan", /\bjapan\b/i], ["india", /\bindia\b/i],
  ["pakistan", /\bpakistan\b/i], ["vietnam", /\bvietnam\b/i],
  ["france", /\bfrance\b/i], ["germany", /\bgermany\b/i],
  ["italy", /\bitaly\b/i], ["spain", /\bspain\b/i],
  ["greece", /\bgreece\b/i], ["turkey", /\bturkey\b/i],
  ["poland", /\bpoland\b/i], ["ireland", /\bireland\b/i],
  ["brazil", /\bbrazil\b/i], ["mexico", /\bmexico\b/i],
  ["canada", /\bcanada\b/i], ["australia", /\baustralia\b/i],
  ["south africa", /\bsouth africa\b/i], ["nigeria", /\bnigeria\b/i],
  ["egypt", /\begypt\b/i], ["saudi arabia", /\bsaudi arabia\b/i],
];

const MONTHS =
  "january|february|march|april|may|june|july|august|september|october|november|december";

/** Verb cues tying a nearby place to an event (NOT commercial wording). */
const PLACE_CUES =
  /\b(mission|flight|trip|journey|voyage|expedition|launch(?:ed|es|ing)?|land(?:ed|s|ing)?|touchdown|surface|orbit(?:ed|s|ing)?|flyby|fly\s+by|flew|flies|flown|fly|travel(?:ed|ing)?|visit(?:ed|s|ing)?|summit|conference|war|conflict|crash(?:ed|es)?|earthquake|hurricane|tornado|flood|storm|attack(?:ed|s)?|deployed|stationed|held|takes?\s+place|election|stadium|tournament)\b/i;

/** "<event verb> … to/on/around <place>" directly before a place mention. */
const DEST_CONTEXT =
  /\b(?:mission|flight|trip|journey|voyage|expedition|travel(?:ing|led)?|flew|flies|flown|fly|flying|land(?:ed|ing)?|touchdown|orbit(?:ed|ing)?|visit(?:ed|ing)?|launch(?:ed|ing)?|arrived|arriving|heading|headed)\b[^.?!]{0,24}\b(?:to|on|in|at|around|into|onto|across|toward|towards)\s+(?:the\s+)?$/i;

/** A place right after a home-return phrase is an origin/home, not the claim's
 *  event destination ("returned safely to Earth" never contradicts a mission). */
const RETURN_CONTEXT =
  /\b(?:return(?:ed|s|ing)?|coming\s+back|head(?:ed|ing)\s+back|homeward|travell?ing\s+home)\b[^.?!]{0,30}\b(?:back\s+)?to\s*$/i;

/** Actions a claim can assert — drives agreement and explicit-negation checks. */
const ACTION_LEXICON: Array<[string, RegExp]> = [
  ["confirm", /\b(confirm(?:ed|s|ing)?)\b/i],
  ["land", /\b(land|landed|lands|landing|touch(?:ed|ing)?\s*down|touchdown|set\s*foot)\b/i],
  ["launch", /\b(launch(?:ed|es|ing)?)\b/i],
  ["win", /\b(win(?:s|ning)?|won)\b/i],
  ["discover", /\b(discover(?:ed|s|ing)?)\b/i],
  ["release", /\b(release(?:d|s|ing)?)\b/i],
  ["approve", /\b(approv(?:ed|es|ing)|approval)\b/i],
  ["ban", /\b(bann(?:ed|s|ing)|ban)\b/i],
  ["sign", /\b(sign(?:ed|s|ing))\b/i],
  ["elect", /\b(elect(?:ed|s|ing)|election)\b/i],
  ["die", /\b(died|dies|dying|death|killed|killing)\b/i],
  ["crash", /\b(crash(?:ed|es|ing)?)\b/i],
  ["explode", /\b(explod(?:ed|es|ing)|explosion)\b/i],
  ["acquire", /\b(acquir(?:ed|es|ing)|acquisition)\b/i],
  ["merge", /\b(merg(?:ed|es|ing)|merger)\b/i],
  ["recall", /\b(recall(?:ed|s|ing)?)\b/i],
  ["arrive", /\b(arriv(?:ed|es|ing)|reach(?:ed|es|ing))\b/i],
  ["orbit", /\b(orbit(?:ed|s|ing)|flyby|flew\s+around|circled)\b/i],
  // Change-of-magnitude / direction families. A claim and a source that report
  // OPPOSITE directions for the same subject disagree about the proposition;
  // the same direction with a rounded figure corroborates it.
  ["increase", /\b(increas(?:e|ed|ing|es)|ris(?:e|es|ing)|rose|risen|grew|grown|growing|grow|gains?|gained|surge(?:d|s|ing)?|jump(?:ed|s|ing)?|soar(?:ed|s|ing)?|climb(?:ed|s|ing)?|climbed|escalat(?:e|ed|ion|ing)?|accelerat(?:e|ed|ion|ing)?|reached)\b/i],
  ["decrease", /\b(decreas(?:e|ed|ing|es)|declin(?:e|ed|ing)|fall(?:s|ing)?|fell|fallen|drop(?:ped|s|ping)?|shrink(?:s|ing)?|shrank|loss|lost|lose|losing|loses|plummet(?:ed|s|ing)?|slid|slide|contract(?:ed|s|ing)?|reduc(?:e|ed|ion|ing)|erod(?:e|ed|ing)|melt(?:ed|s|ing)?|wast(?:e|ed|ing)?|diminish(?:ed|es|ing)?|dwindl(?:ed|ing)?)\b/i],
  ["warn", /\b(warn(?:ed|s|ing)?|warning(?:s)?)\b/i],
  ["threaten", /\b(threaten(?:ed|s|ing)?|threat(?:s)?)\b/i],
  ["cause", /\b(caus(?:e|ed|es|ing)|trigger(?:ed|s|ing)?|result(?:ed|s|ing)?\s+in|led\s+to|leads?\s+to)\b/i],
];

/** Mutually informative event-type signals (a flyby involves no landing). */
const EVENT_LANDING = /\b(land|landed|lands|landing|touch(?:ed|ing)?\s*down|touchdown|set\s+foot)\b/i;
const EVENT_FLYBY =
  /\b(flyby|fly\s+by|flew\s+around|flies\s+around|flying\s+around|orbited|orbit(?:s|ing)?\s+around|circled|flew\s+past|lunar\s+orbit)\b/i;

/** Explicit negation of an asserted action ("did not land", "never confirmed").
 *  Inflected forms are matched so "did not complete a landing" negates the
 *  same asserted action as "did not land". */
const NEGATION_PATTERN =
  /\b(?:not|never|no|did\s+not|didn['’]t|does\s+not|doesn['’]t|has\s+not|hasn['’]t|had\s+not|was\s+not|were\s+not|weren['’]t|wasn['’]t|cannot|can['’]t|won['’]t|without)\s+(?:\w+\s+){0,3}?(land(?:ed|ing|s)?|confirm(?:ed|s|ing)?|launch(?:ed|es|ing)?|won|win(?:s|ning)?|discover(?:ed|s|ing)?|releas(?:ed|es|ing)|approv(?:ed|es|ing|al)|bann?(?:ed|s|ing)|sign(?:ed|s|ing)|elect(?:ed|s|ing|ion)|died|dies|dying|death|killed|killing|crash(?:ed|es|ing)?|explode[ds]?|acquir(?:ed|es|ing)|merg(?:ed|es|ing)|recall(?:ed|s|ing)?|reach(?:ed|es|ing)?|arriv(?:ed|es|ing)|complete[ds]?|complet(?:ed|ing)|achiev(?:ed|es|ing)|detect(?:ed|s|ing)?|surviv(?:ed|es|ing))\b/i;

/** Common words that merely start a sentence — never entities. */
const COMMON_START_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "by", "for", "and", "but", "or", "so",
  "we", "he", "she", "it", "they", "this", "that", "these", "those", "after",
  "before", "why", "how", "what", "when", "where", "who", "new", "says",
  "said", "as", "of", "to", "from", "with", "its", "their",
  // Quantifiers and discourse markers are not named subjects.
  "more", "most", "less", "least", "many", "much", "several", "such", "both",
  "all", "some", "any", "each", "every", "other", "another", "there", "here",
  "until", "while", "although", "though", "because", "since", "during",
  "between", "about", "over", "under", "after", "one", "two", "three",
]);

interface PropositionQuant { noun: string; value: number; }

/** Full proposition expressed by a claim (or asserted by a source). */
interface Proposition {
  text: string;
  tokens: string[];
  entities: string[];
  places: string[];
  quantities: PropositionQuant[];
  actions: string[];
  dates: string[];
  ordinals: Array<{ ord: string; noun: string }>;
}

function canonicalPlace(fragment: string): string | null {
  for (const [canon, re] of PLACE_LEXICON) if (re.test(fragment)) return canon;
  return null;
}

function isReturnContext(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 40), index);
  return RETURN_CONTEXT.test(before);
}

/** Canonical places mentioned (home-return mentions excluded). */
function extractPlaces(text: string): string[] {
  const out = new Set<string>();
  for (const [canon, re] of PLACE_LEXICON) {
    const m = re.exec(text);
    if (!m) continue;
    if (isReturnContext(text, m.index)) continue;
    out.add(canon);
  }
  return [...out];
}

/**
 * Places stated in an event/destination context: directly tied to an event
 * cue, a destination phrase, or the shared subject itself. Topic-only place
 * mentions do not qualify — this is what makes destination conflicts precise.
 */
function qualifiedPlaces(text: string, shared: string[]): string[] {
  const out = new Set<string>();
  for (const [canon, re] of PLACE_LEXICON) {
    const m = re.exec(text);
    if (!m) continue;
    if (isReturnContext(text, m.index)) continue;
    const beforeWords = text.slice(Math.max(0, m.index - 70), m.index).toLowerCase().split(/\s+/).filter(Boolean).slice(-5).join(" ");
    const afterWords = text.slice(m.index + m[0].length, m.index + m[0].length + 40).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
    const before = text.slice(Math.max(0, m.index - 60), m.index);
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 40);
    const nearShared = shared.some(t =>
      new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(beforeWords + " " + afterWords));
    if (nearShared || PLACE_CUES.test(before) || DEST_CONTEXT.test(before) || PLACE_CUES.test(after)) {
      out.add(canon);
    }
  }
  return [...out];
}

/** Key named entities (capitalized, non-place, non-date), normalized lowercase. */
function extractEntities(text: string): string[] {
  const out = new Set<string>();
  const words = text.split(/\s+/);
  const monthRe = new RegExp("^(" + MONTHS + ")$", "i");
  for (const raw of words) {
    const w = raw.replace(/^[^A-Za-z0-9]+/, "").replace(/[^A-Za-z0-9.]+$/, "").replace(/'s$/i, "");
    if (!/^[A-Z][A-Za-z0-9.-]{1,}$/.test(w)) continue;
    if (COMMON_START_WORDS.has(w.toLowerCase())) continue;
    if (monthRe.test(w)) continue;
    if (canonicalPlace(w)) continue;
    out.add(w.toLowerCase());
  }
  return [...out];
}

/**
 * Entities that actually identify a SUBJECT. A capitalised word that merely
 * starts a sentence ("Glacier ice volume fell…", "Swiss glaciers lost…") is an
 * artefact of writing, not a proper name, and must never be treated as a
 * different subject on its own.
 */
function distinctiveEntities(text: string): string[] {
  const out = new Set<string>();
  const monthRe = new RegExp("^(" + MONTHS + ")$", "i");
  const words = text.split(/\s+/).map(raw =>
    raw.replace(/^[^A-Za-z0-9.]+/, "").replace(/[^A-Za-z0-9.]+$/, "").replace(/'s$/i, ""));
  const isNameWord = (w: string) =>
    /^[A-Z][A-Za-z0-9.-]{1,}$/.test(w) &&
    !COMMON_START_WORDS.has(w.toLowerCase()) && !monthRe.test(w);
  let run: string[] = [];
  const flush = () => {
    if (run.length >= 2) {
      const phrase = run.join(" ");
      // A run that IS a place names a setting, never a subject.
      if (!canonicalPlace(phrase)) out.add(phrase.toLowerCase());
    } else if (run.length === 1) {
      // A lone capitalised word is only a name when it is an acronym or a
      // dotted initialism — otherwise it is an ordinary word that happens to
      // be capitalised (or a Title-Case headline).
      const w = run[0];
      if (/[A-Z]{2}/.test(w) || w.includes(".")) out.add(w.toLowerCase());
    }
    run = [];
  };
  for (const w of words) {
    if (isNameWord(w)) run.push(w);
    else flush();
  }
  flush();
  return [...out];
}

/** Do two entity sets name the same subject? */
function sameEntitySet(a: string[], b: string[]): boolean {
  return a.some(e => b.some(x =>
    x === e || (e.length >= 4 && x.includes(e)) || (x.length >= 4 && e.includes(x))));
}

/** Quantity pairs ("four astronauts" → astronaut:4, "10-day" → day:10). */
function quantityPairs(text: string): PropositionQuant[] {
  const out: PropositionQuant[] = [];
  const plain =
    /\b(\d{1,3}(?:[.,]\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s*[-\s]?\s*([a-z]{3,})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = plain.exec(text)) !== null) {
    const unit = m[2].toLowerCase();
    if (unit in NUMBER_WORDS || SCALE_WORDS.has(unit)) continue;
    const value = /^\d/.test(m[1])
      ? parseFloat(m[1].replace(",", "."))
      : (NUMBER_WORDS as Record<string, number | undefined>)[m[1].toLowerCase()] ?? -1;
    if (value < 0 || Number.isNaN(value)) continue;
    out.push({ noun: unit.replace(/s$/, ""), value });
  }
  const scaled = /\b(\d+(?:[.,]\d+)?)\s*(thousand|million|billion|trillion)\s+([a-z]{3,})\b/gi;
  while ((m = scaled.exec(text)) !== null) {
    const scale = m[2].toLowerCase() === "thousand" ? 1e3
      : m[2].toLowerCase() === "million" ? 1e6
      : m[2].toLowerCase() === "billion" ? 1e9 : 1e12;
    out.push({ noun: m[3].toLowerCase().replace(/s$/, ""), value: parseFloat(m[1].replace(",", ".")) * scale });
  }
  // Percentages are measurements too ("5.5% of their ice volume" ≡
  // "5.5 per cent of the ice volume") — compare them on the same axis.
  // NOTE: no trailing \b — "%" is a non-word character, so a boundary after
  // it can never match and every "5.5%" would be silently skipped.
  const pct = /(\d+(?:[.,]\d+)?)\s*(?:%|per\s*cent|percent|pct)(?![a-z])/gi;
  while ((m = pct.exec(text)) !== null) {
    const value = parseFloat(m[1].replace(",", "."));
    if (!Number.isNaN(value)) out.push({ noun: "percent", value });
  }
  return out;
}

/** Full date expressions normalized to "month year" (plus ISO dates). */
function extractDates(text: string): string[] {
  const out = new Set<string>();
  const monthFirst = new RegExp("\\b(" + MONTHS + ")\\s+(?:\\d{1,2}(?:st|nd|rd|th)?,?\\s+)?((?:19|20)\\d{2})\\b", "gi");
  let m: RegExpExecArray | null;
  while ((m = monthFirst.exec(text)) !== null) out.add((m[1] + " " + m[2]).toLowerCase());
  const dayFirst = new RegExp("\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(" + MONTHS + ")\\s+((?:19|20)\\d{2})\\b", "gi");
  while ((m = dayFirst.exec(text)) !== null) out.add((m[2] + " " + m[3]).toLowerCase());
  const iso = /\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/g;
  while ((m = iso.exec(text)) !== null) out.add((m[1] + "-" + m[2] + "-" + m[3]));
  return [...out];
}

/** Superlatives/ordinals tied to a category noun ("first crewed"). */
function extractOrdinals(text: string): Array<{ ord: string; noun: string }> {
  const out: Array<{ ord: string; noun: string }> = [];
  const re = /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+([a-z][a-z-]{2,})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push({ ord: m[1].toLowerCase(), noun: m[2].toLowerCase().replace(/s$/, "") });
  return out;
}

/** Decompose any text into its proposition elements. */
function extractProposition(text: string): Proposition {
  return {
    text,
    tokens: claimTokens(text),
    entities: extractEntities(text),
    places: extractPlaces(text),
    quantities: quantityPairs(text),
    actions: ACTION_LEXICON.filter(([, re]) => re.test(text)).map(([canon]) => canon),
    dates: extractDates(text),
    ordinals: extractOrdinals(text),
  };
}

// ─── TOLERANT NUMERIC COMPARISON ──────────────────────────────────────────
// A source corroborates a claim when it states the SAME figure, not the same
// string: "5%", "5.5%", "more than 5%" and "5–6%" are ordinary restatements of
// one proposition. A clearly different figure for the same measure (17% vs
// 5.5%) is NOT a match — it stays a mismatch (and may contradict).

/** Relative tolerance covering ordinary rounding of a reported figure. */
const FIGURE_TOLERANCE = 0.15;
/** Wider band for explicitly approximate restatements ("about 5%", "nearly 5%"). */
const APPROX_TOLERANCE = 0.35;

function isYearValue(v: number): boolean {
  return Number.isInteger(v) && v >= 1900 && v <= 2100;
}

/** Every numeric literal in a text, with its span. */
function numericLiterals(text: string): Array<{ value: number; index: number; end: number }> {
  const out: Array<{ value: number; index: number; end: number }> = [];
  const re = /\d+(?:[.,]\d+)*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const value = parseFloat(m[0].replace(/,/g, ""));
    if (!Number.isNaN(value)) out.push({ value, index: m.index, end: m.index + m[0].length });
  }
  return out;
}

/** The claim's MEASURED figures — calendar years are dates, not measurements,
 *  and an ordinal ("the 44th president") is a rank, not a measurement. */
function measuredFigures(text: string): number[] {
  const out = new Set<number>();
  for (const { value, end } of numericLiterals(text)) {
    if (isYearValue(value)) continue;
    if (/^\s*(?:st|nd|rd|th)\b/i.test(text.slice(end))) continue;
    out.add(value);
  }
  return [...out];
}

/** How a source hedges the figure next to it ("more than 5%", "up to 6%"). */
type FigureBound = "at_least" | "at_most" | "approx" | null;

function boundAround(text: string, index: number): FigureBound {
  const before = text.slice(Math.max(0, index - 28), index).toLowerCase();
  const after = text.slice(index, index + 16).toLowerCase();
  if (/\b(?:more than|over|above|at least|exceed(?:s|ing)?|greater than|upwards of|or more)\s*$/.test(before)) return "at_least";
  if (/\b(?:up to|less than|under|below|at most|fewer than|no more than|or less)\s*$/.test(before)) return "at_most";
  if (/\b(?:about|around|nearly|almost|approximately|roughly|some|close to|an estimated|a reported)\s*$/.test(before)) return "approx";
  if (/^\s*(?:%|per\s*cent|percent)(?![a-z])/.test(after) && /\b(?:more than|over|above|at least|nearly|almost|about|around|up to|under)\s*$/.test(before)) return "approx";
  return null;
}

/** Numeric ranges stated by a source ("5–6%", "between 5 and 6 percent"). */
function statedRanges(text: string): Array<{ lo: number; hi: number }> {
  const out: Array<{ lo: number; hi: number }> = [];
  const re = /(\d+(?:[.,]\d+)?)\s*(?:-|–|—|to|and)\s*(\d+(?:[.,]\d+)?)\s*(?:%|per\s*cent|percent)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const a = parseFloat(m[1].replace(",", "."));
    const b = parseFloat(m[2].replace(",", "."));
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (a === b) continue;
    out.push({ lo: Math.min(a, b), hi: Math.max(a, b) });
  }
  return out;
}

/** Is this figure a percentage or an absolute count? They never compare. */
function figureKind(value: number, text: string): "percent" | "count" {
  for (const { value: v, end } of numericLiterals(text)) {
    if (v !== value) continue;
    // Inspect what FOLLOWS the number, not the number itself.
    const after = text.slice(end, end + 18);
    if (/^\s*(?:%|per\s*cent|percent|pct)(?![a-z])/i.test(after)) return "percent";
  }
  return "count";
}

/** Source figures that measure the same kind of thing as the claim figure. */
function comparableFigures(claimValue: number, claimText: string, sourceText: string): number[] {
  const kind = figureKind(claimValue, claimText);
  return measuredFigures(sourceText)
    .filter(v => figureKind(v, sourceText) === kind);
}

/** Does the source state this figure (directly, hedged or as a range)? */
function figureRestated(claimValue: number, claimText: string, sourceText: string): boolean {
  if (figureKind(claimValue, claimText) === "percent") {
    for (const range of statedRanges(sourceText)) {
      if (claimValue >= range.lo - Math.abs(range.hi - range.lo) - FIGURE_TOLERANCE &&
          claimValue <= range.hi + Math.abs(range.hi - range.lo) + FIGURE_TOLERANCE) {
        return true;
      }
    }
  }
  for (const value of comparableFigures(claimValue, claimText, sourceText)) {
    const index = numericLiterals(sourceText).find(l => l.value === value)!.index;
    const bound = boundAround(sourceText, index);
    const diff = Math.abs(claimValue - value);
    const scale = Math.max(Math.abs(claimValue), Math.abs(value), 1e-9);
    if (diff === 0) return true;
    if (diff / scale <= FIGURE_TOLERANCE) return true;
    if (bound === "at_least" && value >= claimValue * (1 - FIGURE_TOLERANCE)) return true;
    if (bound === "at_most" && value <= claimValue * (1 + FIGURE_TOLERANCE)) return true;
    if (bound === "approx" && diff / scale <= APPROX_TOLERANCE) return true;
  }
  return false;
}

/** The source states a CLEARLY different figure for the same measure. */
function figureContradicts(claimValue: number, claimText: string, sourceText: string): boolean {
  if (figureRestated(claimValue, claimText, sourceText)) return false;
  return comparableFigures(claimValue, claimText, sourceText).some(v =>
    Math.abs(v - claimValue) / Math.max(Math.abs(v), Math.abs(claimValue), 1e-9) > FIGURE_TOLERANCE);
}

/** Two extracted quantities are the same measurement when rounding-tolerant. */
function valuesCompatible(a: number, b: number): boolean {
  if (a === b) return true;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1e-9) <= FIGURE_TOLERANCE;
}

/** Do both texts speak about the same period, or does only one specify one? */
function periodsAgree(claimText: string, sourceText: string): boolean {
  const years = (t: string) => [...new Set((t.match(/\b(?:19|20)\d{2}\b/g) ?? []))];
  const a = years(claimText), b = years(sourceText);
  if (a.length === 0 || b.length === 0) return true;
  return a.some(y => b.includes(y));
}

// ─── TEMPORAL / CONTEXTUAL FRAME COMPATIBILITY ──────────────────────────────
// Two statements about the same subject are NOT comparable when they speak
// about different frames. A historical benchmark ("until recently, a 2% loss
// was considered extreme") is a claim about a PAST threshold; a source
// reporting "5% lost this year" is a measurement of the PRESENT period.
// Such a source neither refutes nor restates the benchmark: it is simply
// measuring something else, so it can never be a contradiction.

/** Language that frames a statement as a past-era benchmark or threshold. */
const HISTORICAL_FRAME: RegExp[] = [
  /\buntil recently\b/i,
  /\bused to\b/i,
  /\b(?:formerly|previously|historically|in the past|back then|back in the)\b/i,
  /\b(?:was|were) (?:considered|regarded|seen|treated|described|thought of|assumed|believed|known as|thought to be)\b/i,
  /\buntil (?:now|the 19|the 20)\b/i,
  /\b(?:for|over) (?:decades|years) (?:before|prior|until|earlier)\b/i,
  /\bprior to\b/i,
];

function historicalFraming(text: string): boolean {
  return HISTORICAL_FRAME.some(re => re.test(text));
}

/** The source explicitly disputes the historical statement itself. */
const HISTORICAL_DISPUTE =
  /\b(?:not (?:accurate|correct|true)|inaccurate|incorrect|was wrong|were wrong|misstated|overstated|no evidence that|never (?:considered|regarded|seen|treated))\b/i;

type FrameVerdict = "not_historical" | "same_frame" | "different_frame";

function yearSet(text: string): string[] {
  return [...new Set(text.match(/\b(?:19|20)\d{2}\b/g) ?? [])];
}

/**
 * Does the retrieved source speak about the SAME frame as a historical-benchmark
 * claim? "same_frame" → its figures are comparable with the benchmark.
 * "different_frame" → it reports a current or other-period measurement, which
 * can neither contradict nor corroborate what was true of the past frame.
 */
function historicalBenchmarkFrame(claimText: string, sourceText: string): FrameVerdict {
  if (!historicalFraming(claimText)) return "not_historical";
  // An explicit dispute of the historical statement IS a contradiction.
  if (HISTORICAL_DISPUTE.test(sourceText)) return "same_frame";
  const claimYears = yearSet(claimText), srcYears = yearSet(sourceText);
  if (claimYears.length > 0 && srcYears.length > 0 &&
      !claimYears.some(y => srcYears.includes(y))) {
    return "different_frame";
  }
  // The source pins a period the historical claim never mentions: it measures
  // that period, it does not speak to the benchmark.
  if (srcYears.length > 0 && claimYears.length === 0) return "different_frame";
  // No competing period on either side: the frames are comparable only when
  // the source itself is talking about the same past benchmark.
  if (srcYears.length === 0 && claimYears.length === 0 && !historicalFraming(sourceText)) {
    return "different_frame";
  }
  return "same_frame";
}

// ─── ATTRIBUTED QUOTATIONS ─────────────────────────────────────────────────
// "It's really just disastrous," said Dr Matthias Huss, director of …
// Corroborating such a claim requires the SAME PERSON to be named, the SAME
// statement (or a close paraphrase of it) to appear, the source to ATTRIBUTE
// the statement to that person, and the same event/period. A bare mention of
// the person is never evidence of what they said.

type QuoteAttribution = { quote: string; speaker: string };

const SPEAKING_VERBS = "said|says|told|stated|states|added|explained|warned|declared|noted|described|argued|testified|called|calls|urged|urges|insisted|believed|wrote|writes|remarked|commented|predicted|reported";

/** Pull the speaker's name out of the text following a speaking verb. */
function speakerName(fragment: string): string {
  const titled = fragment.match(
    /(?:Dr|Prof|Professor|Mr|Mrs|Ms|Miss|Chief|Sir|Dr\.)\.?\s+((?:[A-Z][\w'’-]*\s*){1,3}[A-Z][\w'’-]+)/)?.[1];
  const plain = fragment.match(/\b([A-Z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+)+)\b/)?.[1];
  const name = (titled ?? plain ?? "").replace(/\s+/g, " ").trim();
  return name.split(/\s+/).length >= 2 ? name : "";
}

/** An attributed quotation: a statement credited to a named person. */
function attributedQuote(text: string): QuoteAttribution | null {
  // "…," said <Name>, <role>.
  const after = text.match(
    new RegExp(
      "[\"“]([^\"“”]{4,180})[\"”]\\s*,?\\s*(?:" + SPEAKING_VERBS + ")\\s+([^,.;:()]{2,90})", "i",
    ),
  );
  if (after) {
    const speaker = speakerName(after[2]);
    if (speaker) return { quote: after[1].replace(/\s+/g, " ").trim(), speaker };
  }
  // <Name> said: "…"
  const before = text.match(
    new RegExp(
      "(?:" + SPEAKING_VERBS + ")\\s+([^,.;:()]{2,90}?)\\s*[:,]?\\s*[\"“]([^\"“”]{4,180})[\"”]", "i",
    ),
  );
  if (before) {
    const speaker = speakerName(before[1]);
    if (speaker) return { quote: before[2].replace(/\s+/g, " ").trim(), speaker };
  }
  return null;
}

/** Descriptive families a close paraphrase must stay within. Comparing the
 *  families (rather than the individual word) is what lets "disastrous" be
 *  recognised as a paraphrase of "catastrophic" or "devastating". */
const CHARACTERISATION_FAMILIES: RegExp[] = [
  /\b(?:disastrous|disaster|catastrophic|catastrophe|devastating|devastation|calamitous|ruinous)\b/gi,
  /\b(?:record|record-breaking|unprecedented|all-time|highest ever|worst ever)\b/gi,
  /\b(?:severe|dire|alarming|alarmingly|appalling|shocking|dismal|bleak|sobering|grave)\b/gi,
  /\b(?:extraordinary|remarkable|unusual|exceptional|unprecedented|notable)\b/gi,
];

function stemMatch(token: string, text: string): boolean {
  const safe = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stem = safe.slice(0, Math.max(5, safe.length - 2));
  return new RegExp("\\b" + stem, "i").test(text);
}

/** Descriptive wording the quote and the source have in common. */
function sharedCharacterisation(quote: string, sourceText: string): string[] {
  const shared: string[] = [];
  CHARACTERISATION_FAMILIES.forEach(family => {
    const q = quote.match(family)?.[0];
    const s = sourceText.match(family)?.[0];
    if (q && s) shared.push(q.toLowerCase() + " / " + s.toLowerCase());
  });
  // A paraphrase may also simply repeat the same descriptive words.
  if (shared.length === 0) {
    for (const t of claimTokens(quote)) {
      if (t.length >= 6 && stemMatch(t, sourceText)) { shared.push(t); break; }
    }
  }
  return shared;
}

function nameParts(speaker: string): string[] {
  return speaker.toLowerCase()
    .replace(/\b(?:dr|prof|professor|mr|mrs|ms|miss|chief|sir)\b\.?/g, " ")
    .split(/[^a-z'’-]+/).filter(Boolean);
}

/**
 * Compare an attributed quotation with retrieved source text.
 * "attributed"     → the same person, the same statement, attributed to them.
 * "characterized"  → the same characterization of the same event, but the
 *                     person is not named, so the attribution is unverified.
 * "none"           → nothing comparable in this source.
 */
function quoteAttributionMatch(
  attribution: QuoteAttribution,
  sourceText: string,
  claimText: string,
): { level: "attributed" | "characterized" | "none"; sharedWords: string[] } {
  const lower = sourceText.toLowerCase();
  const parts = nameParts(attribution.speaker);
  const surname = parts[parts.length - 1] ?? "";
  const given = parts[0] ?? "";
  if (surname.length < 3) return { level: "none", sharedWords: [] };

  // 1. The statement must actually be restated or closely paraphrased.
  const sharedWords = sharedCharacterisation(attribution.quote, sourceText);
  if (sharedWords.length === 0) return { level: "none", sharedWords: [] };

  // 2. The context must be the same event / period.
  if (!periodsAgree(claimText, sourceText)) return { level: "none", sharedWords: [] };

  // 3. The person must be named in the source. A generic mention of the same
  //    name is not evidence of what they said, so without a nearby attribution
  //    the result only corroborates the characterization.
  if (!stemMatch(surname, lower)) return { level: "characterized", sharedWords };
  // 4. It must be the same event/role context: the source has to carry the
  //    claim's own subject wording, not just the same name and sentiment.
  const quoteWords = new Set(claimTokens(attribution.quote));
  const speakerWords = new Set(parts);
  const contextShared = claimTokens(claimText)
    .filter(t => !quoteWords.has(t) && !speakerWords.has(t) && t.length >= 4)
    .filter(t => stemMatch(t, lower));
  if (contextShared.length === 0) return { level: "characterized", sharedWords };
  const at = lower.search(new RegExp("\\b" + surname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const window = sourceText.slice(Math.max(0, at - 140), at + 200);
  const windowLower = window.toLowerCase();
  const namesGivenName = given.length >= 3 && stemMatch(given, windowLower);
  const ATTRIBUTION_NEARBY =
    /\b(?:said|says|told|stated|warned|declared|added|explained|testified|called|calls|urged|urges|insisted|believed|wrote|writes|remarked|commented|predicted|according to|spokesperson|spokeswoman|spokesman)\b/i;
  const spokeHere = ATTRIBUTION_NEARBY.test(window);
  // The attribution must attach to THIS person, not to someone else nearby.
  const attributionNear = spokeHere &&
    (windowLower.lastIndexOf(surname, 120) > -1 ||
     namesGivenName);
  if (!attributionNear) return { level: "characterized", sharedWords };
  return { level: "attributed", sharedWords };
}

function canonicalAction(verb: string): string | null {
  for (const [canon, re] of ACTION_LEXICON) if (re.test(verb)) return canon;
  return null;
}

/** Host-based evidence quality, ranked by tier.
 *  Generic heuristics only — never topic-specific hardcoding.
 *  1. primary scientific / institutional publishing
 *  2. established newsrooms
 *  3. secondary reporting
 *  4. aggregators, content farms and reposts
 */
const ESTABLISHED_PRESS =
  /\b(reuters|bbc|cnn|guardian|nytimes|newyorktimes|wsj|bloomberg|nbcnews|cbsnews|abcaus|usatoday|npr|pbs|sky|telegraph|independent|france24|dw|aljazeera|politico|axios|forbes|fortune|apnews|associatedpress|economist|washingtonpost|nypost|scmp|hindustantimes|timesofindia|indianexpress|thehindu|abc\.net\.au|abc\.com\.au|news\.com\.au|globaltimes|aljazeera)\b/i;

/** Primary scientific, academic and intergovernmental publishing. */
const PRIMARY_SCIENCE =
  /\b(nature|science|scientificamerican|sciencemag|phys\.org|eurekalert|sciencedaily|plos|springer|sciencedirect|thelancet|nejm|bmj|pubmed|ncbi|wiley|frontiersin|mdpi|who\.int|wmo\.int|noaa|nasa|esa|eumetsat|usgs|wsl|niwa|scwz|glamos|ethz|epfl|uzh|unibe|meteofrance|metoffice|ipcc|copernicus|smithsonian|aaas|acs\.org|rsc\.org|ieee|nature\.com|science\.org)\b/i;

/** Aggregators, content farms and reposts — never decisive evidence. */
const REPOST_SURFACE =
  /\b(blogspot|wordpress|wixsite|weebly|reddit|quora|forum|newsbreak|news24|news18|headline|toppr|scroll|oneindia|dtnext|livejournal|substack|medium\.com|newsfilecorp|prnewswire|newswire|ezynews|newsnow|newsnowtoday|google\.[a-z.]{2,}$|msn\.com|yahoo\.com|aol\.com|flipboard|smartnews|newsycraze|aninews)\b/i;

/** Minimum authority a source needs before it may contradict a claim. */
const MIN_CREDIBLE_AUTHORITY = 1;

function sourceAuthority(url: string, claimText: string): number {
  const host = hostOf(url);
  if (!host) return 1;
  let authority = 1.4;                                              // secondary reporting
  if (/\.(gov|mil|edu|ac\.uk|gov\.uk|gouv)(\.|\/|$)/.test(host)) authority = 3.4;
  else if (PRIMARY_SCIENCE.test(host)) authority = 3.2;              // primary scientific
  else if (ESTABLISHED_PRESS.test(host)) authority = 2.2;            // established newsroom
  if (REPOST_SURFACE.test(host)) authority = Math.min(authority, 0.4);
  // The claim's own subject owns this domain (NASA claim → nasa.gov):
  // the primary source for that subject substantially outranks secondary coverage.
  const parts = host.split(".");
  const entities = extractProposition(claimText).entities;
  const owned = entities.some(e => e.length >= 4 &&
    parts.some(p => p === e || (e.length >= 5 && (p.startsWith(e) || p.endsWith(e)))));
  if (owned) authority = Math.max(authority, 3.4);
  return authority;
}

/**
 * CONTRADICTION GATE. A retrieved snippet may only contradict a claim when it
 * actually disputes the SAME proposition:
 *   1. the same subject/entity      2. the same period or frame
 *   3. the same quantity/proposition  4. the same context
 *   5. an explicit opposing statement
 * Failing any of these the result is "not addressed", never evidence of falsity.
 */
function contradictionAdmissible(
  claim: Proposition,
  src: Proposition,
  sourceText: string,
  haystack: string,
  shared: string[],
  overlap: number,
  reason: string,
): boolean {
  // 1. same subject/entity
  const entityShared = claim.entities.some(e =>
    src.entities.includes(e) ||
    src.entities.some(x => x === e || (e.length >= 4 && x.includes(e)) || (x.length >= 4 && e.includes(x))));
  const claimSubject = distinctiveEntities(claim.text);
  const srcSubject = distinctiveEntities(sourceText);
  const sameSubjectName = sameEntitySet(claimSubject, srcSubject);
  const anchored = shared.length >= 2 || overlap >= 0.4;
  if (!entityShared && !sameSubjectName && !anchored) return false;
  // Both sides name a different subject: never a contradiction.
  if (claimSubject.length > 0 && srcSubject.length > 0 && !sameSubjectName) return false;

  // 2. same period or frame
  if (historicalBenchmarkFrame(claim.text, sourceText) === "different_frame") return false;
  const claimYears = yearSet(claim.text), srcYears = yearSet(sourceText);
  if (claimYears.length > 0 && srcYears.length > 0 &&
      !claimYears.some(y => srcYears.includes(y))) {
    return false;
  }

  // 3 + 4. the source must engage the claim's substance in the claim's context —
  //          the same measured quantity, or the claim's own proposition. A
  //          different measure or a passing mention is not a dispute.
  const claimMeasured = measuredFigures(claim.text);
  const sameQuantity = claim.quantities.some(cq => src.quantities.some(sq => sq.noun === cq.noun)) ||
    claimMeasured.some(f => figureRestated(f, claim.text, sourceText) ||
      figureContradicts(f, claim.text, sourceText));
  if (!sameQuantity && !anchored && !entityShared) return false;

  // 5. explicit opposition. Every branch below asserts an INCOMPATIBLE statement
  //    (a different value, direction, place or event type); branches that rest
  //    on wording must find that opposition actually asserted in the source.
  const incompatibleStatement =
    /Quantity conflict|Date conflict|Superlative conflict|Destination\/location conflict|Direction conflict|Event-type conflict|negates the action|is not the first|Explicit dispute/.test(reason);
  const assertedOpposition =
    /\b(?:not|never|without|denied|denies|refuted|negat\w*|inaccurate|incorrect|false|wrong|disputes?|disputed|rejects?|rejected|dismissed|misstat\w*|no evidence|contrary to|rather than|instead of|did not|does not|failed)\b/i
      .test(haystack);
  if (!incompatibleStatement && !assertedOpposition) return false;
  return true;
}

/**
 * Detect a proposition-level CONFLICT between the claim and the source text.
 * Returns a human-readable reason, or undefined when no conflict is proven.
 * Topic/entity similarity alone is NEVER a conflict and NEVER a support.
 */
function detectConflict(
  claim: Proposition,
  src: Proposition,
  sourceText: string,
  haystack: string,
  headline: string,
  shared: string[],
  overlap: number,
): string | undefined {
  // 1. Fact-check / debunk coverage of this claim.
  if (overlap >= 0.34 && DEBUNK_PATTERN.test(headline)) {
    return "The retrieved source is fact-check/debunk coverage disputing this claim";
  }

  const entityShared = claim.entities.some(e =>
    src.entities.includes(e) || src.entities.some(x => x === e || (e.length >= 4 && x.includes(e)) || (x.length >= 4 && e.includes(x))));
  const qtyAnchor = claim.quantities.some(cq => src.quantities.some(sq => sq.noun === cq.noun));
  const dateAnchor = claim.dates.some(d => src.dates.includes(d));
  // An explicit negation of an action the claim asserts is a real conflict
  // signal on its own — it must not be filtered out by the anchoring gate.
  const neg = haystack.match(NEGATION_PATTERN);
  const negatedAction = neg && neg[1] ? canonicalAction(neg[1]) : null;
  // The negated verb may not itself be a canonical action ("did not complete a
  // landing" negates the landing), so also look for a claimed action inside
  // the negation's own wording.
  const negationWindow = neg
    ? haystack.slice(neg.index ?? 0, (neg.index ?? 0) + neg[0].length + 32)
    : "";
  const negatedClaimAction = neg
    ? claim.actions.find(a => new RegExp("\\b" + a + "(?:ed|ing|s)?\\b", "i").test(negationWindow))
    : undefined;
  const negationAnchor = (!!negatedAction && claim.actions.includes(negatedAction)) ||
    !!negatedClaimAction;
  if (!negationAnchor && shared.length < 2 && overlap < 0.4 && !entityShared && !qtyAnchor && !dateAnchor) {
    return undefined; // not anchored to the same subject — cannot conflict
  }

  // 2. Temporal disambiguation: when both texts carry explicit years and
  //    none in common, the source concerns a different period or edition of
  //    the topic — it does NOT address this claim and never contradicts it.
  const claimYears: string[] = [...(claim.text.match(/\b(?:19|20)\d{2}\b/g) ?? [])];
  const srcYears: string[] = [...(sourceText.match(/\b(?:19|20)\d{2}\b/g) ?? [])];
  if (claimYears.length > 0 && srcYears.length > 0 &&
      !claimYears.some(y => srcYears.includes(y))) {
    return undefined;
  }

  // 3. Direction conflict — the claim reports a rise while the source reports
  //    a fall (or the reverse) for the same subject. Only when both sides
  //    state exactly one direction, so mixed coverage is never a conflict.
  const claimUp = claim.actions.includes("increase");
  const claimDown = claim.actions.includes("decrease");
  const srcUp = src.actions.includes("increase");
  const srcDown = src.actions.includes("decrease");
  if (claimUp !== claimDown && srcUp !== srcDown && overlap >= 0.3) {
    if (claimDown && srcUp) {
      return "Direction conflict — the claim reports a decrease, while the retrieved source reports an increase for the same subject";
    }
    if (claimUp && srcDown) {
      return "Direction conflict — the claim reports an increase, while the retrieved source reports a decrease for the same subject";
    }
  }

  // 4. Destination / location conflict (both sides state a different place
  //    for the same subject in an event context).
  const claimQ = qualifiedPlaces(claim.text, shared);
  const srcQ = qualifiedPlaces(sourceText, shared);
  if (claimQ.length > 0 && srcQ.length > 0 && !claimQ.some(p => srcQ.includes(p))) {
    return "Destination/location conflict — the claim places this subject at \"" +
      claimQ.join(", ") + "\", while the retrieved source places it at \"" + srcQ.join(", ") + "\"";
  }

  // 5. Event-type conflict (claimed surface landing vs described flyby/orbit).
  const claimLand = EVENT_LANDING.test(claim.text);
  const claimFlyby = EVENT_FLYBY.test(claim.text);
  const srcLand = EVENT_LANDING.test(sourceText);
  const srcFlyby = EVENT_FLYBY.test(sourceText);
  if (claimLand && !claimFlyby && srcFlyby && !srcLand) {
    return "Event-type conflict — the claim describes a surface landing, while the retrieved source describes a flyby/orbit with no landing";
  }
  if (claimFlyby && !claimLand && srcLand && !srcFlyby) {
    return "Event-type conflict — the claim describes a flyby/orbit, while the retrieved source describes a surface landing";
  }

  // 5b. The one way a source about the present can refute a claim about the
  //     past: it explicitly says the historical statement itself is wrong.
  if (historicalFraming(claim.text) && HISTORICAL_DISPUTE.test(sourceText) &&
      (entityShared || shared.length >= 2)) {
    return "Explicit dispute — the retrieved source states that the historical statement asserted by this claim is inaccurate";
  }

  // 6. Explicit negation of an action the claim asserts.
  if (neg && neg[1] && negationAnchor) {
    return "The retrieved source explicitly negates the action the claim asserts (\"" + neg[1] + "\")";
  }

  // 7. Quantity conflict for the same measured noun. Only a CLEARLY different
  //    figure conflicts: 5.5% vs 5% is the same measurement rounded.
  //    FRAME GUARD: a past-era benchmark ("until recently, 2% was considered
  //    extreme") cannot be refuted by a current measurement of a different
  //    period — that source measures something else, so it never contradicts.
  const frame = historicalBenchmarkFrame(claim.text, sourceText);
  for (const cq of frame === "different_frame" ? [] : claim.quantities) {
    const sameNoun = src.quantities.filter(q => q.noun === cq.noun);
    if (sameNoun.some(q => valuesCompatible(cq.value, q.value))) continue;
    const conflicting = sameNoun.find(q =>
      Math.abs(q.value - cq.value) / Math.max(Math.abs(q.value), Math.abs(cq.value), 1e-9) > FIGURE_TOLERANCE);
    if (conflicting) {
      return "Quantity conflict — the claim states \"" + cq.value + " " + cq.noun +
        "\", while the retrieved source states \"" + conflicting.value + " " + conflicting.noun + "\"";
    }
    if (cq.noun === "percent" && figureContradicts(cq.value, claim.text, sourceText)) {
      return "Quantity conflict — the claim states \"" + cq.value + " percent" +
        "\", while the retrieved source reports a clearly different figure";
    }
  }

  // 8. Date conflict (full date expressions on both sides, none in common).
  if (frame === "different_frame") return undefined;
  if (claim.dates.length > 0 && src.dates.length > 0 &&
      !claim.dates.some(d => src.dates.includes(d))) {
    return "Date conflict — the claim dates this to \"" + claim.dates.join(", ") +
      "\", while the retrieved source dates it to \"" + src.dates.join(", ") + "\"";
  }

  // 9. Superlative/ordinal conflict for the same category noun.
  for (const co of claim.ordinals) {
    const so = src.ordinals.find(o => o.noun === co.noun);
    if (so && so.ord !== co.ord) {
      return "Superlative conflict — the claim calls this the \"" + co.ord + " " + co.noun +
        "\", while the retrieved source calls it the \"" + so.ord + " " + so.noun + "\"";
    }
    if (co.ord === "first" &&
        new RegExp("\\b(?:was|is|were)?\\s*not\\s+the\\s+first\\b[^.]{0,40}\\b" + co.noun).test(haystack)) {
      return "Superlative conflict — the retrieved source states this is not the first \"" + co.noun + "\"";
    }
  }
  return undefined;
}

/** Classify how a retrieved source relates to the claim's PROPOSITION. */
function compareProposition(
  claim: Proposition,
  headline: string,
  description: string,
): { relationship: Relationship; overlap: number; reason?: string } {
  const sourceText = (headline + " " + description).replace(/\s+/g, " ").trim();
  const haystack = sourceText.toLowerCase();
  const src = extractProposition(sourceText);

  const matched = claim.tokens.filter(t => haystack.includes(t));
  const overlap = claim.tokens.length > 0 ? matched.length / claim.tokens.length : 0;
  const shared = claim.tokens.filter(t => src.tokens.includes(t));
  const entityShared = claim.entities.some(e =>
    src.entities.includes(e) || src.entities.some(x => x === e || (e.length >= 4 && x.includes(e)) || (x.length >= 4 && e.includes(x))));
  // A source that restates the claim's MEASURED figure is anchored to the
  // claim's proposition even when the wording is completely different
  // ("disappeared" vs "vanished") — but only alongside at least one shared
  // content word, so a coincidental number is never treated as corroboration.
  const claimMeasured = measuredFigures(claim.text);
  const numericAnchor = claimMeasured.length > 0 && shared.length >= 1 &&
    claimMeasured.some(f => figureRestated(f, claim.text, sourceText)) &&
    !claimMeasured.some(f => figureContradicts(f, claim.text, sourceText));
  const anchored = shared.length >= 2 || overlap >= 0.4 || entityShared || numericAnchor;

  const conflict = detectConflict(claim, src, sourceText, haystack, headline, shared, overlap);
  if (conflict && contradictionAdmissible(claim, src, sourceText, haystack, shared, overlap, conflict)) {
    return { relationship: "contradicts", overlap, reason: conflict };
  }

  // ATTRIBUTED QUOTATION: a quote is verified by who said it, not by topic.
  const attribution = attributedQuote(claim.text);
  if (attribution) {
    const match = quoteAttributionMatch(attribution, sourceText, claim.text);
    if (match.level === "attributed") {
      return {
        relationship: "supports", overlap,
        reason: "The retrieved source attributes the same statement to " + attribution.speaker +
          " in the same context (" + match.sharedWords.slice(0, 3).join(", ") + ")",
      };
    }
    if (match.level === "characterized") {
      return {
        relationship: "partial", overlap,
        reason: "The retrieved source describes the same event with the same characterization (" +
          match.sharedWords.slice(0, 2).join(", ") + "), but it does not attribute the statement to " +
          attribution.speaker + ", so the attribution itself remains uncorroborated",
      };
    }
  }

  // A historical benchmark can only be corroborated by a source that speaks
  // about the same past frame; a current measurement is not restatement.
  if (historicalBenchmarkFrame(claim.text, sourceText) === "different_frame") {
    return {
      relationship: "unverified", overlap,
      reason: "The retrieved source reports a measurement for a different period, which neither confirms nor disputes this claim about how the issue was previously understood",
    };
  }

  // Both sides name a specific subject and share none of them: same-sounding
  // topic, different subject. Never corroboration, never partial agreement.
  const claimSubject = distinctiveEntities(claim.text);
  const srcSubject = distinctiveEntities(sourceText);
  if (claimSubject.length > 0 && srcSubject.length > 0 &&
      !sameEntitySet(claimSubject, srcSubject)) {
    return {
      relationship: "does_not_address", overlap,
      reason: "The retrieved source concerns a different named subject than this claim",
    };
  }

  if (!anchored) {
    return overlap >= 0.25
      ? {
          relationship: "unverified", overlap,
          reason: "The result is topically related, but the snippet contains too little comparable detail to verify the claim's proposition",
        }
      : {
          relationship: "does_not_address", overlap,
          reason: "The retrieved source does not concern the subject of this claim",
        };
  }

  // Subject is shared — compare the proposition itself, element by element.
  const claimQ = qualifiedPlaces(claim.text, shared);
  const srcQ = qualifiedPlaces(sourceText, shared);
  // Figures compare by VALUE, not by string: the same measurement restated
  // with different rounding or a hedge is still corroboration.
  const figures = measuredFigures(claim.text);
  const figuresOk = figures.length === 0 || figures.every(f => figureRestated(f, claim.text, sourceText));
  // A figure the source states CLEARLY differently blocks corroboration; a
  // figure it simply does not mention (a duration, a secondary count) does not.
  const figuresConflict = figures.some(f => figureContradicts(f, claim.text, sourceText));
  const placeAgree = claim.places.length > 0 && claim.places.some(p => src.places.includes(p));
  const destAddressed = claimQ.length === 0 || claimQ.some(p => srcQ.includes(p));
  const qtyAgree = claim.quantities.some(cq =>
    src.quantities.some(sq => sq.noun === cq.noun && valuesCompatible(cq.value, sq.value)));
  const figureAgree = !qtyAgree && figures.length > 0 && figuresOk;
  const dateAgree = claim.dates.length > 0 && claim.dates.some(d => src.dates.includes(d));
  const periodAgree = !dateAgree && periodsAgree(claim.text, sourceText);
  const actionAgree = claim.actions.some(a => src.actions.includes(a));
  // The subject guard: when both sides name a subject they must be the same
  // one; when neither does, the source must at least be anchored to the claim.
  const sameSubjectName = sameEntitySet(claimSubject, srcSubject);
  const entityGuard = claimSubject.length > 0
    ? (entityShared || sameSubjectName)
    : (shared.length >= 3 || anchored);
  const realDetail =
    (placeAgree ? 1 : 0) + (qtyAgree ? 1 : 0) +
    (figureAgree && (entityShared || shared.length >= 2) ? 1 : 0) +
    (dateAgree ? 1 : 0) + (actionAgree ? 1 : 0);

  // Independent agreements on the proposition's elements. Matching a subject,
  // a figure, a period and a direction is what corroboration means — an exact
  // text match is neither required nor sufficient.
  const agreements: string[] = [];
  if (placeAgree) agreements.push("same location/destination");
  if (qtyAgree) agreements.push("matching figures");
  else if (figureAgree) agreements.push("same figure, restated");
  if (dateAgree) agreements.push("matching date");
  else if (periodAgree && /\b(?:19|20)\d{2}\b/.test(claim.text)) agreements.push("matching period");
  if (actionAgree) agreements.push("matching event/direction");
  if (entityShared || sameSubjectName) agreements.push("same named subject");
  // A claim can state its subject in plain words ("…an estimated 5.5%") with
  // no proper noun at all; shared subject wording still counts as agreement.
  else if (claim.entities.length === 0 && anchored) agreements.push("same subject");

  // Corroboration requires: the same subject, the same period, no unresolved
  // location or figure mismatch, and agreement on the substance — at least two
  // independent elements, one of which must be more than a shared subject.
  const substantive = qtyAgree || figureAgree || dateAgree || actionAgree ||
    (placeAgree && entityShared);
  const corroborated = entityGuard && !figuresConflict && periodAgree && destAddressed &&
    agreements.length >= 2 && substantive;

  if (corroborated) {
    return {
      relationship: "supports", overlap,
      reason: "The retrieved content independently supports the claim's proposition (" + agreements.join(", ") + ")",
    };
  }

  if (realDetail >= 1) {
    let reason = "The retrieved source addresses this subject but only partially confirms the claim's proposition";
    if (!destAddressed) reason = "The retrieved source does not state the location/destination asserted by the claim";
    else if (!figuresOk) reason = "The retrieved source does not confirm the figures asserted by the claim";
    return { relationship: "partial", overlap, reason };
  }

  const claimHasDetail = claimQ.length > 0 || claim.quantities.length > 0 ||
    claim.dates.length > 0 || claim.actions.length > 0;
  if (!claimHasDetail) {
    return {
      relationship: "unverified", overlap,
      reason: "The claim's snippet-level detail is too thin for a reliable proposition comparison",
    };
  }
  return {
    relationship: "does_not_address", overlap,
    reason: "The source mentions the same subject but does not address the specific proposition asserted by the claim",
  };
}

function evaluateRelationship(
  claimText: string,
  headline: string,
  description: string,
): { relationship: Relationship; overlap: number; reason?: string } {
  const claim = extractProposition(claimText);
  return compareProposition(claim, headline, description);
}


function parseRssItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string; publisher: string; publisherUrl: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string; publisher: string; publisherUrl: string }> = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const get = (tag: string): string => {
      const re = new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        "i",
      );
      const m = re.exec(itemXml);
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const title = get("title");
    if (!title) continue;
    // <source url="https://www.bbc.co.uk">BBC News</source> — the real
    // publisher behind the discovery layer.
    const sourceTag = /<source\b([^>]*)>([\s\S]*?)<\/source\s*>/i.exec(itemXml);
    const publisherUrlAttr = sourceTag
      ? (/url\s*=\s*["']([^"']+)["']/i.exec(sourceTag[1]) || [])[1] || ""
      : "";
    items.push({
      title,
      link: get("link"),
      pubDate: get("pubDate"),
      description: decodeHtml(get("description").replace(/<[^>]*>/g, "")).replace(/<[^>]*>/g, ""),
      publisher: sourceTag ? sourceTag[2].trim() : "",
      publisherUrl: publisherUrlAttr,
    });
    if (items.length >= 10) break;
  }
  return items;
}

/** Hosts that belong to a discovery/aggregator layer rather than a publisher. */
function isAggregatorHost(host: string): boolean {
  return /(^|\.)(news\.)?google\.[a-z.]{2,}$/.test(host) ||
    /(^|\.)(news|feeds?|rss)\.(yahoo|msn|bing|aol)\.[a-z.]{2,}$/.test(host);
}

/**
 * Follow a discovery-layer result to the article it actually points at, so the
 * real publisher URL is stored and displayed instead of the aggregator's.
 * Best-effort: when the redirect cannot be resolved the original link is kept.
 */
async function resolvePublisherUrl(link: string): Promise<string> {
  let host = "";
  try {
    host = new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
  if (!isAggregatorHost(host)) return link;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(link, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; Veritas/1.0)" },
    });
    const finalUrl = res.url || "";
    if (!finalUrl) return link;
    const finalHost = new URL(finalUrl).hostname.replace(/^www\./, "");
    return isAggregatorHost(finalHost) ? link : finalUrl;
  } catch {
    return link;
  } finally {
    clearTimeout(timer);
  }
}

/** Drop the aggregator's " - Publisher Name" suffix from a headline. */
function stripPublisherSuffix(title: string, publisher: string): string {
  if (!publisher) return title;
  const suffix = " - " + publisher.trim();
  if (title.trim().toLowerCase().endsWith(suffix.toLowerCase())) {
    return title.trim().slice(0, title.trim().length - suffix.length).trim();
  }
  return title.trim();
}

function publisherFromItem(item: { publisher: string; link: string; publisherUrl?: string }): string {
  if (item.publisher) return item.publisher;
  // The link may point at a discovery layer — prefer the publisher's own site.
  const candidates = [item.publisherUrl, item.link].filter(Boolean) as string[];
  for (const candidate of candidates) {
    try {
      const host = new URL(candidate).hostname.replace(/^www\./, "");
      if (!isAggregatorHost(host)) return publisherFromHostname(host);
    } catch {
      // try the next candidate
    }
  }
  return "Unknown publisher";
}

function formatDate(pubDate: string): string {
  if (!pubDate) return "N/A";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * A second, person-led query for an attributed quotation: the speaker's name
 * plus the claim's own subject terms. The quoted words are deliberately left
 * out so the search is not restricted to the exact phrasing.
 */
function buildAttributionQuery(attribution: QuoteAttribution, claimText: string): string | null {
  const parts = nameParts(attribution.speaker);
  const name = parts.length >= 2 ? parts[parts.length - 2] + " " + parts[parts.length - 1] : parts[0] ?? "";
  if (name.length < 3) return null;
  const quoteWords = new Set(claimTokens(attribution.quote));
  const speakerWords = new Set(parts);
  const subject = claimTokens(claimText)
    .filter(t => !quoteWords.has(t) && !speakerWords.has(t) && t.length >= 4)
    .slice(0, 3);
  const query = [name].concat(subject).join(" ").trim();
  return query.length >= 8 ? query : null;
}

/**
 * Live search for independent coverage of a claim.
 * Returns real retrieved sources only. On failure, `ok` is false.
 */
async function searchClaim(claimText: string): Promise<ClaimSearch> {
  // Search on a normalized, concise query derived from the COMPLETE claim —
  // never on a malformed or truncated fragment.
  const query = buildSearchQuery(claimText);
  if (query.length < 8) {
    return { ok: true, sources: [], error: "Claim too short to search." };
  }
  const url =
    "https://news.google.com/rss/search?q=" + encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; Veritas/1.0)" },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const xml = await res.text();
    let items = parseRssItems(xml);

    // A quotation is verified by looking for the PERSON who said it. Searching
    // the proposition alone returns coverage of the event but nothing about the
    // attribution, so an attributed quotation also gets a person-led query.
    const attribution = attributedQuote(claimText);
    if (attribution) {
      const attributionQuery = buildAttributionQuery(attribution, claimText);
      if (attributionQuery) {
        try {
          const altRes = await fetch(
            "https://news.google.com/rss/search?q=" + encodeURIComponent(attributionQuery) +
            "&hl=en-US&gl=US&ceid=US:en",
            { signal: controller.signal, redirect: "follow",
              headers: { "user-agent": "Mozilla/5.0 (compatible; Veritas/1.0)" } },
          );
          if (altRes.ok) {
            const seen = new Set(items.map(i => i.title.toLowerCase().replace(/\s+/g, " ")));
            for (const item of parseRssItems(await altRes.text())) {
              const key = item.title.toLowerCase().replace(/\s+/g, " ");
              if (seen.has(key)) continue;
              seen.add(key);
              items.push(item);
            }
          }
        } catch {
          // The person-led query is best-effort; the proposition query stands.
        }
      }
    }

    const evaluated = items.map(item => {
      const headline = stripPublisherSuffix(decodeEntities(item.title), item.publisher);
      const { relationship, overlap, reason } = evaluateRelationship(claimText, headline, item.description);
      // Evidence quality: primary/authoritative sources outrank loosely
      // related secondary coverage when the best results are selected. The
      // feed link points at the discovery layer, so authority is read from the
      // publisher's own domain.
      const authority = sourceAuthority(item.publisherUrl || item.link, claimText);
      return {
        item,
        headline,
        name: publisherFromItem(item),
        date: formatDate(item.pubDate),
        excerpt: item.description.slice(0, 240) || "No snippet available.",
        url: item.link,
        relationship,
        overlap,
        reason,
        rank: RELATIONSHIP_RANK[relationship] * 100 + authority * 10 + Math.round(overlap * 5),
      };
    });

    // Most evidentiary results first: decisive relationships, then authority.
    evaluated.sort((a, b) => b.rank - a.rank);
    const finalists = evaluated.slice(0, 3);

    // SOURCE IDENTITY: Google News is discovery only. Follow each result to
    // the article it points at so the real publisher URL, name and domain are
    // what gets stored and displayed.
    const resolved = await Promise.all(finalists.map(async (entry) => {
      let url = await resolvePublisherUrl(entry.url);
      let host = "";
      try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { host = ""; }
      const stillAggregator = isAggregatorHost(host);
      if (stillAggregator && entry.item.publisherUrl) {
        // The feed names the publisher even when the article link cannot be
        // followed — use the publisher's own site as the source identity.
        url = entry.item.publisherUrl;
        try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { host = ""; }
      }
      const name = entry.name && entry.name !== "Unknown publisher"
        ? entry.name
        : publisherFromHostname(host);
      const { item: _item, headline, date, excerpt, relationship, overlap, reason } = entry;
      // DISCOVERY IS NOT EVIDENCE: a result whose publisher cannot be
      // identified is never cited as the source of a claim.
      const citeable = !isAggregatorHost(host);
      return {
        name, headline, date, excerpt,
        url: citeable ? url : "",
        relationship, overlap, reason,
      } satisfies RetrievedSource & { overlap: number };
    }));
    const top: RetrievedSource[] = resolved.map(({ overlap: _overlap, ...src }) => src);

    const anyAddressed = top.some(s =>
      s.relationship === "supports" || s.relationship === "contradicts" || s.relationship === "partial");
    if (top.length > 0 && !anyAddressed) {
      // Honest notice in addition to the (non-corroborating) real results.
      top.push({
        name: "NO INDEPENDENT CORROBORATION FOUND",
        headline: "No independent corroboration found",
        date: "N/A",
        excerpt: "A live search was performed, but no retrieved source addressed this claim closely enough to corroborate it. Absence of corroboration is not proof of falsity.",
        url: "",
        relationship: "insufficient",
      });
    }
    if (top.length === 0) {
      top.push({
        name: "NO INDEPENDENT CORROBORATION FOUND",
        headline: "No results returned",
        date: "N/A",
        excerpt: "A live search was performed but returned no results for this claim. Insufficient evidence available.",
        url: "",
        relationship: "insufficient",
      });
    }
    return { ok: true, sources: top };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "search failed",
      sources: [{
        name: "SOURCE SEARCH UNAVAILABLE",
        headline: "External source search could not be completed",
        date: "N/A",
        excerpt: "The live external source search was unavailable. Insufficient evidence available for this claim.",
        url: "",
        relationship: "insufficient",
      }],
    };
  } finally {
    clearTimeout(timer);
  }
}

// ─── CLAIM TEXT NORMALIZATION ──────────────────────────────────────────────
// Claims are normalized before they are stored, displayed and searched:
// HTML entities are decoded, image-caption/photographer-credit contamination
// is removed, duplicated metadata is collapsed. Numbers, dates, names and
// units are never altered — only the encoding around them is repaired.

const HTML_ENTITY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/&nbsp;/gi, " "], [/&amp;/gi, "&"], [/&lt;/gi, "<"], [/&gt;/gi, ">"],
  [/&quot;/gi, '"'], [/&apos;/gi, "'"], [/&#0*39;/g, "'"],
  [/&rsquo;/gi, "'"], [/&lsquo;/gi, "'"], [/&sbquo;/gi, "'"],
  [/&rdquo;/gi, '"'], [/&ldquo;/gi, '"'], [/&bdquo;/gi, '"'],
  [/&ndash;/gi, "-"], [/&mdash;/gi, "-"], [/&hyphen;/gi, "-"],
  [/&hellip;/gi, "..."], [/&laquo;/gi, '"'], [/&raquo;/gi, '"'],
  [/&deg;/gi, " degrees"], [/&euro;/gi, "€"], [/&pound;/gi, "£"],
  [/&times;/gi, "x"], [/&frac12;/gi, "1/2"],
];

function decodeEntities(text: string): string {
  let out = text;
  for (const [re, rep] of HTML_ENTITY_REPLACEMENTS) out = out.replace(re, rep);
  // Numeric entities (&#8217; &#x2019;).
  out = out
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => safeFromCodePoint(parseInt(dec, 10)));
  return out;
}

function safeFromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try { return String.fromCodePoint(code); } catch { return ""; }
}

/** A bare surname glued to the front of a caption ("Hösli The front of …"). */
function stripCaptionCredit(text: string): string {
  const m = /^([A-ZÀ-Þ][\p{L}'’-]{1,}(?:\s+[A-ZÀ-Þ][\p{L}'’-]{1,}){0,2})\s+(?=[A-ZÀ-Þ])/u.exec(text);
  if (!m) return text;
  const remainder = text.slice(m[0].length).trim();
  // Only strip when what remains is still a substantial sentence of its own.
  if (remainder.split(/\s+/).length < 7) return text;
  return remainder;
}

/** Normalize a candidate claim: entities, caption credit, duplicated metadata. */
function normalizeClaimText(text: string): string {
  let out = decodeEntities(text);
  out = out.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
  out = out.replace(/\s*[|•]\s*$/, "");
  out = out.replace(/\s*[|•]\s*[^-]{2,40}$/, "");
  out = stripCaptionCredit(out);
  // Words repeated by a caption/credit merge ("the the", "of of").
  out = out.replace(/\b(\p{L}+)(\s+\1\b)+/giu, "$1");
  // Punctuation runs produced by merging blocks.
  out = out.replace(/([.,;:!?])\1{1,}/g, "$1");
  // Detached punctuation left behind by inline markup ("sheets , the").
  out = out.replace(/\s+([,;:.!?])/g, "$1");
  return out.replace(/\s+/g, " ").trim();
}

/** Image captions, photo credits and image metadata markers. */
const CAPTION_MARKER =
  /\b(?:image|photo|photograph|picture)\s*(?:caption|credit|description)\b|^\s*(?:credit|image|photo|source)\s*:|\bgetty(?:\s+images)?\b|\bphotographer\b|\bimage\s+shows\b|©/i;

/** Navigation, newsletter, signup, sharing and related-story interface text. */
const INTERFACE_TEXT =
  /\b(?:sign up|sign in|subscribe|subscription|newsletter|follow us|share this|share on|share via|read more|read next|read also|click here|learn more|see more|show more|load more|most read|most popular|related stories?|related articles?|related content|more on this|skip to|cookie|accept (?:all|cookies)|privacy policy|terms of use|advertisement|sponsored|log in|create an account|get the app|listen to|watch (?:now|this)|explore more|menu|home news|back to top|all rights reserved)\b/i;

/** Category labels and section names — metadata lines, never propositions. */
const LABEL_WORDS = new Set([
  "news", "world", "politics", "sport", "sports", "business", "economy",
  "technology", "tech", "health", "culture", "entertainment", "video", "live",
  "analysis", "opinion", "features", "latest", "home", "more", "newsletter",
]);

function looksLikeLabelOnly(sentence: string): boolean {
  const words = sentence.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;
  return words.every(w => LABEL_WORDS.has(w) || w.length <= 2);
}

/** A sentence that opens with a connective is the tail of a clipped one. */
const FRAGMENT_START =
  /^(?:and|or|but|nor|so|yet|which|who|whom|whose|that|than|then|while|whilst|although|though|because|however|meanwhile|also|instead|such|per|via|with|without|plus|thus|hence|therefore)\b/i;

/** A claim must assert something — it needs a verb, not just a noun phrase. */
const CLAIM_VERB =
  /\b(?:is|are|was|were|am|be|been|being|has|have|had|will|would|shall|can|could|should|may|might|must|do|does|did|said|say|says|stated|state|states|reported|reports|report|announced|announces|confirmed|confirms|estimated|estimates|found|finds|showed|shows|revealed|reveals|discovered|released|releases|launched|launches|approved|approves|rejected|rejects|banned|bans|signed|signs|elected|elects|appointed|appoints|died|dies|dead|killed|kills|rose|rises|risen|fell|falls|fallen|increased|increases|decreased|decreases|dropped|drops|grew|grows|grown|reached|reaches|hit|hits|exceeded|exceeds|recorded|records|measured|measures|published|publishes|warned|warns|threatened|threatens|caused|causes|became|becomes|remains|remain|includes|include|included|lost|lose|loses|gained|gain|gains|jumped|jumps|soared|soars|plummeted|surpassed|surpass|tripled|triple|halved|halve|stood|stands|totaled|totals|amounted|amounts|represents|represent|means|mean|began|begins|started|starts|ended|ends|arrived|arrives|returned|returns|affected|affects|damaged|damages|brought|brings|took|takes|take|saw|sees|see|expected|expects|forecast|forecasts|estimates?|projected|projects|estimated|planned|plans|reached|hit|struck|strikes)\b/i;

/** Abbreviations ending in "." that never end a sentence. */
const SENTENCE_ABBREVIATION =
  /\b(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|inc|ltd|co|approx|est|no|fig|al|u\.s|u\.k|e\.g|i\.e|ca|circa|dept|gov|sen|rep|gen|lt|col|sgt|capt|hon|pres|supt|asst|messrs|ave|blvd)\.?$/i;

/**
 * Split text into sentences without ever cutting inside a number, an
 * abbreviation or a decimal figure — so "an estimated 5.5% disappear." stays
 * one complete sentence instead of becoming "…an estimated 5".
 */
function splitSentences(text: string): Array<{ text: string; terminated: boolean }> {
  const out: Array<{ text: string; terminated: boolean }> = [];
  let current = "";
  let terminated = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    current += ch;
    if (!/[.!?…]/.test(ch)) continue;
    // Absorb repeated terminators and any closing quote/bracket.
    while (i + 1 < text.length && /[.!?…"'”’)\]]/.test(text[i + 1])) {
      i++; current += text[i];
    }
    const prev = current[current.length - 2] ?? "";
    const next = text[i + 1] ?? "";
    if (ch === "." || ch === "…") {
      if (/\d/.test(prev) && /\d/.test(next)) continue;      // 5.5, 1.200
      if (ch === "." && /\d/.test(prev) && next === "") continue; // "…an estimated 5"
      if (ch === ".") {
        const word = (/([\p{L}.]+)$/u.exec(current) || ["", ""])[1];
        if (SENTENCE_ABBREVIATION.test(word)) continue;       // "Dr.", "U.S."
        if (/^[\p{L}]$/u.test(word)) continue;                // initials "J. R. R."
        if (/^\d+$/.test(word) && next !== "") continue;      // list markers "1." "2."
      }
    }
    if (next !== "" && !/\s/.test(next)) continue;            // mid-token, e.g. "e.g"
    const trimmed = current.trim();
    if (trimmed) out.push({ text: trimmed, terminated: true });
    current = "";
    terminated = true;
  }
  const tail = current.trim();
  if (tail) out.push({ text: tail, terminated });
  return out;
}

/** Cut an over-long sentence at a clause boundary — never mid-clause. */
function toCompleteClaim(sentence: string): string | null {
  const MAX = 320;
  if (sentence.length <= MAX) return sentence;
  const head = sentence.slice(0, MAX);
  const boundary = Math.max(
    head.lastIndexOf("; "),
    head.lastIndexOf(", and "),
    head.lastIndexOf(", but "),
    head.lastIndexOf(", while "),
    head.lastIndexOf(", which "),
    head.lastIndexOf(", where "),
    head.lastIndexOf(" — "),
  );
  if (boundary > 80) {
    const clause = head.slice(0, boundary).trim();
    if (clause.split(/\s+/).length >= 8) return clause;
  }
  return null; // cannot recover a complete statement — discard it
}

/** Information density used to pick the most searchable clause of a claim. */
function clauseDensity(clause: string): number {
  const digits = (clause.match(/\d/g) || []).length;
  const proper = (clause.match(/\b[A-ZÀ-Þ][a-zà-ÿ]{2,}/g) || []).length;
  const words = clause.split(/\s+/).length;
  return digits * 2.5 + proper * 2 + Math.min(words, 30) * 0.2;
}

/** Concise normalized search query derived from a complete claim. */
function buildSearchQuery(claimText: string): string {
  const normalized = normalizeClaimText(claimText);
  if (!normalized) return "";
  const clauses = normalized
    .split(/(?<=[.;])\s+|,\s+(?:and|but|while|whereas|although|which)\s+/i)
    .map(c => c.trim())
    .filter(c => c.length >= 24);
  let query = (clauses.length > 0
    ? [...clauses].sort((a, b) => clauseDensity(b) - clauseDensity(a))[0]
    : normalized);
  if (query.length > 140) {
    const cut = query.slice(0, 140);
    const lastSpace = cut.lastIndexOf(" ");
    query = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-—…]+$/, "");
  }
  return query.replace(/["'`]/g, " ").replace(/\s+/g, " ").trim();
}

// ─── CLAIM EXTRACTION (text only — status comes from real evidence) ───────

interface RawClaim {
  id: number;
  text: string;
  hasNumbers: boolean;
  hasSource: boolean;
  hasAnonymous: boolean;
  hasSensational: boolean;
}

/**
 * Is this a complete, factual proposition?
 * Rejects image captions, photographer credits, bylines, navigation,
 * newsletter/signup text, related-story titles, social/share UI, category
 * labels, page metadata and clipped fragments. Only validated claims are
 * returned, so nothing downstream ever searches a malformed fragment.
 */
function isValidClaim(sentence: string, terminated: boolean): boolean {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;                       // category label / fragment
  if (CAPTION_MARKER.test(sentence)) return false;         // image caption / credit
  if (INTERFACE_TEXT.test(sentence)) return false;         // navigation / newsletter / UI
  // A connective opener is only disqualifying when the sentence was cut off:
  // "Meanwhile, the WHO reported …" is complete, "and the ministry added that"
  // is the tail of a clipped one.
  if (FRAGMENT_START.test(sentence) && !terminated) return false;
  if (!CLAIM_VERB.test(sentence)) return false;            // no meaningful predicate
  // A leading capital is a subject, not stray punctuation or a photo credit.
  const first = words[0].replace(/^[^\p{L}\p{N}]+/u, "");
  if (!first || first.length < 2) return false;
  if (looksLikeLabelOnly(sentence)) return false;
  // Must not end mid-token: a trailing bare number or dangling function word
  // means the sentence was cut off ("This year has seen an estimated 5").
  if (!terminated && (/\d[\d.,]*$/.test(sentence) || /\s(?:of|and|or|with|the|a|an|to|in|on|at|for|from|by|than|that|which)$/i.test(sentence))) {
    return false;
  }
  return true;
}

function extractRawClaims(text: string, maxClaims: number): RawClaim[] {
  const sentences = splitSentences(normalizeClaimText(text));
  const claims: RawClaim[] = [];

  // ONLY sentences that assert verifiable facts may become claims.
  // Linguistic/structural observations ("statistics are cited", "dates are
  // present", "balanced reporting language", "appropriate article length",
  // "neutral wording", "emotional language detected" …) are reported
  // separately as language signals and are NEVER extracted as factual claims.
  const factualPatterns = [
    /\d+%/, /\$[\d,]+/, /\d+ (million|billion|thousand)/i,
    /\b\d+(\.\d+)?\s?(percent|per cent|km|miles|tonnes|tons|people|jobs|cases|deaths)\b/i,
    /according to/i, /study (found|showed|revealed|published)/i,
    /researchers? (found|discovered|confirmed|published)/i,
    /officials? (said|stated|announced|confirmed)/i,
    /university of/i, /institute/i, /published in/i,
    /\b(said|says|stated|announced|confirmed|reported|estimated|launched|approved|banned|signed|elected|appointed|died|killed|discovered|developed|increased|decreased|recorded|measured)\b/i,
    /\b(19|20)\d{2}\b/,
  ];

  let claimId = 1;
  for (const { text: raw, terminated } of sentences) {
    if (claimId > maxClaims) break;
    const isFactual = factualPatterns.some(p => p.test(raw));
    if (!isFactual) continue;
    if (!isValidClaim(raw, terminated)) continue;
    // Preserve the COMPLETE statement — never a truncated fragment.
    const complete = toCompleteClaim(raw);
    if (!complete) continue;
    if (!isValidClaim(complete, true)) continue;

    claims.push({
      id: claimId++,
      text: complete,
      hasNumbers: /\d+%|\$[\d,]+|\d+ (million|billion)/i.test(complete),
      hasSource: /according to|published|researchers|officials|university/i.test(complete),
      hasAnonymous: /experts? (say|claim|warn)|sources? (say|claim)|insiders?/i.test(complete),
      hasSensational: /[A-Z]{3,}!|shocking|unbelievable|secret|hidden|exposed/i.test(complete),
    });
  }
  return claims;
}

/** Supplementary linguistic context for a claim (never a verification status). */
function linguisticNote(claim: RawClaim): string {
  const notes: string[] = [];
  if (claim.hasSource) notes.push("named-source attribution detected in text");
  if (claim.hasNumbers) notes.push("numerical data present");
  if (claim.hasAnonymous) notes.push("anonymous sourcing pattern detected");
  if (claim.hasSensational) notes.push("sensationalist language detected");
  return notes.length
    ? "Linguistic context: " + notes.join("; ") + "."
    : "No notable linguistic markers in this claim.";
}

// ─── SOURCE PROFILE EXTRACTION ──────────────────────────────────────────────
// Extracts metadata mentioned IN the article text. When a URL was retrieved,
// the submitted URL and the retrieved page metadata are the authoritative
// original-source metadata (per-field fallback: page JSON-LD → Open Graph →
// URL domain → page <title> → visible byline/date in text).
// DISPLAY METADATA ONLY — never used for verdict, confidence, claim
// classification or evidence scoring. Does NOT retrieve external information
// about the source.

/** Per-page metadata captured during URL retrieval (Source Profile only). */
interface PageMeta {
  title?: string;
  siteName?: string;
  publisher?: string;
  author?: string;
  published?: string;
  modified?: string;
  ogType?: string;
  articleType?: string;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function cleanField(s?: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

/** Hostname of the submitted URL without a leading www-/m- prefix. */
function hostOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
  } catch {
    return "";
  }
}

/** Publisher display name derived from a hostname (e.g. apple.com → Apple). */
function publisherFromHostname(host: string): string {
  const labels = host.split(".").filter(Boolean);
  if (labels.length < 2 || /^\d+$/.test(labels[0])) return "";
  const secondLevel = new Set(["co", "com", "org", "net", "ac", "gov", "edu", "or", "govt", "plc", "ne", "me"]);
  let core = secondLevel.has(labels[labels.length - 2])
    ? labels[labels.length - 3]
    : labels[labels.length - 2];
  if (!core) core = labels[0];
  if (!/^[a-z0-9-]{2,}$/i.test(core)) return "";
  return core.length <= 3 ? core.toUpperCase() : core.charAt(0).toUpperCase() + core.slice(1);
}

/** Site name from a page <title> suffix, e.g. "Some Headline - Apple". */
function titlePublisher(title?: string): string {
  const t = cleanField(title);
  if (!t) return "";
  const parts = t.split(/\s+[-–—|]\s+/);
  if (parts.length < 2) return "";
  const cand = parts[parts.length - 1].trim();
  if (!cand || cand.length > 40 || /[.!?]$/.test(cand)) return "";
  if (!/^[A-Za-z0-9][A-Za-z0-9 ,&'’.-]*$/.test(cand)) return "";
  return cand;
}

/** ISO8601 date → "22 September 2026"; other formats pass through trimmed. */
function normalizePageDate(raw: string): string {
  const s = cleanField(raw);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const monthIndex = parseInt(iso[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return parseInt(iso[3], 10) + " " + MONTH_NAMES[monthIndex] + " " + iso[1];
    }
  }
  return s;
}

/** Article type from page metadata (JSON-LD @type / og:type), if determinable. */
function articleTypeOf(page?: PageMeta): string {
  if (!page) return "";
  const ld = page.articleType || "";
  if (/article|blogposting/i.test(ld)) return "Article";
  if (/report/i.test(ld)) return "Report";
  const og = (page.ogType || "").toLowerCase();
  if (og === "article" || og === "blog") return "Article";
  if (og.indexOf("video") === 0) return "Video Article";
  return "";
}

function extractSourceProfile(
  text: string,
  greenFlags: string[],
  redFlags: string[],
  ctx?: { url?: string; page?: PageMeta },
) {
  const sourceMatch = text.match(/(?:according to|published (?:in|on|by)|reported (?:by|in)|from)\s+(?:the\s+)?([A-Z][A-Za-z\s.&]+(?:University|Institute|Journal|News|Times|Guardian|Reuters|BBC|Nature|Science|Agency|Organization|Report|Foundation|Centre|Center))/i)
    || text.match(/(Reuters|BBC|The New York Times|The Guardian|Nature|Science|The Lancet|CNN|AP News|AFP|Al Jazeera)/i);
  let source = sourceMatch ? sourceMatch[1].trim() : "NOT AVAILABLE";
  /** Where the SOURCE value came from — "text" preserves original behavior. */
  let sourceOrigin: "text" | "page" | "url" = "text";

  const domainMatch = text.match(/(www\.)?([a-zA-Z0-9-]+\.[a-z]{2,})/i);
  let domain = domainMatch ? domainMatch[2] : "NOT AVAILABLE";
  let domainOrigin: "text" | "url" = "text";

  const authorMatch = text.match(/(?:by|author:?|written by|reporter:?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
    || text.match(/Dr\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i)
    || text.match(/(Professor|Prof\.?)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i);
  let author = authorMatch ? authorMatch[0].replace(/^(by|author:?|written by|reporter:?)/i, "").trim() : "NOT AVAILABLE";
  let authorOrigin: "text" | "page" = "text";

  const dateMatch = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i)
    || text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);
  let publishedDate = dateMatch ? dateMatch[0] : "NOT AVAILABLE";
  let publishedOrigin: "text" | "page" = "text";
  let updatedDate = "NOT AVAILABLE";

  const isResearch = /university|institute|published in|journal|study|research/i.test(text);
  const isGov = /government|official|minister|agency|cdc|fda|who|nasa/i.test(text);
  const isNews = /reporter|correspondent|journalist|news|press|media/i.test(text);
  // A publisher TYPE is only displayed when a source was actually detected in
  // the text. Keyword hints about the topic (e.g. "government") do not
  // classify an unidentified publisher.
  let sourceType = source === "NOT AVAILABLE"
    ? "NOT AVAILABLE"
    : isResearch ? "Research" : isGov ? "Government" : isNews ? "News" : "Other";
  let typeOrigin: "text" | "page" = "text";

  // ── URL MODE: the submitted URL + retrieved page metadata are the
  //    authoritative original-source metadata. Each field is filled
  //    independently — a field is only NOT AVAILABLE when that specific
  //    field genuinely cannot be determined.
  if (ctx) {
    // DOMAIN — parsed from the submitted URL (authoritative original source).
    const host = hostOf(ctx.url);
    if (host) {
      domain = host;
      domainOrigin = "url";
    }
    const page = ctx.page;

    // SOURCE (publisher): page JSON-LD publisher → Open Graph site name →
    // URL domain → page <title> → publisher detected in article text.
    const ldPublisher = cleanField(page?.publisher);
    const sitePublisher = cleanField(page?.siteName);
    const domainPublisher = host ? publisherFromHostname(host) : "";
    const titleName = titlePublisher(page?.title);
    if (ldPublisher) { source = ldPublisher; sourceOrigin = "page"; }
    else if (sitePublisher) { source = sitePublisher; sourceOrigin = "page"; }
    else if (domainPublisher) { source = domainPublisher; sourceOrigin = "url"; }
    else if (titleName) { source = titleName; sourceOrigin = "page"; }
    // else: keep the publisher detected in the article text.

    // AUTHOR: page metadata (JSON-LD/meta) → visible byline in text (kept).
    const pageAuthor = cleanField(page?.author);
    if (pageAuthor && !/^https?:\/\//i.test(pageAuthor)) {
      author = pageAuthor;
      authorOrigin = "page";
    }

    // PUBLISHED / UPDATED dates from page metadata → in-text date (kept).
    const pagePublished = cleanField(page?.published);
    if (pagePublished) {
      publishedDate = normalizePageDate(pagePublished);
      publishedOrigin = "page";
    }
    const pageModified = cleanField(page?.modified);
    if (pageModified) updatedDate = normalizePageDate(pageModified);

    // ARTICLE TYPE from page metadata (falls back to keyword heuristic above).
    const structuredType = articleTypeOf(page);
    if (structuredType) {
      sourceType = structuredType;
      typeOrigin = "page";
    } else if (source !== "NOT AVAILABLE") {
      sourceType = isResearch ? "Research" : isGov ? "Government" : isNews ? "News" : "Other";
    } else {
      sourceType = "NOT AVAILABLE";
    }
  }

  const evidence: string[] = [];
  if (source !== "NOT AVAILABLE") {
    evidence.push(
      sourceOrigin === "page"
        ? "Publisher detected in retrieved page metadata: " + source
        : sourceOrigin === "url"
          ? "Publisher identified from the submitted URL: " + source
          : "Source name detected in text: " + source,
    );
  }
  if (domain !== "NOT AVAILABLE" && domainOrigin === "url") {
    evidence.push("Domain parsed from the submitted URL: " + domain);
  }
  if (author !== "NOT AVAILABLE") {
    evidence.push(
      authorOrigin === "page"
        ? "Author/byline detected in retrieved page metadata: " + author
        : "Author name detected in text: " + author,
    );
  }
  if (publishedDate !== "NOT AVAILABLE") {
    evidence.push(
      publishedOrigin === "page"
        ? "Publication date detected in retrieved page metadata: " + publishedDate
        : "Date detected in text: " + publishedDate,
    );
  }
  if (updatedDate !== "NOT AVAILABLE") {
    evidence.push("Last-updated date detected in retrieved page metadata: " + updatedDate);
  }
  if (typeOrigin === "page" && sourceType !== "NOT AVAILABLE") {
    evidence.push("Article type detected in retrieved page metadata: " + sourceType);
  }
  if (greenFlags.length > 0) evidence.push(greenFlags.length + " linguistic credibility signals detected");
  if (redFlags.length > 0) evidence.push(redFlags.length + " warning signals detected");
  if (evidence.length === 0) evidence.push("Limited source metadata could be extracted from text");

  const signals = [
    {
      label: authorOrigin === "page" ? "Author/byline in page metadata" : "Author name in text",
      available: author !== "NOT AVAILABLE",
    },
    {
      label: publishedOrigin === "page" ? "Publication date in page metadata" : "Publication date in text",
      available: publishedDate !== "NOT AVAILABLE",
    },
    {
      label: sourceOrigin === "text" ? "Source name in text" : "Publisher identified from URL/page metadata",
      available: source !== "NOT AVAILABLE",
    },
    { label: "Attribution language detected", available: /according to|published|official statement/i.test(text) },
    { label: "Institution mentioned", available: /university|institute|organization/i.test(text) },
    { label: "Anonymous sourcing absent", available: !/anonymous|insiders? (reveal|say)|sources? (say|claim)/i.test(text) },
  ];

  return { source, domain, author, publishedDate, updatedDate, sourceType, availableEvidence: evidence, signals };
}

type SourceProfile = ReturnType<typeof extractSourceProfile>;

// ─── SHARED TYPES (mirrored by the frontend) ───────────────────────────────

interface ClaimResult {
  id: number;
  text: string;
  status: "supported" | "uncertain" | "contradicted" | "needs_verification";
  confidence: number;
  evidence: string;
  sources: string[];
  contradictingSources: string[];
  explanation: string;
}

interface CrossCheckClaimResult {
  claimId: number;
  claimText: string;
  sources: Array<{
    name: string; headline: string; date: string; excerpt: string;
    relationship: Relationship; url?: string;
  }>;
}

interface TimelineEventResult {
  id: number;
  type: "claim_identified" | "source_found" | "source_searched" | "corroboration" | "contradiction" | "linguistic_analysis" | "assessment";
  title: string;
  detail: string;
  source?: string;
  timestamp?: string;
}

interface FreshnessResult {
  claimId: number;
  claimText: string;
  status: "current" | "recent" | "outdated" | "historical" | "unknown";
  sourceDate: string;
  ageDays: number;
  newerAvailable: boolean;
}

interface FingerprintResult {
  claims: number;
  /** UNIQUE external sources (distinct retrieved URLs). */
  sources: number;
  /** CLAIM–SOURCE REFERENCES: one source cited by N claims counts N times. */
  sourceRefs: number;
  verified: number;
  uncertain: number;
  contradicted: number;
  unverified: number;
  sourceCoverage: number;
  evidenceFound: number;
}

// ─── EVIDENCE TIMELINE (reflects ACTUAL analysis events) ───────────────────

function buildTimeline(args: {
  text: string;
  claims: ClaimResult[];
  sourceProfile: SourceProfile;
  greenFlags: string[];
  redFlags: string[];
  crossCheck: CrossCheckClaimResult[];
  checkedCount: number;
  searchFailures: number;
  /** UNIQUE retrieved sources (distinct URLs). */
  totalRetrieved: number;
  /** CLAIM–SOURCE REFERENCES across all cross-checked claims. */
  sourceRefs: number;
  verdict: string;
  confidence: number;
  /** True when a URL was retrieved — original-source metadata may come from the submitted URL/page. */
  fromUrl?: boolean;
}): TimelineEventResult[] {
  const events: TimelineEventResult[] = [];
  let eventId = 1;

  events.push({
    id: eventId++, type: "claim_identified",
    title: "Text received and processed",
    detail: args.text.split(/\s+/).length + " words analyzed.",
  });

  events.push({
    id: eventId++, type: "claim_identified",
    title: args.claims.length + " claims extracted",
    detail: "Factual claims identified using sentence-level pattern detection.",
  });

  if (args.sourceProfile.source !== "NOT AVAILABLE") {
    if (args.fromUrl) {
      events.push({
        id: eventId++, type: "source_found",
        title: "Original source identified from submitted URL",
        detail: "The original publisher/source was identified from the submitted article URL and its retrieved page metadata: " + args.sourceProfile.source + ". This is metadata detection, not independent verification.",
        source: args.sourceProfile.source,
      });
    } else {
      events.push({
        id: eventId++, type: "source_found",
        title: "Source attribution detected in text",
        detail: "The text mentions a named source: " + args.sourceProfile.source + ". This is text detection, not independent verification.",
        source: args.sourceProfile.source,
      });
    }
  } else {
    events.push({
      id: eventId++, type: "source_searched",
      title: args.fromUrl ? "No publisher identified" : "No named source detected in text",
      detail: args.fromUrl
        ? "No publisher could be identified from the submitted URL, its page metadata, or the article text."
        : "No specific source, author, or institution was identified in the text.",
    });
  }

  // Real external source search event
  if (args.checkedCount === 0) {
    events.push({
      id: eventId++, type: "source_searched",
      title: "External source search not performed",
      detail: "No claims were available to cross-check against external sources.",
    });
  } else if (args.searchFailures >= args.checkedCount) {
    events.push({
      id: eventId++, type: "source_searched",
      title: "SOURCE SEARCH UNAVAILABLE",
      detail: "The live external source search could not be completed. Insufficient evidence available.",
    });
  } else if (args.totalRetrieved === 0) {
    events.push({
      id: eventId++, type: "source_searched",
      title: "NO INDEPENDENT CORROBORATION FOUND",
      detail: "A live search across " + args.checkedCount + " claim(s) returned no usable results.",
    });
  } else {
    events.push({
      id: eventId++, type: "source_searched",
      title: "Live source search completed",
      detail: args.totalRetrieved + " unique independent source(s) retrieved (" + args.sourceRefs + " claim–source reference(s)) across " + args.checkedCount + " cross-checked claim(s).",
    });
  }

  // Real corroboration events
  const supportedClaims = args.claims.filter(c => c.status === "supported");
  for (const claim of supportedClaims.slice(0, 2)) {
    const first = claim.sources[0];
    events.push({
      id: eventId++, type: "corroboration",
      title: "Claim " + String(claim.id).padStart(2, "0") + " corroborated by retrieved coverage",
      detail: claim.evidence,
      source: first ? first.split(" — ")[0] : undefined,
    });
  }

  // Real contradiction events
  const contradictedClaims = args.claims.filter(c => c.status === "contradicted");
  for (const claim of contradictedClaims.slice(0, 2)) {
    events.push({
      id: eventId++, type: "contradiction",
      title: "Claim " + String(claim.id).padStart(2, "0") + " contradicted by retrieved coverage",
      detail: claim.evidence,
      source: claim.contradictingSources[0] ? claim.contradictingSources[0].split(" — ")[0] : undefined,
    });
  }

  if (supportedClaims.length === 0 && contradictedClaims.length === 0 && args.checkedCount > 0 && args.searchFailures < args.checkedCount) {
    events.push({
      id: eventId++, type: "corroboration",
      title: "NO INDEPENDENT CORROBORATION FOUND",
      detail: "No retrieved source corroborated or contradicted the extracted claims. Insufficient evidence available.",
    });
  }

  // Linguistic/structural signals — SUPPLEMENTARY only, never corroboration.
  // They are never counted as factual evidence or corroboration anywhere.
  if (args.greenFlags.length > 0 && args.redFlags.length > 0) {
    events.push({
      id: eventId++, type: "linguistic_analysis",
      title: "Mixed linguistic signals",
      detail: args.greenFlags.length + " positive and " + args.redFlags.length + " negative linguistic patterns detected (supplementary signals only — linguistic analysis is not proof of truth).",
    });
  } else if (args.greenFlags.length > 0) {
    events.push({
      id: eventId++, type: "linguistic_analysis",
      title: "Positive linguistic signals",
      detail: args.greenFlags.length + " indicators consistent with credible reporting: " + args.greenFlags.slice(0, 2).join("; ") + ". (Supplementary only — linguistic analysis is not proof of truth.)",
    });
  } else if (args.redFlags.length > 0) {
    events.push({
      id: eventId++, type: "linguistic_analysis",
      title: "Negative linguistic signals",
      detail: args.redFlags.length + " indicators of potential unreliability: " + args.redFlags.slice(0, 2).join("; ") + ". (Supplementary only — linguistic analysis is not proof of truth.)",
    });
  }

  const supported = args.claims.filter(c => c.status === "supported").length;
  const contradicted = args.claims.filter(c => c.status === "contradicted").length;
  events.push({
    id: eventId++, type: "assessment",
    title: "Evidence-based assessment generated",
    detail:
      "Confidence: " + args.confidence + "%. " +
      supported + " claim(s) corroborated, " + contradicted + " contradicted by retrieved sources. " +
      "Verdict derived from retrieved claims and evidence; linguistic analysis is supplementary.",
  });

  return events;
}

// ─── FRESHNESS (derived from real dates only) ──────────────────────────────

function buildFreshness(claims: RawClaim[], sourceProfile: SourceProfile): FreshnessResult[] {
  return claims.slice(0, 5).map((claim) => {
    const dateStr =
      (claim.text.match(/(\d{1,2}\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i) ||
       claim.text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i) ||
       claim.text.match(/\b(19|20)\d{2}\b/))?.[0] || "";

    const hasTemporal = /\b(currently|today|this week|this month|this year|recently|yesterday|last week|last month)\b/i.test(claim.text);
    const hasHistorical = /\b(history|historical|ancient|centuries ago|in the past|traditionally)\b/i.test(claim.text);

    let status: FreshnessResult["status"] = "unknown";
    let ageDays = 0;

    const parsed = dateStr ? new Date(dateStr) : null;
    if (parsed && !isNaN(parsed.getTime())) {
      ageDays = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 86_400_000));
      if (hasHistorical || ageDays > 365 * 3) status = "historical";
      else if (ageDays > 180) status = "outdated";
      else if (ageDays <= 7) status = "current";
      else status = "recent";
    } else if (hasHistorical) {
      status = "historical";
    } else if (hasTemporal) {
      status = "current";
    } else {
      status = "unknown";
    }

    return {
      claimId: claim.id,
      claimText: claim.text.slice(0, 80),
      status,
      sourceDate: sourceProfile.publishedDate,
      ageDays,
      newerAvailable: false, // we do not check for newer versions — never claim we do
    };
  });
}

// ─── ARTICLE WORD/CATEGORY ANALYSIS (supplementary linguistic layer) ───────

async function analyzeText(text: string, depth: Depth, urlCtx?: { url: string; page: PageMeta }) {
  const wordCount = text.split(/\s+/).length;
  let redFlagScore = 0, greenFlagScore = 0;
  const redFlags: string[] = [], greenFlags: string[] = [];
  const categoryBreakdown: Array<{ category: string; type: "red" | "green"; score: number; maxScore: number; findings: string[] }> = [];

  // ── RED FLAGS ──
  const redCategories = [
    { name: "Sensationalism", patterns: SENSATIONALIST, threshold1: 30, threshold2: 15, msg1: (n: number) => "Highly sensationalist (" + n + " instances)", msg2: "Sensationalist language detected" },
    { name: "Clickbait", patterns: CLICKBAIT, threshold1: 15, threshold2: 8, msg1: (n: number) => "Multiple clickbait patterns (" + n + ")", msg2: (m: string[]) => "Clickbait: \"" + m[0] + "\"" },
    { name: "Anonymous Sourcing", patterns: ANONYMOUS_SOURCING, threshold1: 20, threshold2: 10, msg1: "Heavy anonymous sourcing", msg2: "Some anonymous sourcing" },
    { name: "Fear-Mongering", patterns: FEAR_MONGERING, threshold1: 20, threshold2: 10, msg1: "Fear-mongering detected", msg2: "Some alarmist language" },
    { name: "Conspiracy", patterns: CONSPIRACY, threshold1: 18, threshold2: 9, msg1: (n: number) => "Conspiracy language (" + n + ")", msg2: "Conspiracy-themed language" },
  ];

  for (const cat of redCategories) {
    const result = weightedMatches(text, cat.patterns);
    let score = 0, findings: string[] = [];
    if (result.score >= cat.threshold1) { score = 30; findings.push(typeof cat.msg1 === "function" ? (cat.msg1 as any)(result.total) : cat.msg1); }
    else if (result.score >= cat.threshold2) { score = 15; findings.push(typeof cat.msg2 === "function" ? (cat.msg2 as any)(result.matches) : cat.msg2); }
    redFlagScore += score;
    if (findings.length) redFlags.push(...findings);
    categoryBreakdown.push({ category: cat.name, type: "red", score, maxScore: 30, findings });
  }

  const capsCount = (text.match(/[A-Z]{3,}!{1,}/g))?.length ?? 0;
  if (capsCount >= 5) { redFlagScore += 18; redFlags.push("Excessive caps/exclamation (" + capsCount + ")"); categoryBreakdown.push({ category: "Excessive Caps", type: "red", score: 18, maxScore: 20, findings: [capsCount + " instances"] }); }

  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu))?.length ?? 0;
  if (emojiCount >= 3) { redFlagScore += 12; redFlags.push("Excessive emoji (" + emojiCount + ")"); categoryBreakdown.push({ category: "Emoji Overuse", type: "red", score: 12, maxScore: 15, findings: [emojiCount + " emojis"] }); }

  if (text.match(/share.*(before|now)|before.*(delete|remove)/i)) { redFlagScore += 12; redFlags.push("Urgency/sharing pressure"); categoryBreakdown.push({ category: "Urgency Tactics", type: "red", score: 12, maxScore: 15, findings: ["Sharing pressure detected"] }); }

  // ── GREEN FLAGS ──
  const cred = weightedMatches(text, CREDIBLE_INDICATORS);
  let credScore = 0;
  if (cred.score >= 25) { credScore = 25; greenFlags.push("Strong attribution language (" + cred.total + " signals)"); }
  else if (cred.score >= 12) { credScore = 16; greenFlags.push("Moderate attribution language (" + cred.total + " signals)"); }
  greenFlagScore += credScore;
  categoryBreakdown.push({ category: "Attribution Language", type: "green", score: credScore, maxScore: 25, findings: cred.score >= 12 ? [cred.total + " indicators"] : [] });

  let statsScore = 0;
  if (/\d+%|\$[\d,]+|\d+ million|\d+ billion/i.test(text)) { statsScore = 16; greenFlags.push("Specific statistics cited"); }
  greenFlagScore += statsScore;
  categoryBreakdown.push({ category: "Data & Statistics", type: "green", score: statsScore, maxScore: 16, findings: statsScore ? ["Statistics present"] : [] });

  const credCount = CREDIBLE_SOURCES.filter(p => p.test(text)).length;
  let instScore = 0;
  if (credCount >= 2) { instScore = 22; greenFlags.push("Known institutions mentioned (" + credCount + ")"); }
  else if (credCount >= 1) { instScore = 11; greenFlags.push("Known institution mentioned"); }
  greenFlagScore += instScore;
  categoryBreakdown.push({ category: "Institutional References", type: "green", score: instScore, maxScore: 22, findings: credCount ? [credCount + " mentioned"] : [] });

  let dateScore = 0;
  if (/\d{4}|\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)) { dateScore = 14; greenFlags.push("Specific dates present"); }
  greenFlagScore += dateScore;
  categoryBreakdown.push({ category: "Temporal Specificity", type: "green", score: dateScore, maxScore: 14, findings: dateScore ? ["Dates present"] : [] });

  let balanceScore = 0;
  if (/however|on the other hand|critics (say|argue)|despite/i.test(text)) { balanceScore = 18; greenFlags.push("Balanced reporting language"); }
  greenFlagScore += balanceScore;
  categoryBreakdown.push({ category: "Balanced Language", type: "green", score: balanceScore, maxScore: 18, findings: balanceScore ? ["Multiple perspectives present"] : [] });

  let structScore = 0;
  const struct = ["who", "what", "where", "when", "why"].filter(w => new RegExp("\\b" + w + "\\b", "i").test(text)).length;
  if (struct >= 4) { structScore = 16; greenFlags.push("Journalistic structure (" + struct + "/5 Ws)"); }
  greenFlagScore += structScore;
  categoryBreakdown.push({ category: "Journalistic Structure", type: "green", score: structScore, maxScore: 16, findings: structScore ? [struct + "/5 elements"] : [] });

  let lenScore = 0;
  if (wordCount >= 80 && wordCount <= 800) { lenScore = 6; greenFlags.push("Appropriate article length"); }
  greenFlagScore += lenScore;

  // ── BASE LINGUISTIC SIGNAL (supplementary only — final verdict is gated by evidence below) ──
  const total = Math.max(redFlagScore + greenFlagScore, 1);
  const redRatio = redFlagScore / total, greenRatio = greenFlagScore / total;
  let baseVerdict: "likely_real" | "likely_fake" | "uncertain";
  let baseConfidence: number;

  if (redRatio >= 0.65) { baseVerdict = "likely_fake"; baseConfidence = Math.min(72, Math.round(45 + redRatio * 30)); }
  else if (greenRatio >= 0.65) { baseVerdict = "likely_real"; baseConfidence = Math.min(72, Math.round(45 + greenRatio * 30)); }
  else if (redRatio > greenRatio + 0.1) { baseVerdict = "likely_fake"; baseConfidence = Math.min(65, Math.round(38 + (redRatio - greenRatio) * 28)); }
  else if (greenRatio > redRatio + 0.1) { baseVerdict = "likely_real"; baseConfidence = Math.min(65, Math.round(38 + (greenRatio - redRatio) * 28)); }
  else { baseVerdict = "uncertain"; baseConfidence = Math.round(30 + Math.abs(redRatio - greenRatio) * 12); }
  baseConfidence = Math.max(25, Math.min(72, baseConfidence));

  const hasSource = /according to|published|researchers|officials|university/i.test(text);
  if (!hasSource && credCount < 2) baseConfidence = Math.max(25, baseConfidence - 15);
  if (redFlags.length === 0 && greenFlags.length === 0) baseConfidence = Math.max(25, baseConfidence - 10);

  const triggeredKeywords = findTriggeredKeywords(text);

  // ── CLAIM EXTRACTION ──
  const rawClaims = extractRawClaims(text, CLAIM_LIMIT[depth]);
  const sourceProfile = extractSourceProfile(text, greenFlags, redFlags, urlCtx);

  // ── LIVE EXTERNAL CROSS-CHECK ──
  const checked = rawClaims.slice(0, CROSSCHECK_LIMIT[depth]);
  const searchResults = await Promise.all(checked.map(c => searchClaim(c.text)));
  const searchFailures = searchResults.filter(r => !r.ok).length;

  const claims: ClaimResult[] = rawClaims.map((raw) => {
    const idx = checked.findIndex(c => c.id === raw.id);
    const note = linguisticNote(raw);

    if (idx === -1) {
      return {
        id: raw.id, text: raw.text,
        status: "needs_verification", confidence: 30,
        evidence: "Not cross-checked at this depth — insufficient evidence available.",
        sources: [], contradictingSources: [],
        explanation: "This claim was not cross-checked against external sources in this analysis pass. Insufficient evidence available. " + note,
      };
    }

    const result = searchResults[idx];
    const sources = result.sources.filter(s => s.url); // real retrieved results only
    const supports = sources.filter(s => s.relationship === "supports");
    const partials = sources.filter(s => s.relationship === "partial");
    const contradicts = sources.filter(s => s.relationship === "contradicts");
    const notAddressing = sources.filter(s =>
      s.relationship === "does_not_address" || s.relationship === "unverified");

    if (!result.ok) {
      return {
        id: raw.id, text: raw.text,
        status: "needs_verification", confidence: 30,
        evidence: "External source search unavailable" + (result.error ? " (" + result.error + ")" : "") + " — insufficient evidence available.",
        sources: [], contradictingSources: [],
        explanation: "The live external source search could not be completed for this claim, so no verification was possible. Insufficient evidence available. " + note,
      };
    }

    // ── EVIDENCE QUALITY: primary/authoritative sources weigh more than
    // loosely related secondary coverage. A low-quality source never
    // overrides direct primary-source evidence.
    const authorityOf = (s: { url: string }) => sourceAuthority(s.url, raw.text);
    const bestContraAuthority = contradicts.reduce((m, s) => Math.max(m, authorityOf(s)), 0);
    const bestSupportAuthority = supports.reduce((m, s) => Math.max(m, authorityOf(s)), 0);
    // A contradiction must come from a credible publisher AND must not be
    // outweighed by stronger evidence: an aggregator, content farm or repost
    // on its own can never mark a claim as contradicted.
    const contradictionDecisive = contradicts.length > 0 &&
      bestContraAuthority >= MIN_CREDIBLE_AUTHORITY &&
      (supports.length === 0 || bestContraAuthority >= bestSupportAuthority);

    if (contradictionDecisive) {
      const ranked = [...contradicts].sort((a, b) => authorityOf(b) - authorityOf(a));
      const c = ranked[0];
      return {
        id: raw.id, text: raw.text,
        status: "contradicted", confidence: bestContraAuthority >= 2 ? 68 : 64,
        evidence: "CONTRADICTED — " + (c.reason ? c.reason + ". " : "") +
          "Retrieved source: \"" + c.headline + "\" — " + c.name +
          (c.date !== "N/A" ? " (" + c.date + ")" : "") + ".",
        sources: [],
        contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "The content of the retrieved source conflicts with the proposition asserted by this claim (relationship: CONTRADICTS). Sharing the same topic, person, organization or event is never treated as corroboration. " + note,
      };
    }

    if (supports.length > 0) {
      const s = supports[0];
      return {
        id: raw.id, text: raw.text,
        status: "supported", confidence: 75,
        evidence: "Corroborated by " + supports.length + " independent retrieved source(s) whose content matches this claim's proposition" + (s.reason ? " — " + s.reason.toLowerCase() : "") + ": \"" + s.headline + "\" — " + s.name +
          (s.date !== "N/A" ? " (" + s.date + ")" : "") + ".",
        sources: supports.map(x => x.name + " — \"" + x.headline + "\""),
        contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "The retrieved source content agrees with the specific proposition asserted by this claim — entity or topic overlap alone was never counted as corroboration. This is corroboration of coverage, not absolute proof. " + note,
      };
    }

    if (partials.length > 0) {
      const p = partials[0];
      return {
        id: raw.id, text: raw.text,
        status: "uncertain", confidence: 45,
        evidence: "Partially addressed by retrieved coverage" + (p.reason ? " — " + p.reason.toLowerCase() : "") + ": \"" + p.headline + "\" — " + p.name + ". Insufficient independent corroboration found.",
        sources: [], contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "Retrieved coverage only partially addresses this claim's proposition — independent corroboration remains incomplete. " + note,
      };
    }

    // No source addressed the proposition: results that merely mention the
    // same topic or entity are explicitly reported as not addressing it.
    const nonCorroborating = sources.filter(s => s.name !== "NO INDEPENDENT CORROBORATION FOUND" && s.name !== "SOURCE SEARCH UNAVAILABLE");
    // An attributed quotation needs the ATTRIBUTION itself confirmed, not just
    // the same characterization of the event: report that precisely.
    const attribution = attributedQuote(raw.text);
    const attributionNote = attribution
      ? " This is an attributed quotation: no retrieved source was found that both names " + attribution.speaker + " and credits them with the same statement, so the attribution remains unverified."
      : "";
    return {
      id: raw.id, text: raw.text,
      status: "needs_verification", confidence: 30,
      evidence: (nonCorroborating.length > 0
        ? "NO INDEPENDENT CORROBORATION FOUND — " + nonCorroborating.length + " retrieved result(s) mention the same topic or entity, but none address the specific proposition asserted by this claim. Insufficient evidence available."
        : "NO INDEPENDENT CORROBORATION FOUND — insufficient evidence available.") + attributionNote,
      sources: [], contradictingSources: [],
      explanation: "Topic similarity is not corroboration: retrieved results that only mention the same person, organization or event do not verify this claim. Absence of corroboration is not proof of falsity — the claim remains unverified. " + note,
    };
  });

  // ── CROSS-CHECK OUTPUT (real retrieved sources only) ──
  const crossCheck: CrossCheckClaimResult[] = checked.map((raw, i) => ({
    claimId: raw.id,
    claimText: raw.text,
    sources: searchResults[i].sources.map(s => ({
      name: s.name, headline: s.headline, date: s.date, excerpt: s.excerpt,
      relationship: s.relationship, url: s.url,
    })),
  }));

  // ── SOURCE COUNTS (shared source of truth — same module the frontend uses) ──
  const sourceCounts = deriveSourceCounts(crossCheck);
  const totalRetrieved = sourceCounts.uniqueSources; // UNIQUE sources (distinct URLs)
  const sourceRefs = sourceCounts.claimSourceRefs;   // claim–source references (== sum of per-claim refs)
  // Lookup list used only to quote example headlines in summaries — NOT for counting.
  const realSourcesAll = crossCheck.flatMap(c => c.sources).filter(s => s.url);

  // ── EVIDENCE-BASED VERDICT ──
  const supportedCount = claims.filter(c => c.status === "supported").length;
  const contradictedCount = claims.filter(c => c.status === "contradicted").length;
  const partialCount = claims.filter(c => c.status === "uncertain").length;
  const evidenceRatio = claims.length > 0 ? (supportedCount + 0.5 * partialCount) / claims.length : 0;

  const firstSupport = realSourcesAll.find(s => s.relationship === "supports");
  const firstContradiction = realSourcesAll.find(s => s.relationship === "contradicts");

  let verdict: "likely_real" | "likely_fake" | "uncertain";
  let confidence: number;
  let summary: string;

  if (claims.length === 0) {
    verdict = "uncertain";
    confidence = Math.min(baseConfidence, 32);
    summary = "UNABLE TO VERIFY — no distinct factual claims could be extracted from this content, so no claim-level verification was possible."
      + (redFlags.length > 0 ? " " + redFlags.length + " linguistic warning signal(s) were detected." : "");
  } else if (contradictedCount > 0 && supportedCount === 0) {
    verdict = "likely_fake";
    confidence = clamp(55 + contradictedCount * 8 + Math.round(redRatio * 10), 55, 80);
    summary = "LIKELY MISLEADING — " + contradictedCount + " cross-checked claim(s) are contradicted by retrieved independent coverage."
      + (firstContradiction ? " Example: \"" + firstContradiction.headline + "\" — " + firstContradiction.name + "." : "")
      + (redFlags.length ? " " + redFlags.length + " linguistic warning signal(s) also detected." : "");
  } else if (supportedCount >= 2 && contradictedCount === 0) {
    verdict = "likely_real";
    // Confidence rises with corroborated evidence only — linguistic signals
    // never add to it (Problem: language must not paper over missing evidence).
    confidence = clamp(Math.round(55 + 20 * evidenceRatio), 55, redRatio >= 0.6 ? 72 : 85);
    summary = "LIKELY CREDIBLE — " + supportedCount + " cross-checked claim(s) are corroborated by independent retrieved sources"
      + (firstSupport ? " (e.g. \"" + firstSupport.headline + "\" — " + firstSupport.name + ")" : "")
      + ". Linguistic signals: " + greenFlags.length + " positive, " + redFlags.length + " warning.";
  } else if (supportedCount === 1 && contradictedCount === 0) {
    if (redRatio < 0.5) {
      verdict = "likely_real";
      confidence = clamp(60, 55, 70);
      summary = "LIKELY CREDIBLE — 1 cross-checked claim is corroborated by independent retrieved coverage"
        + (firstSupport ? " (\"" + firstSupport.headline + "\" — " + firstSupport.name + ")" : "")
        + ". Remaining claims are not yet corroborated; " + (claims.length - supportedCount) + " claim(s) still need verification.";
    } else {
      verdict = "uncertain";
      confidence = clamp(48 + Math.round((greenRatio - redRatio) * 5), 42, 55);
      summary = "MIXED EVIDENCE — 1 cross-checked claim is corroborated, but the writing style shows " + redFlags.length + " strong warning signal(s). Treat with caution and verify further.";
    }
  } else if (contradictedCount > 0) {
    verdict = "uncertain";
    confidence = clamp(45 + contradictedCount * 3, 45, 55);
    summary = "MIXED EVIDENCE — retrieved independent coverage both corroborates (" + supportedCount + ") and contradicts (" + contradictedCount + ") the extracted claims. Conflicting evidence — verify against primary sources.";
  } else {
    // No decisive external evidence for any claim.
    const allFailed = searchFailures >= checked.length && checked.length > 0;
    if (allFailed) {
      verdict = "uncertain";
      confidence = Math.min(baseConfidence, 35);
      summary = "UNABLE TO VERIFY — the external source search was unavailable, so this assessment is limited to linguistic pattern analysis. Insufficient evidence available.";
    } else if (baseVerdict === "likely_fake" && redRatio >= 0.55) {
      // Language patterns alone NEVER produce a Fake verdict. Without
      // external evidence the result is UNCERTAIN, with the warning signals
      // reported as supplementary context only.
      verdict = "uncertain";
      confidence = Math.min(baseConfidence, 40);
      summary = "INSUFFICIENT EVIDENCE — NO INDEPENDENT CORROBORATION FOUND across " + checked.length + " cross-checked claim(s). "
        + "The writing style shows " + redFlags.length + " linguistic warning signal(s), but language signals are supplementary only and are never treated as proof of falsity. "
        + "Unable to verify — independent verification is recommended.";
    } else {
      verdict = "uncertain";
      confidence = Math.min(baseConfidence, 40);
      summary = "INSUFFICIENT EVIDENCE — NO INDEPENDENT CORROBORATION FOUND across " + checked.length + " cross-checked claim(s) ("
        + totalRetrieved + " unique source(s) retrieved (" + sourceRefs + " claim–source reference(s)), none corroborating). Unable to verify. Confidence is limited accordingly.";
    }
  }

  // ── HARD RULE: a contradicted claim never yields a credible verdict ──
  // The verdict must reflect the strongest verified contradictions, not the
  // number of retrieved sources. Authoritative contradicting evidence caps
  // the result well below "LIKELY CREDIBLE".
  if (contradictedCount > 0 && verdict === "likely_real") {
    verdict = "uncertain";
    confidence = Math.min(confidence, 50);
  }

  confidence = clamp(confidence, 25, 85);

  // ── CONFIDENCE CEILING — never high while claims remain unverified ──
  // Unresolved = no firm external evidence either for or against the claim.
  const unresolvedCount = claims.length - supportedCount - contradictedCount;
  if (claims.length > 0 && unresolvedCount > 0) {
    if (unresolvedCount > claims.length / 2) confidence = Math.min(confidence, 55);
    else confidence = Math.min(confidence, 69);
  }

  // ── HONEST SUMMARY + REASONING ──
  const parts: string[] = [];
  if (redFlags.length) parts.push("Concerns: " + redFlags.slice(0, 3).join("; ") + ".");
  if (greenFlags.length) parts.push("Positives: " + greenFlags.slice(0, 3).join("; ") + ".");
  if (checked.length === 0) {
    parts.push("Evidence basis: no claims were available for external cross-checking — assessment limited to linguistic patterns.");
  } else if (searchFailures >= checked.length) {
    parts.push("Evidence basis: external source search unavailable — assessment limited to linguistic pattern analysis only.");
  } else {
    parts.push(
      "Evidence basis: " + supportedCount + " corroborated, " + contradictedCount + " contradicted, " +
      partialCount + " partially addressed, " + (claims.length - checked.length) + " not cross-checked — " +
      "derived from " + totalRetrieved + " unique independent source(s) (" + sourceRefs + " claim–source reference(s)) retrieved in a live search" +
      (searchFailures > 0 ? " (" + searchFailures + " claim search(es) unavailable)" : "") + ".",
    );
  }
  if (claims.length > 0 && unresolvedCount > 0) {
    parts.push(unresolvedCount + " of " + claims.length + " claim(s) remain unverified (no firm external evidence for or against) — confidence is capped accordingly.");
  }
  parts.push("Confidence: " + confidence + "%. Verdict is driven by retrieved claims and external evidence; linguistic pattern analysis is supplementary. Independent verification is always recommended.");

  // ── ARTICLE FINGERPRINT (derived from the same investigation) ──
  const fingerprint: FingerprintResult = {
    claims: claims.length,
    sources: totalRetrieved,
    sourceRefs,
    verified: supportedCount,
    uncertain: partialCount,
    contradicted: contradictedCount,
    unverified: claims.length - supportedCount - partialCount - contradictedCount,
    // Share of claims that retrieved evidence actually reached — this can never
    // read 0% while corroborating sources were found for some claim.
    sourceCoverage: claims.length > 0
      ? Math.round(((supportedCount + partialCount) / claims.length) * 100)
      : 0,
    evidenceFound: totalRetrieved + redFlags.length + greenFlags.length,
  };

  // ── EVIDENCE TIMELINE (actual events) ──
  const evidenceTimeline = buildTimeline({
    text, claims, sourceProfile, greenFlags, redFlags,
    crossCheck, checkedCount: checked.length, searchFailures,
    totalRetrieved, sourceRefs, verdict, confidence,
    fromUrl: !!urlCtx,
  });

  // ── FRAMING SIGNALS ──
  const framingSignals: Array<{ type: string; description: string; severity: "low" | "medium" | "high" }> = [];
  const capsMatch = text.match(/[A-Z]{4,}[!]{1,}/g);
  if (capsMatch && capsMatch.length > 0) {
    framingSignals.push({ type: "EXCESSIVE CAPS", description: "Contains " + capsMatch.length + " ALL CAPS phrases/exclamations — uncommon in professional journalism.", severity: "high" });
  }
  const emotionalWords = text.match(/\b(shocking|outrage|terrifying|heartbreaking|unbelievable|miraculous|disgusting|horrible|amazing|incredible)\b/gi);
  if (emotionalWords && emotionalWords.length >= 2) {
    const wordList = [...new Set(emotionalWords.map(w => w.toLowerCase()))].slice(0, 3).join(", ");
    framingSignals.push({ type: "EMOTIONALLY LOADED WORDING", description: "Contains " + emotionalWords.length + " emotionally charged words: " + wordList + ".", severity: "medium" });
  }
  if (/\b(but|however|although|despite)\b/i.test(text) === false && greenFlags.length > 2) {
    framingSignals.push({ type: "SELECTIVE CONTEXT", description: "The article presents a single perspective without acknowledging counterarguments.", severity: "low" });
  }
  const certaintyWords = text.match(/\b(definitely|certainly|absolutely|undoubtedly|proves|confirms|without a doubt)\b/gi);
  if (certaintyWords && certaintyWords.length >= 3) {
    framingSignals.push({ type: "EXCESSIVE CERTAINTY", description: "Uses language suggesting absolute certainty (" + certaintyWords.length + " instances), unusual for factual reporting.", severity: "medium" });
  }
  const vaguePhrases = text.match(/\b(everyone knows|it is well known|studies show|experts say)\b/gi);
  if (vaguePhrases && vaguePhrases.length >= 2) {
    framingSignals.push({ type: "MISSING CONTEXT", description: "References vague claims (" + vaguePhrases.length + " instances) without specific context or sources.", severity: "medium" });
  }
  const superlatives = text.match(/\b(biggest|largest|most|best|worst|first ever|never before)\b/gi);
  if (superlatives && superlatives.length >= 2 && greenFlags.length < 2) {
    framingSignals.push({ type: "UNSUPPORTED SUPERLATIVES", description: "Uses superlative claims (" + superlatives.length + " instances) without evident supporting data.", severity: "high" });
  }
  if (/\b(breaking|urgent|just in|developing|alert|emergency)\b/i.test(text)) {
    framingSignals.push({ type: "DRAMATIC WORDING", description: "Uses urgency-creating language (breaking, urgent, alert).", severity: "low" });
  }
  if (framingSignals.length === 0) {
    framingSignals.push({ type: "NO SIGNIFICANT FRAMING", description: "No significant framing bias detected through linguistic analysis.", severity: "low" });
  }

  return {
    verdict, confidence, summary, redFlags, greenFlags,
    reasoning: parts.join(" "),
    triggeredKeywords,
    categoryBreakdown: categoryBreakdown.filter(c => c.maxScore > 0),
    wordCount,
    claims,
    sourceProfile,
    evidenceTimeline,
    fingerprint,
    crossCheck,
    framingSignals,
    freshness: buildFreshness(rawClaims, sourceProfile),
    extractedText: text,
  };
}

// ─── URL RETRIEVAL ──────────────────────────────────────────────────────────

function htmlAttr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp("\\b" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\">']+))", "i"));
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonLdName(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return decodeHtml(val);
  if (Array.isArray(val)) return val.map(jsonLdName).filter(Boolean).join(", ");
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (typeof o.name === "string") return decodeHtml(o.name);
  }
  return "";
}

/**
 * Parse original-source metadata (title, Open Graph, JSON-LD, byline, dates,
 * article type) from the raw retrieved HTML — BEFORE text stripping.
 * Source Profile display only; never feeds verdict/confidence/scoring.
 */
function extractPageMetadata(html: string): PageMeta {
  const page: PageMeta = {};

  // "<title>" fallback
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) page.title = decodeHtml(titleMatch[1]);

  // <meta> tags — Open Graph and conventional names
  const metas: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const keyRaw = htmlAttr(tag, "name") || htmlAttr(tag, "property") || htmlAttr(tag, "itemprop");
    const content = htmlAttr(tag, "content");
    if (!keyRaw || !content) continue;
    const key = keyRaw.toLowerCase();
    if (!(key in metas)) metas[key] = decodeHtml(content);
  }
  page.siteName = metas["og:site_name"] || metas["application-name"] || undefined;
  page.ogType = metas["og:type"] || undefined;
  const authorMeta = metas["author"] || metas["article:author"] || metas["byl"];
  if (authorMeta && !/^https?:\/\//i.test(authorMeta)) page.author = authorMeta;
  page.publisher = metas["publisher"] && !/^https?:\/\//i.test(metas["publisher"])
    ? metas["publisher"]
    : undefined;
  page.published =
    metas["article:published_time"] || metas["og:article:published_time"] ||
    metas["date"] || metas["pubdate"] || metas["publish-date"] || metas["publish_date"] ||
    metas["publication_date"] || metas["dc.date"] || metas["dcterms.date"] ||
    metas["timestamp"] || undefined;
  page.modified =
    metas["article:modified_time"] || metas["og:updated_time"] ||
    metas["dcterms.modified"] || metas["last-modified"] || metas["lastmod"] || undefined;

  // JSON-LD (schema.org) — resolves @id references such as
  // publisher/author: { "@id": "https://example.com/#organization" }.
  const nodes: any[] = [];
  const ldRe = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch: RegExpExecArray | null;
  while ((ldMatch = ldRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(ldMatch[1].trim());
      if (Array.isArray(parsed)) nodes.push(...parsed);
      else if (parsed && Array.isArray(parsed["@graph"])) nodes.push(...parsed["@graph"]);
      else if (parsed) nodes.push(parsed);
    } catch {
      // malformed JSON-LD — ignore and fall back to other metadata
    }
  }
  const byId = new Map<string, any>();
  for (const n of nodes) {
    if (n && typeof n === "object" && typeof n["@id"] === "string") byId.set(n["@id"], n);
  }
  const resolveRef = (val: any): any => {
    if (val && typeof val === "object" && !Array.isArray(val) &&
        typeof val["@id"] === "string" && byId.has(val["@id"])) {
      return byId.get(val["@id"]);
    }
    return val;
  };
  for (const raw of nodes) {
    const node = resolveRef(raw);
    if (!node || typeof node !== "object") continue;
    const typeStr = Array.isArray(node["@type"])
      ? node["@type"].join(" ")
      : typeof node["@type"] === "string" ? node["@type"] : "";
    if (!/article|blogposting|report/i.test(typeStr)) continue;
    if (!page.publisher) {
      const p = jsonLdName(resolveRef(node.publisher));
      if (p) page.publisher = p;
    }
    if (!page.author) {
      const a = jsonLdName(
        Array.isArray(node.author)
          ? node.author.map((x: any) => resolveRef(x))
          : resolveRef(node.author),
      );
      if (a && !/^https?:\/\//i.test(a)) page.author = a;
    }
    if (!page.published && typeof node.datePublished === "string") page.published = node.datePublished;
    if (!page.modified && typeof node.dateModified === "string") page.modified = node.dateModified;
    if (!page.articleType) page.articleType = typeStr;
    if (!page.title && typeof node.headline === "string") page.title = decodeHtml(node.headline);
  }

  return page;
}

// ─── ARTICLE BODY ISOLATION (claim-extraction boundary) ────────────────────
// Claims must be derived from the submitted article's primary content only.
// Navigation menus, related/recommendation cards, "read more" sections,
// headers/footers, ads, widgets and unrelated timestamps are excluded before
// any sentence can become a claim. Preferred sources, in order: JSON-LD
// articleBody → <article> → <main> → main-content containers → whole page
// (legacy strip). Source Profile metadata keeps parsing the raw HTML and is
// unaffected; verdict, confidence, evidence and cross-check logic are
// unchanged — this only narrows the text they analyze.

/** Elements that are never part of the primary article body.
 *  `figure`/`figcaption` carry image captions and photographer credits — they
 *  are page furniture, never a factual claim. */
const CHROME_TAGS = [
  "script", "style", "noscript", "svg", "iframe", "nav", "header", "footer",
  "aside", "form", "button", "figure", "figcaption", "picture", "source",
  "audio", "video", "address", "template", "h1",
];

/** class/id tokens that mark a recommendation, widget or ad block. */
const WIDGET_TOKENS = new Set([
  "related", "relatedlinks", "recommend", "recommended", "recommendations",
  "recirculation", "readmore", "readnext", "morestories",
  "newsletter", "subscribe", "subscription", "signup",
  "advert", "advertisement", "ad", "ads", "sponsored",
  "social", "share", "shares", "sharesheet", "sharing",
  "promo", "trending", "popular", "mostpopular",
  "comment", "comments", "sidebar", "widget", "widgets",
  "breadcrumb", "breadcrumbs", "pagination", "pager",
  "modal", "popup", "cookie", "banner", "skip", "follow",
  "nav", "navigation",
  // image captions / photographer credits / bylines
  "caption", "captions", "figcaption", "imgcaption", "imagecaption",
  "mediacaption", "photocredit", "photocredits", "imgcredit", "imagecredit",
  "photograph", "photographs", "photographer", "photographers",
  "byline", "bylines", "authorbio", "authorsbio",
  "standfirst", "standfirsts", "subheadline", "hedline", "hedlines",
]);

/** Widget phrases that simple class/id tokens would miss. */
const WIDGET_PHRASES = /read[-_ ]?more|related[-_ ]?(?:content|articles|links|stories)|recommend|news[-_ ]?letter|most[-_ ]?popular|download|file[-_ ]?list/;

/** Void elements have no closing tag — only the tag itself is removed. */
const VOID_TAGS = new Set(["img", "input", "hr", "br", "source", "link", "meta", "area", "base", "col", "embed", "track", "wbr"]);

/** Remove every element in the list, together with its content. */
function removeTagElements(html: string, tags: string[]): string {
  let out = html;
  for (const tag of tags) {
    out = out.replace(
      new RegExp("<" + tag + "(?=[\\s>])[^>]*>[\\s\\S]*?<\\/" + tag + "\\s*>", "gi"),
      " ",
    );
  }
  return out;
}

/** Does this opening tag belong to a widget / ad / recommendation block? */
function isWidgetOpening(openTag: string): boolean {
  const attrRe = /(?:class|id)\s*=\s*(["'])([\s\S]*?)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(openTag)) !== null) {
    const value = m[2].toLowerCase();
    if (WIDGET_PHRASES.test(value)) return true;
    for (const token of value.split(/[^a-z0-9]+/)) {
      if (token && WIDGET_TOKENS.has(token)) return true;
    }
  }
  return false;
}

/** Position right after the balanced closing tag for `tag`, or -1 if the
 *  element never closes (fallback keeps the legacy first-close behavior). */
function findBalancedClose(html: string, tag: string, from: number): number {
  const scan = new RegExp("</?" + tag + "(?=[\\s>/])[^>]*>", "gi");
  scan.lastIndex = from;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = scan.exec(html)) !== null) {
    if (m[0].charAt(1) === "/") {
      depth--;
      if (depth === 0) return scan.lastIndex;
    } else {
      depth++;
    }
  }
  return -1;
}

/** Cut out widget/recommendation/ad blocks matched by class or id. */
function removeWidgetBlocks(html: string): string {
  const openRe = /<([a-z][a-z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  const cuts: Array<[number, number]> = [];
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html)) !== null) {
    const full = m[0];
    const tag = m[1].toLowerCase();
    if (!isWidgetOpening(full)) continue;
    if (full.endsWith("/>") || VOID_TAGS.has(tag)) {
      cuts.push([m.index, openRe.lastIndex]);
      continue;
    }
    let end = findBalancedClose(html, tag, openRe.lastIndex);
    if (end === -1) {
      const closeMatch = new RegExp("</" + tag + "\\s*>", "i").exec(html.slice(openRe.lastIndex));
      if (closeMatch) end = openRe.lastIndex + closeMatch.index + closeMatch[0].length;
      else continue;
    }
    cuts.push([m.index, end]);
  }
  if (cuts.length === 0) return html;
  cuts.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const cut of cuts) {
    const last = merged[merged.length - 1];
    if (last && cut[0] <= last[1]) last[1] = Math.max(last[1], cut[1]);
    else merged.push([cut[0], cut[1]]);
  }
  let out = "";
  let pos = 0;
  for (const span of merged) {
    out += html.slice(pos, span[0]) + " ";
    pos = span[1];
  }
  return out + html.slice(pos);
}

/** Strip tags and decode entities with the legacy rules. */
function toReadableText(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Legacy whole-page strip — unchanged fallback when no structure exists. */
function wholePageText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** schema.org articleBody from the raw HTML, when the page publishes one. */
function jsonLdArticleBody(html: string): string {
  const ldRe = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const nodes: any[] = Array.isArray(parsed) ? parsed
        : parsed && Array.isArray(parsed["@graph"]) ? parsed["@graph"]
        : parsed ? [parsed] : [];
      for (const node of nodes) {
        if (node && typeof node.articleBody === "string" && node.articleBody.trim()) {
          return node.articleBody;
        }
      }
    } catch {
      // malformed JSON-LD — ignore and fall through to DOM structure
    }
  }
  return "";
}

/** Longest match of a candidate pattern as readable text. */
function bestCandidateText(html: string, pattern: RegExp): string {
  let best = "";
  let m: RegExpExecArray | null;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(html)) !== null) {
    const text = toReadableText(m[0]);
    if (text.length > best.length) best = text;
    if (pattern.lastIndex === m.index) pattern.lastIndex++;
  }
  return best;
}

/**
 * Isolate the primary article body for claim extraction.
 * Order: JSON-LD articleBody → <article> → <main> → main-content containers →
 * chrome-stripped page → legacy whole-page strip. Returns "" only when the
 * page has no readable text at all.
 */
function extractArticleBody(html: string): string {
  // Page chrome and widgets are never article content — remove them first.
  let work = removeTagElements(html, CHROME_TAGS);
  work = work.replace(/<!--[\s\S]*?-->/g, " ");
  work = removeWidgetBlocks(work);

  // 1) Structured data — schema.org articleBody (when substantial enough).
  const ldBody = toReadableText(jsonLdArticleBody(html));
  if (ldBody.length >= 400) return ldBody;

  // 2) <article>  3) <main>  4) main-content containers.
  const candidates: RegExp[] = [
    /<article(?=[\s>])[^>]*>[\s\S]*?<\/article\s*>/gi,
    /<main(?=[\s>])[^>]*>[\s\S]*?<\/main\s*>/gi,
    /<(?:div|section)(?=[\s>])[^>]*(?:class|id)\s*=\s*(["'])[^"']*(?:article[-_ ]?(?:content|body)|entry[-_ ]?content|post[-_ ]?(?:content|body)|story[-_ ]?(?:content|body)|field--name-body|rich[-_ ]?text|wysiwyg|main[-_ ]?content)[^"']*\1[^>]*>[\s\S]*?<\/(?:div|section)>/gi,
  ];
  for (const candidate of candidates) {
    const best = bestCandidateText(work, candidate);
    if (best.length >= 100) return best;
  }

  // 5) No usable structure — chrome-stripped page, then legacy whole page.
  const chromeStripped = toReadableText(work);
  if (chromeStripped.length >= 100) return chromeStripped;
  return wholePageText(html);
}

// ─── URL CLASSIFICATION ───────────────────────────────────────────────────
// Submitted URLs are classified BEFORE any retrieval is attempted so that:
//   • a structurally malformed input is reported as "Invalid URL";
//   • a valid Instagram post/reel URL is recognised as Instagram and, when its
//     content cannot be read, reported as a RETRIEVAL LIMITATION of that
//     platform — never as an invalid URL;
//   • every other URL keeps the existing article-retrieval behaviour.
// The submitted string is never rewritten: the original value is what the
// investigation/replay data carries.

const INSTAGRAM_HOST = "instagram.com";

type UrlPlatform = "instagram_post" | "instagram_reel" | "instagram_other" | "web";

/** A usable web address inside the submitted string (pastes often carry extra characters). */
function extractUrlCandidate(raw: string): string | null {
  const match = /https?:\/\/[^\s<>"'`]+/i.exec(raw);
  if (!match) return null;
  return match[0].replace(/[)\]}>.,;:!?'"]+$/, "");
}

function classifyUrl(parsed: URL): UrlPlatform {
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== INSTAGRAM_HOST && host !== "m." + INSTAGRAM_HOST) return "web";
  const path = parsed.pathname.toLowerCase();
  if (/^\/(?:p|tv)\//.test(path)) return "instagram_post";
  if (/^\/(?:reel|reels)\//.test(path)) return "instagram_reel";
  return "instagram_other";
}

/** Shown when Instagram itself prevents automated retrieval of the post. */
const INSTAGRAM_NOT_RETRIEVABLE =
  "Instagram does not allow the post content to be retrieved automatically.";

/** Browser-shaped request for Instagram; news sites keep the existing agent. */
const INSTAGRAM_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * The post caption Instagram publishes in its own page metadata, with the
 * "97 likes, 2 comments - handle on November 5, 2025: " envelope removed.
 * Returns "" when the page exposes no caption — nothing is ever invented.
 */
function instagramPostText(html: string): string {
  let description = "";
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = (htmlAttr(tag, "property") || htmlAttr(tag, "name") || "").toLowerCase();
    if (key !== "og:description" && key !== "description") continue;
    const content = decodeEntities(htmlAttr(tag, "content") || "");
    if (content.length > description.length) description = content;
  }
  if (!description) return "";
  const caption = description
    .replace(/^\s*\d[\d,.]*\s+likes?(?:,\s*\d[\d,.]*\s+comments?)?\s*-\s*/i, "")
    .replace(/^\s*@?[\w.\-]+\s+on\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4}\s*:\s*/, "")
    .replace(/^[\s:—-]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  return caption.length >= 40 ? caption : "";
}

async function fetchArticleText(
  url: string,
): Promise<
  | { ok: true; text: string; page: PageMeta }
  | { ok: false; error: string; invalid?: boolean; instagram?: boolean }
> {
  const candidate = extractUrlCandidate(url) ?? url.trim();
  let parsed: URL;
  try {
    parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "only http/https URLs are supported", invalid: true };
    }
  } catch {
    return { ok: false, error: "Invalid URL", invalid: true };
  }

  const platform = classifyUrl(parsed);
  const instagram = platform !== "web";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": instagram ? INSTAGRAM_USER_AGENT : "Mozilla/5.0 (compatible; Veritas/1.0)",
        ...(instagram ? { accept: "text/html,application/xhtml+xml", "accept-language": "en-US,en;q=0.9" } : {}),
      },
    });
    // Instagram blocks, rate-limits and login-walls automated readers. That is
    // a retrieval limitation of the platform, never a malformed URL.
    if (!res.ok) {
      return instagram
        ? { ok: false, error: INSTAGRAM_NOT_RETRIEVABLE, instagram: true }
        : { ok: false, error: "server responded with HTTP " + res.status };
    }
    const html = await res.text();
    // Original-source metadata for the Source Profile — parsed from the raw
    // HTML before script/style stripping.
    const page = extractPageMetadata(html);
    if (instagram) {
      // Instagram serves a JavaScript shell: the only server-rendered post
      // text is the caption in its own metadata. When even that is absent the
      // investigation stops here — no text is reconstructed or inferred.
      const caption = instagramPostText(html);
      if (!caption) return { ok: false, error: INSTAGRAM_NOT_RETRIEVABLE, instagram: true };
      return { ok: true, text: caption.slice(0, 12000), page };
    }
    // Claim extraction gets ONLY the primary article body: navigation,
    // related/recommendation content, footers, ads and widgets are excluded
    // before any sentence can become a claim. Falls back to the whole-page
    // strip when the page exposes no usable content structure.
    const text = extractArticleBody(html);
    if (text.length < 100) return { ok: false, error: "no readable article text found on the page" };
    return { ok: true, text: text.slice(0, 12000), page };
  } catch (e) {
    return instagram
      ? { ok: false, error: INSTAGRAM_NOT_RETRIEVABLE, instagram: true }
      : { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
  } finally {
    clearTimeout(timer);
  }
}

// ─── EMPTY / UNAVAILABLE RESULT (honest, consistent shape) ─────────────────

function emptyResult(summary: string, rawInput: string, analyzedText: string) {
  return {
    verdict: "uncertain" as const,
    confidence: 25,
    summary,
    redFlags: [] as string[],
    greenFlags: [] as string[],
    reasoning: summary + " No claim verification or external source search was performed, so no confidence beyond the minimum is claimed.",
    triggeredKeywords: [] as string[],
    categoryBreakdown: [] as Array<{ category: string; type: "red" | "green"; score: number; maxScore: number; findings: string[] }>,
    wordCount: analyzedText ? analyzedText.split(/\s+/).length : rawInput.trim().split(/\s+/).length,
    claims: [] as ClaimResult[],
    sourceProfile: {
      source: "NOT AVAILABLE", domain: "NOT AVAILABLE", author: "NOT AVAILABLE",
      publishedDate: "NOT AVAILABLE", updatedDate: "NOT AVAILABLE", sourceType: "NOT AVAILABLE",
      availableEvidence: ["Insufficient input for source extraction"],
      signals: [] as Array<{ label: string; available: boolean }>,
    },
    evidenceTimeline: [] as TimelineEventResult[],
    fingerprint: { claims: 0, sources: 0, sourceRefs: 0, verified: 0, uncertain: 0, contradicted: 0, unverified: 0, sourceCoverage: 0, evidenceFound: 0 } as FingerprintResult,
    crossCheck: [] as CrossCheckClaimResult[],
    framingSignals: [] as Array<{ type: string; description: string; severity: "low" | "medium" | "high" }>,
    freshness: [] as FreshnessResult[],
    extractedText: analyzedText,
  };
}

// ─── URL RETRIEVAL FAILED — investigation TERMINATED before analysis ───────
// No claim extraction, source search, evidence collection, cross-checking,
// framing analysis, confidence calculation or verdict generation is performed.
// The frontend renders a distinct "RETRIEVAL FAILED" state (confidence shown
// as "—", verdict "RETRIEVAL FAILED", not "UNCERTAIN"), and this result is
// never persisted as an investigation case file.
function retrievalFailedResult(
  summary: string,
  url: string,
  reason: string,
  platform?: "instagram",
) {
  return {
    ...emptyResult(summary, url, ""),
    retrievalFailed: true as const,
    // The ORIGINAL submitted URL — never a shortened platform label — so the
    // investigation/replay data and the UI can identify the real source.
    failedUrl: url,
    // Present only when the limit comes from a named platform (Instagram),
    // so the UI can describe the failure accurately without re-parsing the URL.
    failedPlatform: platform,
    failureReason: reason || "URL could not be accessed or article content could not be retrieved.",
    // Internal placeholder only — never displayed (the UI gates on
    // retrievalFailed and shows confidence "—" / verdict "RETRIEVAL FAILED").
    confidence: 0,
    // No article text was ever analyzed — never count the URL's own words.
    wordCount: 0,
  };
}

export const analyzeNews = action({
  args: {
    text: v.string(),
    inputType: v.union(v.literal("text"), v.literal("url")),
    depth: v.optional(v.union(v.literal("quick"), v.literal("standard"), v.literal("deep"))),
  },
  handler: async (_ctx, args) => {
    const depth: Depth = args.depth ?? "standard";
    const rawInput = args.text.trim();
    let analyzedText = rawInput;
    let urlCtx: { url: string; page: PageMeta } | undefined;

    if (args.inputType === "url") {
      const fetched = await fetchArticleText(rawInput);
      if (!fetched.ok) {
        // FETCH FAILED → STOP. Nothing downstream of retrieval is executed.
        // A valid but unreadable Instagram post is a platform retrieval limit,
        // reported as such — never as an invalid URL, and never with invented
        // claims, sources, evidence, verdict or confidence.
        if (fetched.instagram) {
          return retrievalFailedResult(
            "UNABLE TO RETRIEVE — Instagram content could not be retrieved automatically. No factual verification was performed.",
            rawInput, fetched.error, "instagram",
          );
        }
        return retrievalFailedResult(
          "UNABLE TO RETRIEVE — could not fetch article text from the provided URL (" + fetched.error + "). No analysis was performed. Paste the article text directly instead.",
          rawInput, fetched.error,
        );
      }
      analyzedText = fetched.text;
      urlCtx = { url: rawInput, page: fetched.page };
    }

    if (analyzedText.length < 10) {
      return emptyResult(
        "Text too short for meaningful analysis. At least 10 characters of article content are required.",
        rawInput, analyzedText,
      );
    }

    return await analyzeText(analyzedText, depth, urlCtx);
  },
});
