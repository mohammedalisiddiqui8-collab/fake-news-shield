// All required diagrams, light professional style. PDF y grows upward from the page bottom.
export function drawERfull(doc, D) {
  const { box, label, arrow, FILL, FILL2 } = D;
  doc.h2("5.2", "ER Diagram");
  doc.para("One completed investigation is stored as one document. The diagram shows the entities inside that document and how they relate. Cardinalities: an investigation has zero or more claims; a claim may be cross-checked against zero or more retrieved sources; a (claim, source) pair with a retrieved URL constitutes an evidence reference. The assessment and the fingerprint are derived summaries of the claims and the cross-check, not independent inputs. Sentinel notices (for example NO INDEPENDENT CORROBORATION FOUND) carry no URL and never become sources.");
  doc.spacer(8);
  const cx = 297;
  const bw = 130, bh = 46;
  box(cx - bw / 2, 560, bw, bh, "INVESTIGATION\n(userId, inputText, inputType,\nverdict, confidence, createdAt)", { fill: FILL2, size: 7.0, lh: 9.0 });
  box(cx - 235, 430, 150, 52, "CLAIM\n(id, text, status, confidence,\nevidence, explanation,\nsources[], contradictingSources[])", { fill: FILL, size: 6.8, lh: 8.8 });
  box(cx + 85, 430, 150, 52, "SOURCE\n(name, headline, date, excerpt,\nrelationship, url?)", { fill: FILL, size: 6.8, lh: 8.8 });
  box(cx - bw / 2 - 10, 300, bw + 20, 46, "EVIDENCE REFERENCE\n(claimId x source)", { fill: FILL, size: 7.0, lh: 9.0 });
  box(cx - 235, 175, 150, 46, "ASSESSMENT\n(summary, reasoning,\nredFlags[], greenFlags[])", { fill: FILL, size: 6.8, lh: 8.8 });
  box(cx + 85, 175, 150, 46, "FINGERPRINT\n(claims, sources, sourceRefs,\nsourceCoverage, verified,\nuncertain, contradicted, unverified)", { fill: FILL, size: 6.6, lh: 8.4 });
  box(cx - bw / 2 - 10, 80, bw + 20, 30, "TIMELINE / FRESHNESS / FRAMING (annotating observations)", { size: 6.6 });
  arrow(cx - 40, 560, cx - 180, 484, { label: "1 : N extracts" });
  arrow(cx + 40, 560, cx + 180, 484, { label: "via crossCheck 1 : N" });
  arrow(cx - 150, 430, cx - 50, 348, { label: "yields" });
  arrow(cx + 150, 430, cx + 50, 348, { label: "becomes part of" });
  arrow(cx - 40, 300, cx - 160, 223, { label: "summarised by" });
  arrow(cx + 40, 300, cx + 160, 223, { label: "counted in" });
  arrow(cx, 300, cx, 112, { label: "annotated by" });
  doc.caption("Figure 5.1 - ER diagram of the investigation data model (one analyses document).");
  doc.h2end();
}

export function drawDFD0(doc, D) {
  const { box, label, arrow, FILL, FILL2 } = D;
  doc.h2("5.3", "Data Flow Diagram - Level 0 (Context)");
  doc.spacer(10);
  box(232, 420, 130, 40, "0\nVERITAS\nAnalysis Engine", { fill: FILL2, size: 8.0, lh: 10 });
  box(60, 500, 110, 26, "USER", { fill: FILL, size: 7.8 });
  box(60, 340, 110, 26, "USER (report)", { fill: FILL, size: 7.8 });
  box(430, 500, 105, 26, "PUBLISHER SITE", { fill: FILL, size: 7.8 });
  box(430, 340, 105, 26, "WEB SEARCH", { fill: FILL, size: 7.8 });
  box(430, 420, 105, 26, "CONVEX DB", { fill: FILL, size: 7.8 });
  arrow(170, 513, 260, 460, { label: "URL / article text" });
  arrow(260, 424, 170, 353, { label: "report / failure" });
  arrow(348, 452, 430, 513, { label: "fetch request" });
  arrow(430, 500, 348, 445, { label: "page HTML" });
  arrow(348, 428, 430, 428, { label: "case file" });
  arrow(348, 440, 430, 348, { label: "per-claim queries" });
  arrow(430, 340 + 24, 348, 435, { label: "results", dashed: true });
  doc.caption("Figure 5.2 - Context diagram: the engine as one process talking to the user, the publisher, the search service and the database.");
  doc.h2end();
}

export function drawDFD1(doc, D) {
  const { box, label, arrow, FILL, FILL2 } = D;
  doc.h2("5.4", "Data Flow Diagram - Level 1");
  doc.para("Level 1 expands the engine into its internal processes. The data store (the analyses table) is written once, at the very end of the pipeline; nothing is read back mid-investigation, which keeps a run deterministic and replayable in the Trace view.");
  doc.spacer(8);
  const pw = 96, ph = 30;
  box(60, 470, pw, ph, "1.0 Validate\n& classify input", { fill: FILL, size: 7.2 });
  box(210, 470, pw, ph, "2.0 Retrieve\narticle text", { fill: FILL, size: 7.2 });
  box(360, 470, pw, ph, "3.0 Clean &\nisolate body", { fill: FILL, size: 7.2 });
  box(150, 330, pw, ph, "4.0 Extract\nclaims", { fill: FILL, size: 7.2 });
  box(320, 330, pw, ph, "5.0 Evidence search\n& cross-check", { fill: FILL, size: 7.2 });
  box(230, 190, 120, 34, "6.0 Assess (verdict,\nconfidence, fingerprint)", { fill: FILL2, size: 7.0 });
  box(470, 420, 120, 24, "RETRIEVAL FAILURE\nstop, nothing stored", { size: 6.6 });
  arrow(60 + pw / 2, 500, 258, 470 + 14, {});
  arrow(306, 485, 360, 485, {});
  arrow(360 + pw / 2, 470, 198, 330 + 28, {});
  arrow(246, 330, 368, 330, {});
  arrow(222, 330, 250, 224, {});
  arrow(368, 330, 300, 224, {});
  arrow(360 + pw, 485, 470, 440, { label: "cannot fetch / not article", dashed: true });
  label(64, 206, "D1  analyses table (case file)", { size: 7.0 });
  arrow(260, 190, 150, 200, {});
  doc.caption("Figure 5.3 - Level-1 DFD showing the internal processes of one investigation.");
  doc.h2end();
}

export function drawClass(doc, D) {
  const { box, label, arrow, FILL, FILL2, INK } = D;
  doc.h2("5.5", "Class Diagram (logical modules)");
  doc.para("The implementation is functional TypeScript, so the diagram records logical modules and their main operations rather than an inheritance hierarchy. One deliberate separation is worth pointing out: the assessment module never receives a linguistic score as an input to the verdict rule, it receives claim statuses only. That is the code-level guarantee behind the claim that language signals can annotate but never decide a verdict.");
  doc.spacer(8);
  const colW = 176, bh = 54, gapY = 16;
  const rows = [
    ["AnalysisController", "analyzeNews action; input routing;\nends early on retrieval failure"],
    ["ArticleRetriever", "extractUrlCandidate; classifyUrl;\nfetchArticleText (8 s cap); metadata"],
    ["BodyCleaner", "extractArticleBody; widget removal;\nlegacy-tag fallback strip"],
    ["ClaimExtractor", "extractRawClaims; sentence splitting;\ncheckability filter; numbering"],
    ["LinguisticAnalyzer", "flag categories; weightedMatches;\nframingSignals (supplementary)"],
    ["EvidenceService", "searchClaim per claim; relationship\nlabels; sourceAuthority; follow-up"],
    ["AssessmentEngine", "status rules; verdict + confidence\ncaps; hard rules (overrides)"],
    ["ReportBuilder", "source stats via investigationStats;\nfingerprint, timeline, freshness;\npersist case file to analyses"],
  ];
  rows.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = col === 0 ? 62 : 306;
    const yy = 556 - row * (bh + gapY);
    box(x, yy + bh - 13, colW, 13, r[0], { fill: FILL2, size: 7.8 });
    const p = doc.cur.page;
    r[1].split("\n").forEach((ln, k) => label(x + 6, yy + bh - 25 - k * 9, ln, { size: 6.6 }));
    p.drawRectangle({ x, y: yy, width: colW, height: bh, borderColor: INK, borderWidth: 0.9 });
  });
  arrow(150, 556, 394, 556, { label: "uses" });
  arrow(394, 486, 238, 416, { label: "clean text" });
  arrow(394, 416, 238, 346, { label: "numbered claims" });
  arrow(238, 390, 306, 390, { label: "language signals (side channel)" });
  arrow(394, 346, 238, 276, { label: "evidence per claim" });
  arrow(238, 300, 306, 300, { label: "claim statuses" });
  doc.caption("Figure 5.4 - Class (logical-module) diagram of the analysis pipeline.");
  doc.h2end();
}

export function drawFlow(doc, D) {
  const { box, diamond, label, arrow, FILL2 } = D;
  doc.h2("5.6", "Flow Chart");
  doc.spacer(4);
  const cx = 200;
  const bw = 128, bh = 22;
  const steps = [
    ["START", 800],
    ["Input URL / pasted text", 764],
    ["Validate URL structure", 728],
    ["Retrieve article (8 s cap)", 692],
  ];
  steps.forEach(([t, y]) => {
    if (t === "START") box(cx - 40, y + 4, 80, 18, t, { fill: FILL2, size: 7.8 });
    else box(cx - bw / 2, y, bw, bh, t, { size: 7.6 });
  });
  for (let i = 0; i < steps.length - 1; i++) arrow(cx, steps[i][1], cx, steps[i + 1][1] + bh);
  arrow(cx, 692, cx, 666);
  diamond(cx, 646, 140, 40, "Retrieval\nsuccessful?", { size: 7.0 });
  box(cx + 130, 636, 140, 22, "RETRIEVAL FAILURE", { size: 7.4 });
  arrow(cx + 70, 646, cx + 130, 647, { label: "NO" });
  box(cx + 130, 594, 140, 22, "Report UNABLE TO ANALYZE", { size: 6.9 });
  arrow(cx + 200, 636, cx + 200, 616);
  box(cx + 130, 556, 140, 22, "END - no case file stored", { fill: FILL2, size: 7.0 });
  arrow(cx + 200, 594, cx + 200, 578);
  arrow(cx, 626, cx, 604, { label: "YES" });
  const chain = [
    ["Clean / isolate article body", 582],
    ["Extract numbered claims", 546],
    ["Search external evidence per claim", 510],
    ["Classify: supports / contradicts / partial", 474],
    ["Apply source-credibility + freshness weights", 438],
    ["Claim statuses to evidence-gated verdict", 402],
    ["Compute coverage / fingerprint / trace", 366],
    ["Persist case file (skipped on failure)", 330],
    ["END", 292],
  ];
  for (let i = 0; i < chain.length; i++) {
    const [t, y] = chain[i];
    if (t === "END") box(cx - 40, y, 80, 18, t, { fill: FILL2, size: 7.8 });
    else box(cx - bw / 2 - 10, y, bw + 20, bh - 6, t, { size: 7.0 });
    if (i === 0) arrow(cx, 604, cx, y + bh - 6);
    else arrow(cx, chain[i - 1][1], cx, y + bh - 6);
  }
  doc.caption("Figure 5.5 - Flow chart of one investigation, including the retrieval-failure stop.");
  doc.h2end();
}

export function drawActivity(doc, D) {
  const { box, label, arrow, FILL } = D;
  doc.h2("5.7", "Activity Diagram");
  doc.para("Swimlanes separate user actions from system work. After the hand-off the user waits; the whole pipeline runs without further input, and either a finished report or the failure state is returned.");
  doc.spacer(8);
  const xU = 140, xS = 420, laneW = 220;
  const p = doc.cur.page;
  p.drawRectangle({ x: xU - laneW / 2, y: 150, width: laneW, height: 570, color: FILL });
  p.drawRectangle({ x: xS - laneW / 2, y: 150, width: laneW, height: 570, color: FILL });
  label(xU, 712, "USER", { size: 9, font: "hb", align: "center" });
  label(xS, 712, "VERITAS SYSTEM", { size: 9, font: "hb", align: "center" });
  const steps = [
    [xU, 670, "Submit URL or article text"],
    [xS, 630, "Validate input, classify URL"],
    [xS, 590, "Retrieve page (8 s cap)"],
    [xS, 550, "Extract and clean article body"],
    [xS, 510, "Extract numbered claims"],
    [xS, 470, "Search external evidence"],
    [xS, 430, "Classify, cross-check, weigh"],
    [xS, 390, "Derive coverage and fingerprint"],
    [xS, 350, "Produce verdict + confidence"],
    [xU, 310, "Read report, replay Trace"],
    [xU, 270, "END"],
  ];
  for (let i = 0; i < steps.length; i++) {
    const [x, y, t] = steps[i];
    if (t === "END") box(x - 30, y, 60, 18, t, { size: 7.4 });
    else box(x - 90, y, 180, 22, t, { size: 7.2 });
    if (i > 0 && steps[i - 1][0] === x) arrow(x, steps[i - 1][1], x, y + 22);
  }
  arrow(xU + 90, 681, xS - 90, 641, { label: "hand-off" });
  arrow(xS - 90, 311, xU + 90, 311, { label: "report / failure returned", dashed: true });
  doc.caption("Figure 5.6 - Activity diagram with user and system swimlanes.");
  doc.h2end();
}

export function drawSequence(doc, D) {
  const { box, label, arrow, FILL, INK } = D;
  doc.h2("5.8", "Sequence Diagram");
  doc.spacer(4);
  const lanes = [["User", 70], ["Browser/UI", 168], ["Controller", 272], ["Retriever", 376], ["Claims", 452], ["Evidence", 528], ["Convex", 614], ["Assessment", 700]];
  const topY = 646, botY = 176;
  const p = doc.cur.page;
  for (const [name, x] of lanes) {
    box(x - 36, topY + 4, 72, 18, name, { fill: FILL, size: 6.8 });
    p.drawLine({ start: { x, y: topY + 2 }, end: { x, y: botY }, thickness: 0.6, dashArray: [4] });
  }
  const msg = (from, to, y, text, { dashed = false } = {}) => {
    const x1 = lanes.find((l) => l[0] === from)[1];
    const x2 = lanes.find((l) => l[0] === to)[1];
    const dir = Math.sign(x2 - x1) || 1;
    p.drawLine({ start: { x: x1, y }, end: { x: x2 - dir * 3, y }, thickness: 0.8, dashArray: dashed ? [3] : undefined });
    const hx = x2 - dir * 3;
    p.drawLine({ start: { x: hx, y }, end: { x: hx - dir * 6, y: y + 2.4 }, thickness: 0.8 });
    p.drawLine({ start: { x: hx, y }, end: { x: hx - dir * 6, y: y - 2.4 }, thickness: 0.8 });
    label((x1 + x2) / 2, y + 3.2, text, { size: 6.2, align: "center" });
  };
  msg("User", "Browser/UI", 634, "submit URL / pasted text");
  msg("Browser/UI", "Controller", 618, "analyzeNews action call");
  msg("Controller", "Retriever", 602, "fetchArticleText(url, 8 s cap)");
  msg("Retriever", "Controller", 587, "text + metadata, or failure object", { dashed: true });
  msg("Controller", "Claims", 571, "extractRawClaims(clean text)");
  msg("Claims", "Controller", 557, "numbered claims", { dashed: true });
  p.drawRectangle({ x: 478, y: 384, width: 214, height: 158, borderColor: INK, borderWidth: 0.8 });
  label(480, 540, "loop [each cross-checked claim]", { size: 6.4, font: "hb" });
  msg("Controller", "Evidence", 526, "searchClaim(claim)");
  msg("Evidence", "Controller", 511, "sources + relationships", { dashed: true });
  msg("Controller", "Evidence", 496, "follow-up search (asserting claims)");
  msg("Evidence", "Controller", 481, "correction / resolution evidence", { dashed: true });
  msg("Controller", "Controller", 460, "classify, apply weights, pair sources");
  msg("Controller", "Assessment", 430, "claim statuses");
  msg("Assessment", "Controller", 414, "verdict + confidence + reasoning", { dashed: true });
  msg("Controller", "Convex", 386, "persist case file (skipped on failure)");
  label(66, 268, "Failure path: the retriever returns a failure object instead of throwing;", { size: 6.8 });
  label(66, 256, "the controller reports UNABLE TO ANALYZE with confidence shown as a dash.", { size: 6.8 });
  label(66, 244, "No claims, evidence, verdict, fingerprint or database record are created.", { size: 6.8 });
  msg("Controller", "Browser/UI", 232, "reactive report update", { dashed: true });
  msg("Browser/UI", "User", 216, "report + Trace replay steps", { dashed: true });
  doc.caption("Figure 5.7 - Sequence diagram with the failure short-circuit marked explicitly.");
  doc.h2end();
}

export function drawComponents(doc, D) {
  const { box, label, arrow, FILL, FILL2 } = D;
  doc.h2("5.9", "Component Diagram");
  doc.para("Deployment view. Everything the user downloads is one static bundle; the backend is Convex; the analysis runs inside Convex actions which are the only components allowed to reach the publisher site and the search service.");
  doc.spacer(8);
  box(50, 480, 190, 62, "Browser bundle (static)\nReact 19 + TS + Vite + Tailwind v4\nshadcn/ui, Lucide, Framer Motion;\nThree.js used for the landing scene", { fill: FILL, size: 7.0, lh: 9.6 });
  box(320, 480, 190, 62, "Convex backend\nactions: analyzeNews (pipeline)\nqueries: history, case files\nmutations: persist on success\nConvex Auth (password, users)", { fill: FILL, size: 7.0, lh: 9.6 });
  box(320, 300, 190, 44, "analyses table (documents)\nindex by_user (userId, createdAt)", { fill: FILL2, size: 7.0, lh: 9.6 });
  arrow(240, 511, 320, 511, { label: "HTTPS" });
  arrow(415, 480, 415, 346, { label: "write once" });
  box(50, 300, 190, 44, "External services\npublisher sites (fetch)\nweb search (per-claim queries)", { fill: FILL2, size: 7.0, lh: 9.6 });
  arrow(415, 300, 240, 320, { label: "outbound calls", dashed: true });
  doc.caption("Figure 5.8 - Component (deployment) diagram.");
  doc.h2end();
}

export function drawState(doc, D) {
  const { box, label, arrow, FILL, FILL2 } = D;
  doc.h2("5.10", "State Diagram");
  doc.para("States of one submitted item as it moves through the application. The failure state here is a first-class terminal state, not an error overlaid on the success screen.");
  doc.spacer(8);
  const bx = (x, y, w, h, t, f) => box(x, y, w, h, t, { fill: f, size: 7.0 });
  bx(80, 560, 110, 26, "SUBMITTED", FILL);
  bx(240, 560, 120, 26, "VALIDATING", FILL);
  bx(420, 560, 110, 26, "RETRIEVING", FILL);
  bx(420, 430, 110, 26, "EXTRACTING", FILL);
  bx(240, 430, 120, 26, "SEARCHING", FILL);
  bx(80, 430, 110, 26, "CROSSCHECKING", FILL);
  bx(80, 300, 120, 26, "ASSESSING", FILL2);
  bx(260, 300, 150, 26, "CASE FILE STORED", FILL2);
  bx(420, 240, 90, 26, "FAILED", FILL2);
  arrow(190, 573, 240, 573, {});
  arrow(360, 573, 420, 573, {});
  arrow(475, 560, 475, 456, {});
  arrow(420, 443, 360, 443, {});
  arrow(240, 443, 190, 443, {});
  arrow(135, 430, 135, 326, {});
  arrow(200, 313, 260, 313, {});
  label(292, 566, "valid structure", { size: 6.4 });
  label(420, 566, "8 s cap, HTTP status", { size: 6.4 });
  label(196, 468, "with claims", { size: 6.4 });
  label(244, 566, "bad URL / no text", { size: 6.2 });
  box(500, 560, 60, 26, "INVALID", FILL2);
  arrow(540, 560, 520, 266, { label: "report only", dashed: true });
  doc.caption("Figure 5.9 - State diagram of one submission; FAILED is terminal and stores nothing.");
  doc.h2end();
}
