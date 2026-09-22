"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════════════════
// Veritas Fake News Detection Engine v5
// NLP-based linguistic pattern analysis.
// Honest about its limitations: analyzes writing patterns, not external facts.
// No fabricated sources, no fake evidence, no inflated confidence.
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

// ─── CLAIM EXTRACTION ──────────────────────────────────────────────────────
// Extracts factual claims from text using sentence-level analysis.
// Each claim status reflects linguistic evidence, not external verification.

function extractClaims(
  text: string,
  redFlags: string[],
  greenFlags: string[],
  _confidence: number,
  _keywords: string[],
) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const claims: Array<{
    id: number; text: string;
    status: "supported" | "uncertain" | "contradicted" | "needs_verification";
    confidence: number; evidence: string;
    sources: string[]; contradictingSources: string[];
    explanation: string;
  }> = [];

  const factualPatterns = [
    /\d+%/, /\$[\d,]+/, /\d+ (million|billion|thousand)/i,
    /according to/i, /study (found|showed|revealed|published)/i,
    /researchers? (found|discovered|confirmed|published)/i,
    /officials? (said|stated|announced|confirmed)/i,
    /university of/i, /institute/i, /published in/i,
  ];

  let claimId = 1;
  for (const sentence of sentences) {
    if (claimId > 8) break;
    const isFactual = factualPatterns.some(p => p.test(sentence));
    if (!isFactual && claims.length >= 3) continue;
    if (!isFactual && claims.length < 3 && sentence.split(/\s+/).length < 8) continue;

    const hasNumbers = /\d+%|\$[\d,]+|\d+ (million|billion)/i.test(sentence);
    const hasSource = /according to|published|researchers|officials|university/i.test(sentence);
    const hasSensational = /[A-Z]{3,}!|shocking|unbelievable|secret|hidden|exposed/i.test(sentence);
    const hasAnonymous = /experts? (say|claim|warn)|sources? (say|claim)|insiders?/i.test(sentence);

    let status: "supported" | "uncertain" | "contradicted" | "needs_verification";
    let claimConf: number;
    let evidence: string;
    let explanation: string;

    if (hasSource && hasNumbers && !hasSensational) {
      status = "supported";
      claimConf = 65;
      evidence = "Claim contains named source attribution AND specific numerical data — the strongest linguistic signal available without external verification.";
      explanation = "This claim references specific sources and provides verifiable data points. However, Veritas has not independently verified these references.";
    } else if (hasAnonymous || hasSensational) {
      status = "contradicted";
      claimConf = 30;
      evidence = "Claim relies on anonymous sourcing or sensationalist language patterns, which are commonly associated with unreliable reporting.";
      explanation = "The language patterns in this claim are inconsistent with standard journalistic practices. This is a linguistic signal, not a factual determination.";
    } else if (hasNumbers) {
      status = "uncertain";
      claimConf = 45;
      evidence = "Contains numerical claims but no named source attribution. Numbers alone cannot be verified through linguistic analysis.";
      explanation = "Specific numbers are cited, but the underlying source cannot be confirmed through pattern analysis alone.";
    } else {
      status = "needs_verification";
      claimConf = 35;
      evidence = "Insufficient linguistic signals to assess this claim. External verification is required.";
      explanation = "This claim requires independent fact-checking beyond what linguistic pattern analysis can provide.";
    }

    // Adjust confidence based on overall article signals
    if (redFlags.length > 3) claimConf = Math.max(15, claimConf - 10);
    if (greenFlags.length > 3) claimConf = Math.min(70, claimConf + 5);

    const sources: string[] = [];
    if (hasSource) sources.push("Named source detected in text");
    if (hasNumbers) sources.push("Numerical data present");

    const contradictingSources: string[] = [];
    if (hasAnonymous) contradictingSources.push("Anonymous/unverifiable sourcing pattern");
    if (hasSensational) contradictingSources.push("Sensationalist language pattern");

    claims.push({
      id: claimId++,
      text: sentence.length > 120 ? sentence.slice(0, 120) + "..." : sentence,
      status,
      confidence: claimConf,
      evidence,
      sources,
      contradictingSources,
      explanation,
    });
  }

  return claims;
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
  const sourceType = isResearch ? "Research" : isGov ? "Government" : isNews ? "News" : "Other";

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

// ─── EVIDENCE TIMELINE EXTRACTION ───────────────────────────────────────────
// Timeline reflects ACTUAL analysis steps performed, not fabricated events.

function extractTimeline(
  text: string,
  redFlags: string[],
  greenFlags: string[],
  _keywords: string[],
  verdict: string,
  confidence: number,
  claims: Array<{ status: string }>,
  sourceProfile: { source: string },
) {
  const events: Array<{
    id: number;
    type: "claim_identified" | "source_searched" | "corroboration" | "contradiction" | "assessment";
    title: string; detail: string; source?: string;
  }> = [];

  let eventId = 1;

  // Event 1: Text received and processed
  events.push({
    id: eventId++, type: "claim_identified",
    title: "Text received and processed",
    detail: text.split(/\s+/).length + " words analyzed through linguistic pattern matching.",
  });

  // Event 2: Claims extracted
  events.push({
    id: eventId++, type: "claim_identified",
    title: claims.length + " claims extracted",
    detail: "Factual claims identified using sentence-level NLP pattern detection.",
  });

  // Event 3: Source search
  if (sourceProfile.source !== "NOT AVAILABLE") {
    events.push({
      id: eventId++, type: "source_searched",
      title: "Source attribution detected",
      detail: "The text mentions a named source: " + sourceProfile.source + ". This is text detection, not independent verification.",
    });
  } else {
    events.push({
      id: eventId++, type: "source_searched",
      title: "No named source detected",
      detail: "No specific source, author, or institution was identified in the text.",
    });
  }

  // Event 4: Linguistic signals
  const signalCount = greenFlags.length + redFlags.length;
  if (greenFlags.length > 0 && redFlags.length > 0) {
    events.push({
      id: eventId++, type: "corroboration",
      title: "Mixed linguistic signals",
      detail: greenFlags.length + " positive and " + redFlags.length + " negative linguistic patterns detected.",
    });
  } else if (greenFlags.length > 0) {
    events.push({
      id: eventId++, type: "corroboration",
      title: "Positive linguistic signals",
      detail: greenFlags.length + " indicators consistent with credible reporting: " + greenFlags.slice(0, 2).join("; ") + ".",
    });
  } else if (redFlags.length > 0) {
    events.push({
      id: eventId++, type: "contradiction",
      title: "Negative linguistic signals",
      detail: redFlags.length + " indicators of potential unreliability: " + redFlags.slice(0, 2).join("; ") + ".",
    });
  }

  // Event 5: Assessment
  const supported = claims.filter(c => c.status === "supported").length;
  const contradicted = claims.filter(c => c.status === "contradicted").length;
  events.push({
    id: eventId++, type: "assessment",
    title: "Linguistic pattern assessment complete",
    detail: "Confidence: " + confidence + "%. " + supported + " claims linguistically supported, " + contradicted + " contradicted. NOTE: This is pattern-based analysis, not external fact-checking.",
  });

  return events;
}

// ─── ANALYSIS ───────────────────────────────────────────────────────────────

function analyzeText(text: string) {
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

  // ── VERDICT ──
  const total = Math.max(redFlagScore + greenFlagScore, 1);
  const redRatio = redFlagScore / total, greenRatio = greenFlagScore / total;
  let verdict: "likely_real" | "likely_fake" | "uncertain";
  let confidence: number;

  if (redRatio >= 0.65) { verdict = "likely_fake"; confidence = Math.min(72, Math.round(45 + redRatio * 30)); }
  else if (greenRatio >= 0.65) { verdict = "likely_real"; confidence = Math.min(72, Math.round(45 + greenRatio * 30)); }
  else if (redRatio > greenRatio + 0.1) { verdict = "likely_fake"; confidence = Math.min(65, Math.round(38 + (redRatio - greenRatio) * 28)); }
  else if (greenRatio > redRatio + 0.1) { verdict = "likely_real"; confidence = Math.min(65, Math.round(38 + (greenRatio - redRatio) * 28)); }
  else { verdict = "uncertain"; confidence = Math.round(30 + Math.abs(redRatio - greenRatio) * 12); }
  confidence = Math.max(25, Math.min(72, confidence));

  // ── ADJUSTED CONFIDENCE ──
  // Reduce confidence when evidence is thin
  const hasSource = /according to|published|researchers|officials|university/i.test(text);
  const hasCredibleInstitution = credCount >= 2;
  if (!hasSource && !hasCredibleInstitution) {
    confidence = Math.max(25, confidence - 15);
  }
  if (redFlags.length === 0 && greenFlags.length === 0) {
    confidence = Math.max(25, confidence - 10);
  }

  const triggeredKeywords = findTriggeredKeywords(text);

  // ── HONEST SUMMARY ──
  const signalLabel = "linguistic pattern analysis";
  const summary = verdict === "likely_fake"
    ? "Based on " + signalLabel + ", this content shows " + redFlags.length + " warning signals. " + (redFlags[0] || "Language patterns suggest caution.") + " NOTE: This analysis examines writing patterns, not factual accuracy. Independent verification is recommended."
    : verdict === "likely_real"
    ? "Based on " + signalLabel + ", this content shows " + greenFlags.length + " indicators consistent with credible reporting. " + (greenFlags[0] || "Attribution patterns appear standard.") + " NOTE: This analysis examines writing patterns, not factual accuracy. Independent verification is recommended."
    : "Mixed linguistic signals: " + redFlags.length + " concerns, " + greenFlags.length + " positives. The analysis cannot determine reliability from patterns alone. Independent verification is strongly recommended.";

  const parts: string[] = [];
  if (redFlags.length) parts.push("Concerns: " + redFlags.slice(0, 3).join("; ") + ".");
  if (greenFlags.length) parts.push("Positives: " + greenFlags.slice(0, 3).join("; ") + ".");
  parts.push("Confidence: " + confidence + "% — based on " + signalLabel + " only. Veritas cannot independently verify factual claims without access to external sources.");

  // ── CLAIM EXTRACTION ──
  const claims = extractClaims(text, redFlags, greenFlags, confidence, triggeredKeywords);

  // ── SOURCE PROFILE ──
  const sourceProfile = extractSourceProfile(text, greenFlags, redFlags);

  // ── EVIDENCE TIMELINE ──
  const evidenceTimeline = extractTimeline(text, redFlags, greenFlags, triggeredKeywords, verdict, confidence, claims, sourceProfile);

  // ── ARTICLE FINGERPRINT ──
  // All derived from the same base analysis — single source of truth
  const supportedCount = claims.filter(c => c.status === "supported").length;
  const uncertainCount = claims.filter(c => c.status === "uncertain").length;
  const contradictedCount = claims.filter(c => c.status === "contradicted").length;
  const unverifiedCount = claims.filter(c => c.status === "needs_verification").length;

  // "Sources" = unique named institutions/sources mentioned in text (NOT external sources retrieved)
  const sourcesMentioned = new Set<string>();
  if (sourceProfile.source !== "NOT AVAILABLE") sourcesMentioned.add(sourceProfile.source);
  CREDIBLE_SOURCES.forEach(p => { if (p.test(text)) { const m = text.match(p); if (m) sourcesMentioned.add(m[0]); } });

  // Evidence count = total signal detections across claims
  const evidenceFound = claims.reduce((sum, c) => sum + c.sources.length + c.contradictingSources.length, 0) + redFlags.length + greenFlags.length;

  const fingerprint = {
    claims: claims.length,
    sources: sourcesMentioned.size,
    verified: supportedCount,
    uncertain: uncertainCount,
    contradicted: contradictedCount,
    unverified: unverifiedCount,
    sourceCoverage: claims.length > 0 ? Math.round((supportedCount / claims.length) * 100) : 0,
    evidenceFound,
  };

  // ── SOURCE CROSS-CHECK ──
  // Honest: only shows what was actually detected in the text.
  // Does NOT fabricate independent external sources.
  const crossCheck = claims.slice(0, 5).map((claim) => {
    const sources: Array<{ name: string; headline: string; date: string; excerpt: string; relationship: "supports" | "contradicts" | "partial" | "insufficient" }> = [];

    // Show what the text itself contains about this claim
    if (claim.sources.length > 0) {
      sources.push({
        name: "Text analysis",
        headline: "Linguistic signal detected",
        date: "Current analysis",
        excerpt: claim.evidence,
        relationship: "supports",
      });
    }
    if (claim.contradictingSources.length > 0) {
      sources.push({
        name: "Pattern analysis",
        headline: "Conflicting signal detected",
        date: "Current analysis",
        excerpt: claim.contradictingSources.join("; "),
        relationship: "contradicts",
      });
    }

    // If we have no signals at all
    if (sources.length === 0) {
      sources.push({
        name: "No signal",
        headline: "Insufficient linguistic evidence",
        date: "N/A",
        excerpt: "No strong linguistic signals were detected for this claim. Independent verification is required.",
        relationship: "insufficient",
      });
    }

    return { claimId: claim.id, claimText: claim.text, sources };
  });

  // ── FRAMING SIGNALS ──
  const framingSignals: Array<{ type: string; description: string; severity: "low" | "medium" | "high" }> = [];
  const capsMatch = text.match(/[A-Z]{4,}[!]{1,}/g);
  if (capsMatch && capsMatch.length > 0) {
    framingSignals.push({ type: "EXCESSIVE CAPS", description: "Contains " + capsMatch.length + " ALL CAPS phrases/exclamations — uncommon in professional journalism.", severity: "high" });
  }
  const emotionalWords = text.match(/\b(shocking|outrage|terrifying|heartbreaking|unbelievable|miraculous|disgusting|horrible|amazing|incredible)\b/gi);
  if (emotionalWords && emotionalWords.length >= 2) {
    const wordList = [...new Set(emotionalWords)].slice(0, 3).join(", ");
    const count = emotionalWords.length;
    framingSignals.push({ type: "EMOTIONALLY LOADED WORDING", description: "Contains " + count + " emotionally charged words: " + wordList + ".", severity: "medium" });
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

  // ── INFORMATION FRESHNESS ──
  const freshness = claims.slice(0, 5).map((claim) => {
    const hasTemporal = /\b(currently|today|this week|this month|this year|recently|yesterday|last week|last month)\b/i.test(claim.text);
    const hasHistorical = /\b(history|historical|ancient|centuries ago|in the past|traditionally)\b/i.test(claim.text);
    const hasDate = /\d{4}|\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(claim.text);
    let status: "current" | "recent" | "outdated" | "historical";
    if (hasHistorical) status = "historical";
    else if (hasTemporal) status = "current";
    else if (hasDate) status = "recent";
    else status = "recent";
    return {
      claimId: claim.id,
      claimText: claim.text.slice(0, 80),
      status,
      sourceDate: sourceProfile.publishedDate,
      ageDays: hasDate ? -1 : 30,
      newerAvailable: false,
    };
  });

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
    freshness,
  };
}

export const analyzeNews = action({
  args: { text: v.string(), inputType: v.union(v.literal("text"), v.literal("url")) },
  handler: async (_ctx, args) => {
    if (args.text.trim().length < 10) {
      return {
        verdict: "uncertain" as const, confidence: 25,
        summary: "Text too short for meaningful analysis. At least 10 characters are required.",
        redFlags: ["Insufficient text"], greenFlags: [],
        reasoning: "Minimum content required for linguistic pattern analysis.",
        triggeredKeywords: [], categoryBreakdown: [], wordCount: args.text.trim().split(/\s+/).length,
        claims: [],
        sourceProfile: { source: "NOT AVAILABLE", domain: "NOT AVAILABLE", author: "NOT AVAILABLE", publishedDate: "NOT AVAILABLE", updatedDate: "NOT AVAILABLE", sourceType: "Other", availableEvidence: ["Insufficient text for source extraction"], signals: [] },
        evidenceTimeline: [],
        fingerprint: { claims: 0, sources: 0, verified: 0, uncertain: 0, contradicted: 0, unverified: 0, sourceCoverage: 0, evidenceFound: 0 },
        crossCheck: [],
        framingSignals: [],
        freshness: [],
      };
    }
    return analyzeText(args.text.trim());
  },
});
