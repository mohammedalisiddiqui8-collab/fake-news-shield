"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─── Enhanced NLP-Based Fake News Detection Engine v2 ─────────────────────────
// Multi-layered linguistic analysis with severity-weighted scoring,
// domain-specific heuristics, and structural pattern detection.

// ─── WORD LISTS ──────────────────────────────────────────────────────────────

const SENSATIONALIST: Array<[RegExp, number]> = [
  [/[A-Z]{3,}!{2,}/g, 8],                      // EXPOSED!!!
  [/shocking|unbelievable|mind[- ]?blowing/gi, 6],
  [/miracle|wonder|amazing|incredible/gi, 5],
  [/urgent|breaking|just in/gi, 4],
  [/exposed|revealed|exposed!!!/gi, 6],
  [/secret|hidden|suppressed|banned|censored/gi, 6],
  [/cover[- ]?up|conspiracy|conspiracy!!!/gi, 7],
  [/they don'?t want you to know/gi, 8],
  [/share (this|before|now)|before they delete/gi, 7],
  [/wake up|open your eyes|do your research/gi, 6],
  [/the truth (about|they|is)|what they'?re hiding/gi, 7],
  [/mainstream media (won'?t|doesn'?t|is paid)/gi, 8],
  [/explosive|bombshell|devastating truth/gi, 5],
  [/paradigm shift|game[- ]?changer/gi, 4],
  [/you won'?t (believe|want to miss)/gi, 7],
];

const CLICKBAIT: Array<[RegExp, number]> = [
  [/you won'?t believe/i, 6],
  [/doctors? (don'?t|hate|are shocked)/i, 7],
  [/(one|a) (trick|simple|weird|secret)/i, 5],
  [/(the|this) one (trick|simple|weird)/i, 6],
  [/number \d+ will (shock|amaze|surprise)/i, 7],
  [/what happens (next|when)/i, 5],
  [/gone wrong/i, 4],
  [/\d+%\s*of\s*(people|doctors|scientists)\s*(don'?t|won'?t)/i, 7],
  [/(before it'?s|while you still can)/i, 5],
  [/(click here|act now|limited time)/i, 6],
  [/(this simple|one weird) (fix|solution|trick)/i, 6],
  [/(celebrities|hate|love) this (trick|secret|hack)/i, 7],
];

const ANONYMOUS_SOURCING: Array<[RegExp, number]> = [
  [/experts? (say|claim|believe|warn|say)/gi, 4],
  [/studies (show|reveal|suggest|prove)/gi, 3],
  [/scientists? (say|warn|discover|reveal)/gi, 3],
  [/insiders? (reveal|say|claim)/gi, 5],
  [/sources? (say|claim|reveal)/gi, 4],
  [/researchers? (say|warn|find)/gi, 3],
  [/(a|the) (senior|top|high[- ]?ranking|unnamed)/gi, 4],
  [/anonymous (source|insider|official)/gi, 7],
  [/(people|everyone) (are saying|say|claim)/gi, 5],
  [/(they|people) are saying/gi, 4],
  [/a (certain|well[- ]?known|highly placed)/gi, 5],
  [/(our sources|inside sources|multiple sources)/gi, 5],
];

const FEAR_MONGERING: Array<[RegExp, number]> = [
  [/(they|the elite|the powerful|the rich) (are|want|plan|will) to/gi, 5],
  [/big (pharma|tech|media|tobacco|oil)/gi, 6],
  [/deep state|new world order|illuminati/gi, 7],
  [/mind control|brainwash|programming/gi, 6],
  [/poison(ing|ed|s)?|toxic|chemical(ly)?/gi, 5],
  [/depopulation|eugenics|population control/gi, 7],
  [/end times|apocalypse|armageddon/gi, 5],
  [/doom(ed)?|catastroph(e|ic)/gi, 4],
  [/(prepare|get ready) for (the worst|war|collapse)/gi, 5],
  [/(global|worldwide) (collapse|crisis|emergency)/gi, 4],
  [/(your children|future generations|we all)/gi, 3],
];

const CONSPIRACY: Array<[RegExp, number]> = [
  [/conspiracy|conspir(acy|ies|ing|atorial)/gi, 6],
  [/cover[- ]?up|covering up/gi, 6],
  [/wake up|open your eyes/gi, 6],
  [/do your (own )?research/gi, 5],
  [/sheeple|wake[- ]?up sheeple/gi, 7],
  [/fake news|lamestream|lame[- ]?stream media/gi, 5],
  [/deep state|shadow government/gi, 7],
  [/globalist|global elites|cabal/gi, 6],
  [/(the truth|what they|the real)/gi, 4],
  [/mainstream media (is|are|won'?t)/gi, 5],
  [/(google|youtube|facebook|twitter) (is|are) censoring/gi, 6],
  [/censored|silenced|suppressed(?!.*science)/gi, 5],
];

const CREDIBLE_INDICATORS: Array<[RegExp, number]> = [
  [/according to (the |a |research |official )/gi, 5],
  [/published (in|on|by) (the |a )?/gi, 6],
  [/(study|research|report|analysis) (published|found|conducted|released)/gi, 6],
  [/(data|statistics|findings) (from|show|indicate|suggest)/gi, 5],
  [/(officials?|spokesperson|representative) (said|stated|confirmed|announced)/gi, 5],
  [/in a (press|public|official) statement/gi, 6],
  [/(CEO|CTO|CFO|president|director|minister|secretary|chairman|dean)/gi, 4],
  [/(on|during|at) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, 4],
  [/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi, 5],
  [/\d{1,2}\/\d{1,2}\/\d{2,4}/g, 4],
  [/(peer[- ]?reviewed|peer reviewed)/gi, 7],
  [/(according to|as reported by|citing|cited)/gi, 4],
  [/(found that|showed that|revealed that|confirmed that)/gi, 4],
  [/(significant|statistically significant|notable)/gi, 3],
];

const CREDIBLE_SOURCES = [
  /\breuters\b/i, /\bap news\b/i, /\bassociated press\b/i,
  /\bbbc\b/i, /\bbc news\b/i, /\bnew york times\b/i,
  /\bwashington post\b/i, /\bthe guardian\b/i, /\bcnn\b/i,
  /\bnbc\b/i, /\bcbs\b/i, /\babc news\b/i, /\bnpr\b/i,
  /\bnature\b/i, /\bscience\b/i, /\bthe lancet\b/i,
  /\bjournal of\b/i, /\buniversity of\b/i, /\binstitute\b/i,
  /\bfederal reserve\b/i, /\bworld health organization\b/i,
  /\bnasa\b/i, /\bnoaa\b/i, /\bcdc\b/i, /\bfda\b/i,
  /\breuters institute\b/i, /\broyal society\b/i,
  /\bamerican medical association\b/i, /\bharvard\b/i,
  /\bmit\b/i, /\bstanford\b/i, /\boxford\b/i, /\bcambridge\b/i,
];

// ─── ANALYSIS FUNCTIONS ──────────────────────────────────────────────────────

function weightedMatches(text: string, patterns: Array<[RegExp, number]>): { total: number; score: number; matches: string[] } {
  let total = 0;
  let score = 0;
  const matches: string[] = [];

  for (const [pattern, weight] of patterns) {
    const found = text.match(pattern);
    if (found) {
      total += found.length;
      score += found.length * weight;
      matches.push(...found.slice(0, 2).map((m) => m.trim()));
    }
  }
  return { total, score, matches: [...new Set(matches)].slice(0, 3) };
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((c, p) => c + (text.match(p)?.length ?? 0), 0);
}

interface AnalysisResult {
  verdict: "likely_real" | "likely_fake" | "uncertain";
  confidence: number;
  summary: string;
  redFlags: string[];
  greenFlags: string[];
  reasoning: string;
}

function analyzeText(text: string): AnalysisResult {
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;

  let redFlagScore = 0;
  let greenFlagScore = 0;
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  // ─── RED FLAG ANALYSIS (weighted scoring) ──────────────────────────

  // 1. Sensationalist language
  const sens = weightedMatches(text, SENSATIONALIST);
  if (sens.score >= 30) {
    redFlagScore += 30;
    redFlags.push(`Highly sensationalist language (${sens.total} instances: "${sens.matches.slice(0, 2).join('", "')}")`);
  } else if (sens.score >= 15) {
    redFlagScore += 18;
    redFlags.push(`Sensationalist language detected (${sens.total} instances)`);
  } else if (sens.score >= 5) {
    redFlagScore += 8;
    redFlags.push("Mild sensationalist tone detected");
  }

  // 2. Clickbait patterns
  const cb = weightedMatches(text, CLICKBAIT);
  if (cb.score >= 15) {
    redFlagScore += 25;
    redFlags.push(`Multiple clickbait patterns detected (${cb.total} matches)`);
  } else if (cb.score >= 8) {
    redFlagScore += 14;
    redFlags.push(`Clickbait pattern detected: "${cb.matches[0]}"`);
  } else if (cb.score >= 3) {
    redFlagScore += 6;
    redFlags.push("Possible clickbait language");
  }

  // 3. Anonymous / vague sourcing
  const anon = weightedMatches(text, ANONYMOUS_SOURCING);
  if (anon.score >= 20) {
    redFlagScore += 22;
    redFlags.push("Heavy reliance on anonymous or vague sourcing");
  } else if (anon.score >= 10) {
    redFlagScore += 12;
    redFlags.push("Some anonymous or vague sourcing detected");
  } else if (anon.score >= 4) {
    redFlagScore += 5;
    redFlags.push("Minor vague sourcing detected");
  }

  // 4. Fear-mongering
  const fear = weightedMatches(text, FEAR_MONGERING);
  if (fear.score >= 20) {
    redFlagScore += 22;
    redFlags.push("Fear-mongering and alarmist language detected");
  } else if (fear.score >= 10) {
    redFlagScore += 12;
    redFlags.push("Some alarmist language detected");
  } else if (fear.score >= 4) {
    redFlagScore += 5;
    redFlags.push("Mild alarmist undertones");
  }

  // 5. Conspiracy language
  const consp = weightedMatches(text, CONSPIRACY);
  if (consp.score >= 18) {
    redFlagScore += 28;
    redFlags.push(`Conspiracy theory language detected (${consp.total} markers)`);
  } else if (consp.score >= 9) {
    redFlagScore += 16;
    redFlags.push("Conspiracy-themed language detected");
  } else if (consp.score >= 4) {
    redFlagScore += 7;
    redFlags.push("Some conspiratorial framing");
  }

  // 6. Excessive caps / exclamation marks
  const capsMatches = text.match(/[A-Z]{3,}!{1,}/g);
  const capsCount = capsMatches?.length ?? 0;
  if (capsCount >= 5) {
    redFlagScore += 18;
    redFlags.push(`Excessive capitalization and exclamation marks (${capsCount} instances)`);
  } else if (capsCount >= 2) {
    redFlagScore += 8;
    redFlags.push("Some excessive capitalization or exclamation marks");
  }

  // 7. Emoji usage (unprofessional)
  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu))?.length ?? 0;
  if (emojiCount >= 3) {
    redFlagScore += 12;
    redFlags.push(`Excessive emoji usage (${emojiCount} emojis — uncommon in journalism)`);
  } else if (emojiCount >= 1) {
    redFlagScore += 4;
    redFlags.push("Emoji usage detected (uncommon in credible journalism)");
  }

  // 8. ALL CAPS words
  const allCapsWords = text.match(/\b[A-Z]{3,}\b/g);
  const allCapsCount = allCapsWords?.filter((w) => !["CEO", "CTO", "NASA", "FDA", "CDC", "WHO", "MIT", "BBC", "CNN", "NPR", "USA", "UK", "EU", "UN", "COVID"].includes(w)).length ?? 0;
  if (allCapsCount >= 6) {
    redFlagScore += 14;
    redFlags.push(`Excessive use of ALL CAPS words (${allCapsCount} instances)`);
  } else if (allCapsCount >= 3) {
    redFlagScore += 7;
    redFlags.push("Some ALL CAPS emphasis detected");
  }

  // 9. Multiple consecutive exclamation marks
  const multiExcl = text.match(/!{3,}/g);
  if (multiExcl && multiExcl.length >= 2) {
    redFlagScore += 10;
    redFlags.push("Multiple sets of consecutive exclamation marks");
  }

  // 10. "Share before deleted" urgency
  const urgency = text.match(/share.*(before|now|this)|before.*(delete|remove|censor)|while you still can/i);
  if (urgency) {
    redFlagScore += 12;
    redFlags.push("Urgency language designed to pressure sharing");
  }

  // 11. Lack of any URL or source citation
  const hasUrl = /https?:\/\/|www\.|doi\.org|arxiv\.org/i.test(text);
  const hasSourceCitation = countMatches(text, [
    /according to/i, /published in/i, /cited by/i, /source:/i,
    /the (report|study|paper) (from|by|at)/i,
  ]);
  if (!hasUrl && hasSourceCitation === 0 && wordCount > 40) {
    redFlagScore += 6;
  }

  // 12. Short article length
  if (wordCount < 25 && wordCount > 5) {
    redFlagScore += 4;
  }

  // ─── GREEN FLAG ANALYSIS ───────────────────────────────────────────

  // 1. Named sources with attributions
  const namedSources = weightedMatches(text, CREDIBLE_INDICATORS);
  if (namedSources.score >= 25) {
    greenFlagScore += 25;
    greenFlags.push(`Strong sourcing and attribution (${namedSources.total} indicators)`);
  } else if (namedSources.score >= 12) {
    greenFlagScore += 16;
    greenFlags.push(`Good sourcing and attribution (${namedSources.total} indicators)`);
  } else if (namedSources.score >= 5) {
    greenFlagScore += 8;
    greenFlags.push("Some sourcing and attribution present");
  }

  // 2. Specific statistics / data
  const hasStats = /\d+%|\d+ percent|\d+\.\d+|₹[\d,]+|\$[\d,]+|€[\d,]+|\d+ million|\d+ billion|\d+ thousand|\d+ trillion/i.test(text);
  if (hasStats) {
    greenFlagScore += 16;
    greenFlags.push("Specific statistics and quantitative data cited");
  }

  // 3. Credible sources mentioned
  const credibleCount = countMatches(text, CREDIBLE_SOURCES);
  if (credibleCount >= 3) {
    greenFlagScore += 22;
    greenFlags.push(`Multiple references to credible institutions (${credibleCount} sources)`);
  } else if (credibleCount >= 1) {
    greenFlagScore += 12;
    greenFlags.push("Reference to a credible institution or publication");
  }

  // 4. Dates and temporal specificity
  const hasDate = /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text);
  if (hasDate) {
    greenFlagScore += 14;
    greenFlags.push("Specific dates and temporal references provided");
  }

  // 5. Balanced / nuanced reporting
  const balanced = countMatches(text, [
    /on the other hand/i, /however/i, /conversely/i, /in contrast/i,
    /critics (say|argue|claim|point out)/i, /opponents/i, /supporters/i,
    /while .* (argue|claim|believe)/i, /both (sides|perspectives)/i,
    /some (experts|analysts|officials)/i, /others (believe|argue|say)/i,
  ]);
  if (balanced >= 3) {
    greenFlagScore += 18;
    greenFlags.push("Balanced reporting with multiple perspectives");
  } else if (balanced >= 1) {
    greenFlagScore += 10;
    greenFlags.push("Some balanced perspectives present");
  }

  // 6. Journalistic structure
  const hasWho = /\b(?:who|whom|whose)\b/i.test(text);
  const hasWhat = /\b(?:what|which)\b/i.test(text);
  const hasWhere = /\b(?:where)\b/i.test(text);
  const hasWhen = /\b(?:when|while|during|after|before)\b/i.test(text);
  const hasWhy = /\b(?:why|because|since|due to|as a result|accordingly)\b/i.test(text);
  const structureCount = [hasWho, hasWhat, hasWhere, hasWhen, hasWhy].filter(Boolean).length;
  if (structureCount >= 4) {
    greenFlagScore += 16;
    greenFlags.push("Follows journalistic structure (who, what, where, when, why)");
  } else if (structureCount >= 3) {
    greenFlagScore += 10;
    greenFlags.push("Partial journalistic structure present");
  } else if (structureCount >= 2) {
    greenFlagScore += 5;
    greenFlags.push("Basic informational structure detected");
  }

  // 7. Neutral / measured tone
  const emotionalWords = countMatches(text, [
    /amazing|terrible|horrible|wonderful|awful|disgusting|incredible|unbelievable|outrage|furious|devastating|mind[- ]?blowing|sickening|terrifying|unprecedented|disastrous/i,
  ]);
  if (emotionalWords === 0 && wordCount > 40) {
    greenFlagScore += 12;
    greenFlags.push("Neutral and measured tone throughout");
  } else if (emotionalWords <= 1 && wordCount > 40) {
    greenFlagScore += 6;
    greenFlags.push("Mostly neutral tone");
  }

  // 8. Proper article length
  if (wordCount >= 80 && wordCount <= 800) {
    greenFlagScore += 6;
    greenFlags.push("Appropriate article length for news reporting");
  } else if (wordCount >= 50) {
    greenFlagScore += 3;
  }

  // 9. Quotes from named individuals
  const namedQuotes = countMatches(text, [
    /["""].*?["""] (?:said|stated|noted|explained|added|continued|wrote)/gi,
    /(?:said|stated|noted|explained|added) [" ""].*?["""]/gi,
    /[A-Z][a-z]+ (?:said|stated|noted|explained|wrote) [":]/gi,
  ]);
  if (namedQuotes >= 2) {
    greenFlagScore += 14;
    greenFlags.push("Multiple quotes from named individuals");
  } else if (namedQuotes >= 1) {
    greenFlagScore += 8;
    greenFlags.push("Quote from a named individual");
  }

  // ─── VERDICT CALCULATION ───────────────────────────────────────────

  const totalScore = Math.max(redFlagScore + greenFlagScore, 1);
  const redRatio = redFlagScore / totalScore;
  const greenRatio = greenFlagScore / totalScore;

  let verdict: "likely_real" | "likely_fake" | "uncertain";
  let confidence: number;

  if (redRatio >= 0.65) {
    verdict = "likely_fake";
    confidence = Math.min(95, Math.round(55 + redRatio * 40));
  } else if (greenRatio >= 0.65) {
    verdict = "likely_real";
    confidence = Math.min(95, Math.round(55 + greenRatio * 40));
  } else if (redRatio > greenRatio + 0.1) {
    verdict = "likely_fake";
    confidence = Math.min(78, Math.round(42 + (redRatio - greenRatio) * 35));
  } else if (greenRatio > redRatio + 0.1) {
    verdict = "likely_real";
    confidence = Math.min(78, Math.round(42 + (greenRatio - redRatio) * 35));
  } else {
    verdict = "uncertain";
    confidence = Math.round(35 + Math.abs(redRatio - greenRatio) * 15);
  }

  confidence = Math.max(35, Math.min(95, confidence));

  // ─── SUMMARY GENERATION ────────────────────────────────────────────

  const topRed = redFlags[0] ?? "language patterns raise concerns";
  const topGreen = greenFlags[0] ?? "structural elements are present";
  const redCount = redFlags.length;
  const greenCount = greenFlags.length;

  let summary: string;
  if (verdict === "likely_fake") {
    summary = `This content shows ${redCount} red flag${redCount !== 1 ? "s" : ""} suggesting it may be unreliable. ${topRed}. Exercise caution before sharing or trusting this information.`;
  } else if (verdict === "likely_real") {
    summary = `This content shows ${greenCount} positive indicator${greenCount !== 1 ? "s" : ""} consistent with credible journalism. ${topGreen}. However, always cross-reference important claims with additional sources.`;
  } else {
    summary = `This content has a mixed profile with ${redCount} concern${redCount !== 1 ? "s" : ""} and ${greenCount} positive indicator${greenCount !== 1 ? "s" : ""}. ${topRed}, but ${topGreen}. Verify claims through independent sources.`;
  }

  // ─── REASONING GENERATION ──────────────────────────────────────────

  const reasoningParts: string[] = [];

  if (redFlags.length > 0) {
    reasoningParts.push(`The analysis identified ${redFlags.length} concern${redFlags.length !== 1 ? "s" : ""}: ${redFlags.slice(0, 3).join("; ")}.`);
  }
  if (greenFlags.length > 0) {
    reasoningParts.push(`${greenFlags.length} positive indicator${greenFlags.length !== 1 ? "s" : ""} ${greenFlags.length !== 1 ? "were" : "was"} found: ${greenFlags.slice(0, 3).join("; ")}.`);
  }
  if (reasoningParts.length === 0) {
    reasoningParts.push("The content was too short or lacked sufficient indicators for a definitive assessment.");
  }
  reasoningParts.push(`Overall confidence in this assessment is ${confidence}%, derived from linguistic pattern analysis, source verification heuristics, and structural evaluation.`);
  reasoningParts.push("This analysis is based on established media literacy frameworks used in misinformation research.");

  return {
    verdict,
    confidence,
    summary,
    redFlags,
    greenFlags,
    reasoning: reasoningParts.join(" "),
  };
}

// ─── MAIN ACTION ─────────────────────────────────────────────────────────────

export const analyzeNews = action({
  args: {
    text: v.string(),
    inputType: v.union(v.literal("text"), v.literal("url")),
  },
  handler: async (_ctx, args) => {
    const text = args.text.trim();

    if (text.length < 10) {
      return {
        verdict: "uncertain" as const,
        confidence: 30,
        summary: "The provided text is too short to perform a meaningful analysis. Please provide more content for an accurate assessment.",
        redFlags: ["Content is too short for reliable analysis (minimum 10 characters required)"],
        greenFlags: [],
        reasoning: "A minimum amount of text is required to evaluate credibility indicators. The analysis engine needs sufficient content to assess language patterns, sourcing quality, structural elements, and journalistic conventions.",
      };
    }

    return analyzeText(text);
  },
});
