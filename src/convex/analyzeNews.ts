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

type Relationship = "supports" | "contradicts" | "partial" | "insufficient";

interface RetrievedSource {
  name: string;        // real publisher
  headline: string;    // real headline
  date: string;        // real pubDate (or "N/A")
  excerpt: string;     // real description/snippet from the result
  url: string;         // real URL ("" for sentinel notices)
  relationship: Relationship;
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
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w.replace(/[^a-z]/g, ""))),
  )];
}

/** Normalized numeric values mentioned in the claim ("12", "5.25", "8200"). */
function claimNumbers(text: string): string[] {
  const matches = text.match(/\d+(?:[.,]\d+)*/g) || [];
  return [...new Set(matches.map(m => m.replace(/,/g, "")))];
}

/** Headline-level signals that a source disputes the claim. Conservative. */
const DEBUNK_PATTERN =
  /\b(false|misleading|debunk(ed|ing)?|fact[- ]?check(ed|ing)?|hoax|misinformation|disinformation|untrue|not true|no evidence|false claim|wrong|baseless|conspiracy (claim|theory|theories))\b/i;

function evaluateRelationship(
  claimText: string,
  headline: string,
  description: string,
): { relationship: Relationship; overlap: number } {
  const tokens = claimTokens(claimText);
  const haystack = (headline + " " + description).toLowerCase();
  const matched = tokens.filter(t => haystack.includes(t)).length;
  const overlap = tokens.length > 0 ? matched / tokens.length : 0;

  const nums = claimNumbers(claimText);
  const numsMatched = nums.filter(n =>
    new RegExp(`(^|[^0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^0-9]|$)`).test(haystack),
  ).length;
  const numsOk = nums.length === 0 || numsMatched >= nums.length;

  // A fact-check style headline about the same claim → contradiction signal.
  if (overlap >= 0.34 && DEBUNK_PATTERN.test(headline)) {
    return { relationship: "contradicts", overlap };
  }
  // Strong token overlap + matching figures → corroborating coverage.
  if (overlap >= 0.5 && numsOk) {
    return { relationship: "supports", overlap };
  }
  // Partial topical overlap → partial.
  if (overlap >= 0.3 || (nums.length > 0 && numsMatched > 0 && overlap >= 0.2)) {
    return { relationship: "partial", overlap };
  }
  return { relationship: "insufficient", overlap };
}

function parseRssItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string; publisher: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string; publisher: string }> = [];
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
    items.push({
      title,
      link: get("link"),
      pubDate: get("pubDate"),
      description: get("description").replace(/<[^>]*>/g, ""),
      publisher: get("source"),
    });
    if (items.length >= 10) break;
  }
  return items;
}

function publisherFromItem(item: { publisher: string; link: string }): string {
  if (item.publisher) return item.publisher;
  try {
    return new URL(item.link).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown publisher";
  }
}

function formatDate(pubDate: string): string {
  if (!pubDate) return "N/A";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Live search for independent coverage of a claim.
 * Returns real retrieved sources only. On failure, `ok` is false.
 */
async function searchClaim(claimText: string): Promise<ClaimSearch> {
  const query = claimText.replace(/["“”]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
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
    const items = parseRssItems(xml);

    const evaluated = items.map(item => {
      const { relationship, overlap } = evaluateRelationship(claimText, item.title, item.description);
      return {
        name: publisherFromItem(item),
        headline: item.title,
        date: formatDate(item.pubDate),
        excerpt: item.description.slice(0, 240) || "No snippet available.",
        url: item.link,
        relationship,
        overlap,
      };
    });

    evaluated.sort((a, b) => b.overlap - a.overlap);
    const top = evaluated.slice(0, 3).map(({ overlap: _overlap, ...src }) => src);

    const anySupport = top.some(s => s.relationship === "supports" || s.relationship === "partial");
    if (top.length > 0 && !anySupport) {
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

// ─── CLAIM EXTRACTION (text only — status comes from real evidence) ───────

interface RawClaim {
  id: number;
  text: string;
  hasNumbers: boolean;
  hasSource: boolean;
  hasAnonymous: boolean;
  hasSensational: boolean;
}

function extractRawClaims(text: string, maxClaims: number): RawClaim[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
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
  for (const sentence of sentences) {
    if (claimId > maxClaims) break;
    const isFactual = factualPatterns.some(p => p.test(sentence));
    if (!isFactual) continue;
    if (sentence.split(/\s+/).length < 6) continue;

    claims.push({
      id: claimId++,
      text: sentence.length > 160 ? sentence.slice(0, 160) + "..." : sentence,
      hasNumbers: /\d+%|\$[\d,]+|\d+ (million|billion)/i.test(sentence),
      hasSource: /according to|published|researchers|officials|university/i.test(sentence),
      hasAnonymous: /experts? (say|claim|warn)|sources? (say|claim)|insiders?/i.test(sentence),
      hasSensational: /[A-Z]{3,}!|shocking|unbelievable|secret|hidden|exposed/i.test(sentence),
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
// Extracts metadata mentioned IN the article text.
// Does NOT retrieve external information about the source.

function extractSourceProfile(
  text: string,
  greenFlags: string[],
  redFlags: string[],
) {
  const sourceMatch = text.match(/(?:according to|published (?:in|on|by)|reported (?:by|in)|from)\s+(?:the\s+)?([A-Z][A-Za-z\s.&]+(?:University|Institute|Journal|News|Times|Guardian|Reuters|BBC|Nature|Science|Agency|Organization|Report|Foundation|Centre|Center))/i)
    || text.match(/(Reuters|BBC|The New York Times|The Guardian|Nature|Science|The Lancet|CNN|AP News|AFP|Al Jazeera)/i);
  const source = sourceMatch ? sourceMatch[1].trim() : "NOT AVAILABLE";

  const domainMatch = text.match(/(www\.)?([a-zA-Z0-9-]+\.[a-z]{2,})/i);
  const domain = domainMatch ? domainMatch[2] : "NOT AVAILABLE";

  const authorMatch = text.match(/(?:by|author:?|written by|reporter:?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
    || text.match(/Dr\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i)
    || text.match(/(Professor|Prof\.?)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i);
  const author = authorMatch ? authorMatch[0].replace(/^(by|author:?|written by|reporter:?)/i, "").trim() : "NOT AVAILABLE";

  const dateMatch = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i)
    || text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);
  const publishedDate = dateMatch ? dateMatch[0] : "NOT AVAILABLE";

  const isResearch = /university|institute|published in|journal|study|research/i.test(text);
  const isGov = /government|official|minister|agency|cdc|fda|who|nasa/i.test(text);
  const isNews = /reporter|correspondent|journalist|news|press|media/i.test(text);
  // A publisher TYPE is only displayed when a source was actually detected in
  // the text. Keyword hints about the topic (e.g. "government") do not
  // classify an unidentified publisher.
  const sourceType = source === "NOT AVAILABLE"
    ? "NOT AVAILABLE"
    : isResearch ? "Research" : isGov ? "Government" : isNews ? "News" : "Other";

  const evidence: string[] = [];
  if (source !== "NOT AVAILABLE") evidence.push("Source name detected in text: " + source);
  if (author !== "NOT AVAILABLE") evidence.push("Author name detected in text: " + author);
  if (publishedDate !== "NOT AVAILABLE") evidence.push("Date detected in text: " + publishedDate);
  if (greenFlags.length > 0) evidence.push(greenFlags.length + " linguistic credibility signals detected");
  if (redFlags.length > 0) evidence.push(redFlags.length + " warning signals detected");
  if (evidence.length === 0) evidence.push("Limited source metadata could be extracted from text");

  const signals = [
    { label: "Author name in text", available: author !== "NOT AVAILABLE" },
    { label: "Publication date in text", available: publishedDate !== "NOT AVAILABLE" },
    { label: "Source name in text", available: source !== "NOT AVAILABLE" },
    { label: "Attribution language detected", available: /according to|published|official statement/i.test(text) },
    { label: "Institution mentioned", available: /university|institute|organization/i.test(text) },
    { label: "Anonymous sourcing absent", available: !/anonymous|insiders? (reveal|say)|sources? (say|claim)/i.test(text) },
  ];

  return { source, domain, author, publishedDate, updatedDate: "NOT AVAILABLE", sourceType, availableEvidence: evidence, signals };
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
    events.push({
      id: eventId++, type: "source_found",
      title: "Source attribution detected in text",
      detail: "The text mentions a named source: " + args.sourceProfile.source + ". This is text detection, not independent verification.",
      source: args.sourceProfile.source,
    });
  } else {
    events.push({
      id: eventId++, type: "source_searched",
      title: "No named source detected in text",
      detail: "No specific source, author, or institution was identified in the text.",
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

async function analyzeText(text: string, depth: Depth) {
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
  const sourceProfile = extractSourceProfile(text, greenFlags, redFlags);

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

    if (!result.ok) {
      return {
        id: raw.id, text: raw.text,
        status: "needs_verification", confidence: 30,
        evidence: "External source search unavailable" + (result.error ? " (" + result.error + ")" : "") + " — insufficient evidence available.",
        sources: [], contradictingSources: [],
        explanation: "The live external source search could not be completed for this claim, so no verification was possible. Insufficient evidence available. " + note,
      };
    }

    if (contradicts.length > 0 && supports.length === 0) {
      const c = contradicts[0];
      return {
        id: raw.id, text: raw.text,
        status: "contradicted", confidence: 65,
        evidence: "Contradicted by retrieved independent coverage: \"" + c.headline + "\" — " + c.name + (c.date !== "N/A" ? " (" + c.date + ")" : "") + ".",
        sources: [],
        contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "Retrieved independent coverage disputes this claim. The source was found through a live search for this claim. " + note,
      };
    }

    if (supports.length > 0) {
      const s = supports[0];
      return {
        id: raw.id, text: raw.text,
        status: "supported", confidence: 75,
        evidence: "Corroborated by " + supports.length + " independent retrieved source(s): \"" + s.headline + "\" — " + s.name + (s.date !== "N/A" ? " (" + s.date + ")" : "") + ".",
        sources: supports.map(x => x.name + " — \"" + x.headline + "\""),
        contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "Independent retrieved coverage matches the specific details of this claim. This is corroboration of coverage, not absolute proof. " + note,
      };
    }

    if (partials.length > 0) {
      const p = partials[0];
      return {
        id: raw.id, text: raw.text,
        status: "uncertain", confidence: 45,
        evidence: "Partially addressed by retrieved coverage: \"" + p.headline + "\" — " + p.name + ". Insufficient independent corroboration found.",
        sources: [],
        contradictingSources: contradicts.map(s => s.name + " — \"" + s.headline + "\""),
        explanation: "Retrieved coverage only partially addresses this claim — independent corroboration remains incomplete. " + note,
      };
    }

    const nonCorroborating = sources.filter(s => s.name !== "NO INDEPENDENT CORROBORATION FOUND" && s.name !== "SOURCE SEARCH UNAVAILABLE");
    return {
      id: raw.id, text: raw.text,
      status: "needs_verification", confidence: 30,
      evidence: nonCorroborating.length > 0
        ? "NO INDEPENDENT CORROBORATION FOUND — a live search returned " + nonCorroborating.length + " result(s), but none addressed this claim closely enough. Insufficient evidence available."
        : "NO INDEPENDENT CORROBORATION FOUND — insufficient evidence available.",
      sources: [], contradictingSources: [],
      explanation: "No independent source corroborates or contradicts this claim. Absence of corroboration is not proof of falsity — the claim remains unverified. " + note,
    };
  });

  // ── CROSS-CHECK OUTPUT (real retrieved sources only) ──
  const crossCheck: CrossCheckClaimResult[] = checked.map((raw, i) => ({
    claimId: raw.id,
    claimText: raw.text,
    sources: searchResults[i].sources.map(s => ({ ...s })),
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
    confidence = clamp(Math.round(55 + 20 * evidenceRatio + 8 * greenRatio), 55, redRatio >= 0.6 ? 72 : 85);
    summary = "LIKELY CREDIBLE — " + supportedCount + " cross-checked claim(s) are corroborated by independent retrieved sources"
      + (firstSupport ? " (e.g. \"" + firstSupport.headline + "\" — " + firstSupport.name + ")" : "")
      + ". Linguistic signals: " + greenFlags.length + " positive, " + redFlags.length + " warning.";
  } else if (supportedCount === 1 && contradictedCount === 0) {
    if (redRatio < 0.5) {
      verdict = "likely_real";
      confidence = clamp(Math.round(55 + 10 * greenRatio + 5), 55, 70);
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
    sourceCoverage: claims.length > 0 ? Math.round((supportedCount / claims.length) * 100) : 0,
    evidenceFound: totalRetrieved + redFlags.length + greenFlags.length,
  };

  // ── EVIDENCE TIMELINE (actual events) ──
  const evidenceTimeline = buildTimeline({
    text, claims, sourceProfile, greenFlags, redFlags,
    crossCheck, checkedCount: checked.length, searchFailures,
    totalRetrieved, sourceRefs, verdict, confidence,
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

async function fetchArticleText(url: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "only http/https URLs are supported" };
    }
  } catch {
    return { ok: false, error: "invalid URL" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; Veritas/1.0)" },
    });
    if (!res.ok) return { ok: false, error: "server responded with HTTP " + res.status };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length < 100) return { ok: false, error: "no readable article text found on the page" };
    return { ok: true, text: text.slice(0, 12000) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
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
function retrievalFailedResult(summary: string, url: string, reason: string) {
  return {
    ...emptyResult(summary, url, ""),
    retrievalFailed: true as const,
    failedUrl: url,
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

    if (args.inputType === "url") {
      const fetched = await fetchArticleText(rawInput);
      if (!fetched.ok) {
        // FETCH FAILED → STOP. Nothing downstream of retrieval is executed.
        return retrievalFailedResult(
          "UNABLE TO RETRIEVE — could not fetch article text from the provided URL (" + fetched.error + "). No analysis was performed. Paste the article text directly instead.",
          rawInput, fetched.error,
        );
      }
      analyzedText = fetched.text;
    }

    if (analyzedText.length < 10) {
      return emptyResult(
        "Text too short for meaningful analysis. At least 10 characters of article content are required.",
        rawInput, analyzedText,
      );
    }

    return await analyzeText(analyzedText, depth);
  },
});
