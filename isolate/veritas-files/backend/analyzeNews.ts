"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════════════════
// Veritas NLP-Based Fake News Detection Engine v3
// Now returns category-level breakdowns for visualization.
// ═══════════════════════════════════════════════════════════════════════════════

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
  [/(one|a) (trick|simple|weird|secret)/i, 5],
  [/number \d+ will (shock|amaze|surprise)/i, 7],
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

// ─── WEIGHTED MATCHING ──────────────────────────────────────────────────────

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

// ─── ANALYSIS ───────────────────────────────────────────────────────────────

function analyzeText(text: string) {
  const wordCount = text.split(/\s+/).length;
  let redFlagScore = 0, greenFlagScore = 0;
  const redFlags: string[] = [], greenFlags: string[] = [];
  const categoryBreakdown: Array<{ category: string; type: "red" | "green"; score: number; maxScore: number; findings: string[] }> = [];

  // ── RED FLAGS ──
  const redCategories = [
    { name: "Sensationalism", patterns: SENSATIONALIST, threshold1: 30, threshold2: 15, msg1: (n: number) => `Highly sensationalist (${n} instances)`, msg2: "Sensationalist language detected" },
    { name: "Clickbait", patterns: CLICKBAIT, threshold1: 15, threshold2: 8, msg1: (n: number) => `Multiple clickbait patterns (${n})`, msg2: (m: string[]) => `Clickbait: "${m[0]}"` },
    { name: "Anonymous Sourcing", patterns: ANONYMOUS_SOURCING, threshold1: 20, threshold2: 10, msg1: "Heavy anonymous sourcing", msg2: "Some anonymous sourcing" },
    { name: "Fear-Mongering", patterns: FEAR_MONGERING, threshold1: 20, threshold2: 10, msg1: "Fear-mongering detected", msg2: "Some alarmist language" },
    { name: "Conspiracy", patterns: CONSPIRACY, threshold1: 18, threshold2: 9, msg1: (n: number) => `Conspiracy language (${n})`, msg2: "Conspiracy-themed language" },
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

  // Additional red flags
  const capsCount = (text.match(/[A-Z]{3,}!{1,}/g))?.length ?? 0;
  if (capsCount >= 5) { redFlagScore += 18; redFlags.push(`Excessive caps/exclamation (${capsCount})`); categoryBreakdown.push({ category: "Excessive Caps", type: "red", score: 18, maxScore: 20, findings: [`${capsCount} instances`] }); }

  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu))?.length ?? 0;
  if (emojiCount >= 3) { redFlagScore += 12; redFlags.push(`Excessive emoji (${emojiCount})`); categoryBreakdown.push({ category: "Emoji Overuse", type: "red", score: 12, maxScore: 15, findings: [`${emojiCount} emojis`] }); }

  if (text.match(/share.*(before|now)|before.*(delete|remove)/i)) { redFlagScore += 12; redFlags.push("Urgency/sharing pressure"); categoryBreakdown.push({ category: "Urgency Tactics", type: "red", score: 12, maxScore: 15, findings: ["Sharing pressure detected"] }); }

  // ── GREEN FLAGS ──
  const cred = weightedMatches(text, CREDIBLE_INDICATORS);
  let credScore = 0;
  if (cred.score >= 25) { credScore = 25; greenFlags.push(`Strong sourcing (${cred.total})`); }
  else if (cred.score >= 12) { credScore = 16; greenFlags.push(`Good sourcing (${cred.total})`); }
  greenFlagScore += credScore;
  categoryBreakdown.push({ category: "Source Quality", type: "green", score: credScore, maxScore: 25, findings: cred.score >= 12 ? [`${cred.total} indicators`] : [] });

  let statsScore = 0;
  if (/\d+%|\$[\d,]+|\d+ million|\d+ billion/i.test(text)) { statsScore = 16; greenFlags.push("Specific statistics cited"); }
  greenFlagScore += statsScore;
  categoryBreakdown.push({ category: "Data & Statistics", type: "green", score: statsScore, maxScore: 16, findings: statsScore ? ["Statistics present"] : [] });

  const credCount = CREDIBLE_SOURCES.filter(p => p.test(text)).length;
  let instScore = 0;
  if (credCount >= 2) { instScore = 22; greenFlags.push(`Credible institutions (${credCount})`); }
  greenFlagScore += instScore;
  categoryBreakdown.push({ category: "Institutional References", type: "green", score: instScore, maxScore: 22, findings: credCount ? [`${credCount} sources`] : [] });

  let dateScore = 0;
  if (/on (monday|tuesday|wednesday|thursday|friday)/i.test(text)) { dateScore = 14; greenFlags.push("Specific dates provided"); }
  greenFlagScore += dateScore;
  categoryBreakdown.push({ category: "Temporal Specificity", type: "green", score: dateScore, maxScore: 14, findings: dateScore ? ["Dates present"] : [] });

  let balanceScore = 0;
  if (/however|on the other hand|critics (say|argue)/i.test(text)) { balanceScore = 18; greenFlags.push("Balanced reporting"); }
  greenFlagScore += balanceScore;
  categoryBreakdown.push({ category: "Balanced Reporting", type: "green", score: balanceScore, maxScore: 18, findings: balanceScore ? ["Multiple perspectives"] : [] });

  let structScore = 0;
  const struct = ["who", "what", "where", "when", "why"].filter(w => new RegExp(`\\b${w}\\b`, "i").test(text)).length;
  if (struct >= 4) { structScore = 16; greenFlags.push("Journalistic structure"); }
  greenFlagScore += structScore;
  categoryBreakdown.push({ category: "Journalistic Structure", type: "green", score: structScore, maxScore: 16, findings: structScore ? [`${struct}/5 elements`] : [] });

  let lenScore = 0;
  if (wordCount >= 80 && wordCount <= 800) { lenScore = 6; greenFlags.push("Appropriate length"); }
  greenFlagScore += lenScore;

  // ── VERDICT ──
  const total = Math.max(redFlagScore + greenFlagScore, 1);
  const redRatio = redFlagScore / total, greenRatio = greenFlagScore / total;
  let verdict: "likely_real" | "likely_fake" | "uncertain";
  let confidence: number;

  if (redRatio >= 0.65) { verdict = "likely_fake"; confidence = Math.min(95, Math.round(55 + redRatio * 40)); }
  else if (greenRatio >= 0.65) { verdict = "likely_real"; confidence = Math.min(95, Math.round(55 + greenRatio * 40)); }
  else if (redRatio > greenRatio + 0.1) { verdict = "likely_fake"; confidence = Math.min(78, Math.round(42 + (redRatio - greenRatio) * 35)); }
  else if (greenRatio > redRatio + 0.1) { verdict = "likely_real"; confidence = Math.min(78, Math.round(42 + (greenRatio - redRatio) * 35)); }
  else { verdict = "uncertain"; confidence = Math.round(35 + Math.abs(redRatio - greenRatio) * 15); }
  confidence = Math.max(35, Math.min(95, confidence));

  const triggeredKeywords = findTriggeredKeywords(text);

  const summary = verdict === "likely_fake"
    ? `This content shows ${redFlags.length} red flags suggesting it may be unreliable. ${redFlags[0] ?? "Language patterns raise concerns."} Exercise caution.`
    : verdict === "likely_real"
    ? `This content shows ${greenFlags.length} indicators consistent with credible journalism. ${greenFlags[0] ?? "Sourcing appears legitimate."}`
    : `Mixed profile: ${redFlags.length} concerns, ${greenFlags.length} positives. Verify through independent sources.`;

  const parts: string[] = [];
  if (redFlags.length) parts.push(`Concerns: ${redFlags.slice(0, 3).join("; ")}.`);
  if (greenFlags.length) parts.push(`Positives: ${greenFlags.slice(0, 3).join("; ")}.`);
  parts.push(`Confidence: ${confidence}% based on linguistic pattern analysis, source verification, and structural evaluation.`);

  return {
    verdict, confidence, summary, redFlags, greenFlags,
    reasoning: parts.join(" "),
    triggeredKeywords,
    categoryBreakdown: categoryBreakdown.filter(c => c.maxScore > 0),
    wordCount,
  };
}

export const analyzeNews = action({
  args: { text: v.string(), inputType: v.union(v.literal("text"), v.literal("url")) },
  handler: async (_ctx, args) => {
    if (args.text.trim().length < 10) {
      return {
        verdict: "uncertain" as const, confidence: 30,
        summary: "Text too short for meaningful analysis.",
        redFlags: ["Too short"], greenFlags: [],
        reasoning: "Minimum content required.", triggeredKeywords: [],
        categoryBreakdown: [], wordCount: args.text.trim().split(/\s+/).length,
      };
    }
    return analyzeText(args.text.trim());
  },
});
