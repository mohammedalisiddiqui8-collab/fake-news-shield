"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ─── Local NLP-based Fake News Detection Engine ───────────────────────────────
// No external API required. Uses linguistic pattern analysis,
// sentiment scoring, and heuristic rules to detect misinformation.

const SENSATIONALIST_WORDS = [
  "urgent", "breaking", "shocking", "exposed", "miracle", "secret",
  "hidden", "cover-up", "conspiracy", "mainstream media won't", "they don't want you to know",
  "before they delete", "share before", "wake up", "open your eyes",
  "banned", "censored", "silenced", "suppressed", "truth about",
  "what they're hiding", "you won't believe", "incredible", "unbelievable",
  "mind-blowing", "explosive", "bombshell", "devastating truth",
];

const CAPS_EXCLAMATION_PATTERN = /[A-Z]{3,}|!{2,}/g;
const CLICKBAIT_PATTERNS = [
  /you won'?t believe/i,
  /doctors (don'?t|hate)/i,
  /one (trick|simple|weird)/i,
  /this (one|simple|weird)/i,
  /number \d+ will (shock|amaze)/i,
  /what happens (next|when)/i,
  /gone wrong/i,
  /99% (of|don'?t)/i,
  /before it'?s (too late|deleted)/i,
  /share (this|before|now)/i,
];

const ANONYMOUS_SOURCING = [
  /experts? (say|claim|believe|warn|say)/i,
  /studies (show|reveal|suggest|prove)/i,
  /scientists (say|warn|discover|reveal)/i,
  /insiders? (reveal|say|claim)/i,
  /sources? (say|claim|reveal)/i,
  /researchers? (say|warn|find)/i,
  /a (senior|top|high-ranking|unnamed)/i,
  /anonymous (source|insider|official)/i,
  /people (are saying|say|claim)/i,
  /everyone is (saying|talking)/i,
];

const FEAR_MONGERING = [
  /they (are|want|plan|will) to/i,
  /the (government|elite|powerful|rich)/i,
  /big (pharma|tech|media|tobacco)/i,
  /deep state/i,
  /new world order/i,
  /mind control/i,
  /poisoning/i,
  /chemical/i,
  /depopulation/i,
  /end times/i,
  /apocalypse/i,
  /doom/i,
];

const CONSPIRACY_LANGUAGE = [
  /cover[- ]?up/i,
  /conspiracy/i,
  /wake up/i,
  /open your eyes/i,
  /do your research/i,
  /sheeple/i,
  /fake news/i,
  /lamestream/i,
  /deep state/i,
  /globalist/i,
  /illuminati/i,
  /mainstream media/i,
  /the truth they/i,
];

const REAL_NEWS_INDICATORS = [
  /according to (?:the |a )/i,
  /published (?:in|on|by)/i,
  /study (?:published|found|conducted)/i,
  /data (?:from|shows|indicates)/i,
  /officials? (?:said|stated|confirmed|announced)/i,
  /in a statement/i,
  /spokesperson/i,
  /CEO|CTO|CFO|president|director|minister|secretary/i,
  /on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /january|february|march|april|may|june|july|august|september|october|november|december/i,
  /the (?:report|study|analysis|survey|poll)/i,
  /percent|%|\d+/,
  /university|institute|journal|gazette|tribune|times|post|guardian|reuters|ap |bbc/i,
  /press conference/i,
  /official (?:data|report|statement)/i,
];

const CREDIBLE_SOURCES = [
  /reuters/i, /ap news/i, /associated press/i, /bbc/i, /bbc news/i,
  /the new york times/i, /the washington post/i, /the guardian/i,
  /cnn/i, /nbc/i, /cbs/i, /abc news/i, /npr/i,
  /nature/i, /science/i, /the lancet/i, /journal of/i,
  /university of/i, /institute/i, /federal reserve/i,
  /world health organization/i, /who/i, /nasa/i,
  /peer[- ]?reviewed/i, /peer reviewed/i,
  /peer-reviewed/i,
];

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length ?? 0);
  }, 0);
}

function analyzeText(text: string) {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;

  let redFlagScore = 0;
  let greenFlagScore = 0;
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  // ─── RED FLAG ANALYSIS ─────────────────────────────────────────────

  // 1. Sensationalist language
  const sensationalCount = countMatches(text, SENSATIONALIST_WORDS.map((w) => new RegExp(w, "gi")));
  if (sensationalCount >= 3) {
    redFlagScore += 25;
    redFlags.push(`Highly sensationalist language detected (${sensationalCount} instances)`);
  } else if (sensationalCount >= 1) {
    redFlagScore += 10;
    redFlags.push(`Sensationalist language detected (${sensationalCount} instances)`);
  }

  // 2. Excessive caps and exclamation marks
  const capsMatches = text.match(CAPS_EXCLAMATION_PATTERN);
  const capsCount = capsMatches?.length ?? 0;
  if (capsCount >= 5) {
    redFlagScore += 20;
    redFlags.push("Excessive use of capital letters and exclamation marks");
  } else if (capsCount >= 2) {
    redFlagScore += 8;
    redFlags.push("Some excessive capitalization or exclamation marks");
  }

  // 3. Clickbait patterns
  const clickbaitCount = countMatches(text, CLICKBAIT_PATTERNS);
  if (clickbaitCount >= 2) {
    redFlagScore += 20;
    redFlags.push("Multiple clickbait patterns detected");
  } else if (clickbaitCount >= 1) {
    redFlagScore += 10;
    redFlags.push("Clickbait pattern detected");
  }

  // 4. Anonymous sourcing
  const anonymousCount = countMatches(text, ANONYMOUS_SOURCING);
  if (anonymousCount >= 3) {
    redFlagScore += 20;
    redFlags.push("Heavy reliance on anonymous or vague sourcing");
  } else if (anonymousCount >= 1) {
    redFlagScore += 10;
    redFlags.push("Some anonymous or vague sourcing detected");
  }

  // 5. Fear-mongering
  const fearCount = countMatches(text, FEAR_MONGERING);
  if (fearCount >= 3) {
    redFlagScore += 20;
    redFlags.push("Fear-mongering and alarmist language detected");
  } else if (fearCount >= 1) {
    redFlagScore += 8;
    redFlags.push("Some alarmist language detected");
  }

  // 6. Conspiracy language
  const conspiracyCount = countMatches(text, CONSPIRACY_LANGUAGE);
  if (conspiracyCount >= 2) {
    redFlagScore += 25;
    redFlags.push("Conspiracy theory language detected");
  } else if (conspiracyCount >= 1) {
    redFlagScore += 12;
    redFlags.push("Some conspiracy-themed language detected");
  }

  // 7. Lack of specific sources (no URLs, no named sources)
  const hasUrl = /https?:\/\/|www\./i.test(text);
  if (!hasUrl && wordCount > 30) {
    redFlagScore += 5;
  }

  // 8. Unusually short for a news article
  if (wordCount < 30 && wordCount > 5) {
    redFlagScore += 5;
  }

  // 9. Emoji usage (uncommon in professional journalism)
  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu))?.length ?? 0;
  if (emojiCount >= 2) {
    redFlagScore += 10;
    redFlags.push("Excessive emoji usage (uncommon in credible journalism)");
  }

  // 10. Very short sentences with no substance
  if (sentenceCount > 0) {
    const avgSentenceLength = wordCount / sentenceCount;
    if (avgSentenceLength < 5 && sentenceCount > 3) {
      redFlagScore += 10;
      redFlags.push("Sentences are unusually short and lack substance");
    }
  }

  // ─── GREEN FLAG ANALYSIS ───────────────────────────────────────────

  // 1. Named sources
  const namedSourceCount = countMatches(text, [
    /according to [A-Z][a-z]+/i,
    /[A-Z][a-z]+ said/i,
    /[A-Z][a-z]+,? (the |a )?(professor|researcher|director|minister|official|scientist|analyst|CEO|president)/i,
    /said [A-Z][a-z]+/i,
    /stated [A-Z][a-z]+/i,
  ]);
  if (namedSourceCount >= 3) {
    greenFlagScore += 20;
    greenFlags.push("Multiple named sources and attributions");
  } else if (namedSourceCount >= 1) {
    greenFlagScore += 10;
    greenFlags.push("Named sources and attributions present");
  }

  // 2. Specific data/statistics
  const hasStats = /\d+%|\d+ percent|\d+ \d+|\$[\d,]+|\d+ million|\d+ billion|\d+ thousand/i.test(text);
  if (hasStats) {
    greenFlagScore += 15;
    greenFlags.push("Specific statistics and data points cited");
  }

  // 3. Credible sources mentioned
  const credibleSourceCount = countMatches(text, CREDIBLE_SOURCES);
  if (credibleSourceCount >= 2) {
    greenFlagScore += 20;
    greenFlags.push("References to credible news organizations or institutions");
  } else if (credibleSourceCount >= 1) {
    greenFlagScore += 10;
    greenFlags.push("Reference to a credible source");
  }

  // 4. Dates and temporal specificity
  const hasDate = /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text);
  if (hasDate) {
    greenFlagScore += 12;
    greenFlags.push("Specific dates and temporal references provided");
  }

  // 5. Balanced language (not one-sided)
  const hasOnTheOtherHand = /on the other hand|however|conversely|in contrast|critics (say|argue|claim|point out)|opponents|supporters/i.test(text);
  if (hasOnTheOtherHand) {
    greenFlagScore += 15;
    greenFlags.push("Balanced reporting with multiple perspectives");
  }

  // 6. Journalistic structure (who, what, where, when, why)
  const hasWho = /\b(?:who|whom|whose)\b/i.test(text);
  const hasWhat = /\b(?:what|which)\b/i.test(text);
  const hasWhere = /\b(?:where)\b/i.test(text);
  const hasWhen = /\b(?:when|while|during|after|before)\b/i.test(text);
  const hasWhy = /\b(?:why|because|since|due to|as a result)\b/i.test(text);
  const structureCount = [hasWho, hasWhat, hasWhere, hasWhen, hasWhy].filter(Boolean).length;
  if (structureCount >= 4) {
    greenFlagScore += 15;
    greenFlags.push("Follows journalistic structure (who, what, where, when, why)");
  } else if (structureCount >= 3) {
    greenFlagScore += 8;
    greenFlags.push("Partial journalistic structure present");
  }

  // 7. Measured/neutral tone
  const emotionalWords = countMatches(text, [
    /amazing/i, /terrible/i, /horrible/i, /wonderful/i, /awful/i,
    /disgusting/i, /incredible/i, /unbelievable/i, /outrage/i,
    /furious/i, /devastating/i, /mind[- ]?blowing/i,
  ]);
  if (emotionalWords === 0 && wordCount > 30) {
    greenFlagScore += 10;
    greenFlags.push("Neutral and measured tone throughout");
  }

  // 8. Proper length
  if (wordCount >= 80 && wordCount <= 800) {
    greenFlagScore += 5;
    greenFlags.push("Appropriate article length");
  }

  // ─── CALCULATE VERDICT ─────────────────────────────────────────────

  const totalScore = redFlagScore + greenFlagScore;
  const redRatio = totalScore > 0 ? redFlagScore / totalScore : 0.5;
  const greenRatio = totalScore > 0 ? greenFlagScore / totalScore : 0.5;

  let verdict: "likely_real" | "likely_fake" | "uncertain";
  let confidence: number;

  if (redRatio > 0.6) {
    verdict = "likely_fake";
    confidence = Math.min(95, Math.round(50 + redRatio * 45));
  } else if (greenRatio > 0.6) {
    verdict = "likely_real";
    confidence = Math.min(95, Math.round(50 + greenRatio * 45));
  } else if (redRatio > 0.45 || greenRatio > 0.45) {
    // Slight lean
    if (redRatio > greenRatio) {
      verdict = "likely_fake";
      confidence = Math.round(40 + (redRatio - greenRatio) * 30);
    } else {
      verdict = "likely_real";
      confidence = Math.round(40 + (greenRatio - redRatio) * 30);
    }
    confidence = Math.min(75, confidence);
  } else {
    verdict = "uncertain";
    confidence = Math.round(30 + Math.abs(redRatio - greenRatio) * 20);
  }

  // Ensure minimum confidence
  confidence = Math.max(35, Math.min(95, confidence));

  // Generate summary
  let summary: string;
  if (verdict === "likely_fake") {
    summary = `This content shows ${redFlags.length} red flag indicator${redFlags.length !== 1 ? "s" : ""} suggesting it may be unreliable. ${redFlags[0] ?? "The language and sourcing raise concerns."} Exercise caution before sharing.`;
  } else if (verdict === "likely_real") {
    summary = `This content shows ${greenFlags.length} positive indicator${greenFlags.length !== 1 ? "s" : ""} consistent with credible journalism. ${greenFlags[0] ?? "The sourcing and structure appear legitimate."} However, always cross-reference important claims.`;
  } else {
    summary = `This content has a mix of credible and questionable elements. While some aspects suggest legitimate reporting, other indicators raise concerns. Verify claims through independent sources.`;
  }

  // Generate reasoning
  let reasoning: string;
  const parts: string[] = [];

  if (redFlags.length > 0) {
    parts.push(`The analysis identified ${redFlags.length} concern${redFlags.length !== 1 ? "s" : ""} including ${redFlags.slice(0, 2).map((f) => f.toLowerCase()).join(" and ")}.`);
  }
  if (greenFlags.length > 0) {
    parts.push(`${greenFlags.length} positive indicator${greenFlags.length !== 1 ? "s" : ""} were found, notably ${greenFlags.slice(0, 2).map((f) => f.toLowerCase()).join(" and ")}.`);
  }
  if (parts.length === 0) {
    parts.push("The content was too short or lacked sufficient indicators for a definitive assessment.");
  }
  parts.push(`Overall confidence in this assessment is ${confidence}% based on linguistic pattern analysis, source verification heuristics, and structural evaluation.`);
  reasoning = parts.join(" ");

  return {
    verdict,
    confidence,
    summary,
    redFlags,
    greenFlags,
    reasoning,
  };
}

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
        summary: "The provided text is too short to perform a meaningful analysis. Please provide more content.",
        redFlags: ["Content is too short for reliable analysis"],
        greenFlags: [],
        reasoning: "A minimum amount of text is required to evaluate credibility indicators. The analysis engine needs sufficient content to assess language patterns, sourcing, and structural elements.",
      };
    }

    return analyzeText(text);
  },
});
