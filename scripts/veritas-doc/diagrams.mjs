// The five required diagrams (ER, Class, Flow, Activity, Sequence)
import { rgb } from "pdf-lib";
import { makeDraw } from "./draw.mjs";

const FILL = rgb(0.94, 0.94, 0.955);
const FILL2 = rgb(0.90, 0.90, 0.92);

export function drawER(doc, D) {
  const { box, label, arrow } = D;
  doc.h2("3.1", "ER Diagram");
  doc.para("The entity–relationship model below captures the data that one Veritas investigation produces. An INVESTIGATION record owns everything else: it is created each time a user submits a URL or pasted article text. From it, zero or more CLAIMS are extracted, and every claim that enters cross-checking draws zero or more retrieved SOURCES; each source that actually addresses the claim becomes an EVIDENCE entry carrying an excerpt, a date and a relationship (supports / contradicts / partial / does-not-address). ASSESSMENT stores the final verdict, confidence and reasoning, while the FINGERPRINT stores the aggregate counters (claims, unique sources, claim–source references, source coverage). Note that the cardinals on INVESTIGATION–SOURCE are indirect: sources are reached through claims, so the aggregate table counts claim–source references (one per claim–source pair), not raw source rows.");
  doc.spacer(6);

  const cx = 297;
  const bw = 108, bh = 42;
  // INVESTIGATION top centre
  box(cx - bw / 2, 560, bw, bh, "INVESTIGATION\n(id, input, url, inputType,\nwordCount, createdAt)", { fill: FILL2, size: 7.0, lh: 8.6 });
  // CLAIM left, SOURCE right
  box(cx - 215, 428, bw + 14, bh + 6, "CLAIM\n(id, text, status,\nconfidence, evidence,\nexplanation)", { fill: FILL, size: 7.0, lh: 8.6 });
  box(cx + 107, 428, bw + 14, bh + 6, "SOURCE\n(url, domain, name,\nheadline, date,\nrelationship)", { fill: FILL, size: 7.0, lh: 8.6 });
  // EVIDENCE centre-bottom
  box(cx - bw / 2 - 20, 296, bw + 40, bh + 6, "EVIDENCE / CROSS-CHECK\n(claimId, excerpt, relationship,\nfreshness, role, url)", { fill: FILL, size: 7.0, lh: 8.6 });
  // ASSESSMENT bottom-left, FINGERPRINT bottom-right
  box(cx - 215, 170, bw + 14, bh + 6, "ASSESSMENT\n(verdict, confidence,\nsummary, reasoning,\nredFlags, greenFlags)", { fill: FILL, size: 7.0, lh: 8.6 });
  box(cx + 107, 170, bw + 14, bh + 6, "FINGERPRINT\n(claims, sources, sourceRefs,\nsourceCoverage, verified,\nuncertain, contradicted)", { fill: FILL, size: 7.0, lh: 8.6 });
  // FRAMING / FRESHNESS far bottom centre
  box(cx - bw / 2 - 20, 66, bw + 40, 34, "FRAMING SIGNALS / FRESHNESS / TIMELINE (per-claim observations)", { fill: null, size: 6.8 });

  // connectors
  arrow(cx, 560, cx - 130, 428 + bh + 6 + 6, { label: "extracts 1:N" });
  arrow(cx, 560, cx + 130, 428 + bh + 6 + 6, { label: "reaches via claims 1:N" });
  arrow(cx - 130, 428, cx - 30, 296 + bh + 6 + 6, { label: "yields 1:N" });
  arrow(cx + 130, 428, cx + 30, 296 + bh + 6 + 6, { label: "becomes 0:N" });
  arrow(cx - 60, 296, cx - 130, 170 + bh + 6 + 6, { label: "summarises" });
  arrow(cx + 60, 296, cx + 130, 170 + bh + 6 + 6, { label: "counts" });
  arrow(cx, 296, cx, 100, { label: "annotates" });
  // cardinalities
  label(cx - 44, 528, "1", { size: 7.4, font: "hb", color: INK });
  label(cx - 160, 452, "N", { size: 7.4, font: "hb", color: INK });
  label(cx + 40, 528, "1", { size: 7.4, font: "hb", color: INK });
  label(cx + 148, 452, "N", { size: 7.4, font: "hb", color: INK });
  doc.caption("Figure 3.1 — Entity-relationship diagram of the Veritas investigation data model.");
  doc.h2end();
}

export function drawClass(doc, D) {
  const { box, label, arrow } = D;
  doc.h2("3.2", "Class Diagram");
  doc.para("Veritas is implemented as a set of cooperating modules rather than classes in the classical OOP sense, but the responsibilities map one-to-one onto the class view below. AnalysisController (the Convex action analyzeNews) is the entry point and orchestrator: it validates the submission, calls ArticleRetriever, and on success hands the cleaned text to ClaimExtractor, LinguisticAnalyzer and EvidenceService. EvidenceService performs the live external search and classifies every retrieved result's relationship to its claim. AssessmentEngine derives the verdict and confidence from the claim statuses only — linguistic signals are carried alongside but never tip the verdict on their own. ReportBuilder assembles the fingerprint, timeline, freshness and framing objects that the React UI renders.");
  doc.spacer(6);

  const colW = 150, bh = 54, gap = 16;
  const rows = [
    ["AnalysisController", "validate(input) / dispatch(depth)\nterminateOnRetrievalFailure()\nmount: Convex action analyzeNews"],
    ["ArticleRetriever", "extractUrlCandidate() / classifyUrl()\nfetchArticleText() / extractArticleBody()\nextractPageMetadata() / 8s timeout"],
    ["ClaimExtractor", "extractRawClaims(text, limit)\nnumbering / checkability filter\nattribution + self-qualified guards"],
    ["LinguisticAnalyzer", "redFlagCategories (5) / greenFlagCats (6)\nweightedMatches() / framingSignals()\nbaseSignal (supplementary only)"],
    ["EvidenceService", "searchClaim(claim, opts)\nfollowUpSearch() / relationshipOf()\nsourceAuthority() / notices"],
    ["AssessmentEngine", "statusOf(claim, evidence)\nverdictFrom(claims) / confidenceCap\nunresolvedCeiling() / hardRules()"],
    ["ReportBuilder", "fingerprint() / timeline() / freshness()\ncoverage() via investigationStats\npersistence: convex analyses table"],
  ];
  let y = 560;
  const xL = 92, xR = 322;
  const pos = {};
  rows.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = col === 0 ? xL : xR;
    const yy = y - row * (bh + gap);
    box(x, yy, colW, bh, r[0], { fill: FILL, size: 8.2 });
    label(x + colW / 2, yy - 9.5, r[1].split("\n")[0], { size: 6.6, align: "center", color: rgb(0.32, 0.32, 0.36) });
    label(x + colW / 2, yy - 17.5, r[1].split("\n")[1] ?? "", { size: 6.6, align: "center", color: rgb(0.32, 0.32, 0.36) });
    pos[r[0]] = { x, y: yy, w: colW, h: bh };
  });
  // ReportBuilder centred at bottom
  const rbY = y - 3 * (bh + gap);
  box(207, rbY, colW, bh, "ReportBuilder", { fill: FILL2, size: 8.2 });
  label(207 + colW / 2, rbY - 9.5, "fingerprint() / timeline() / freshness()", { size: 6.6, align: "center", color: rgb(0.32, 0.32, 0.36) });
  label(207 + colW / 2, rbY - 17.5, "coverage() via investigationStats", { size: 6.6, align: "center", color: rgb(0.32, 0.32, 0.36) });

  const A = pos["AnalysisController"], R = pos["ArticleRetriever"],
    CE = pos["ClaimExtractor"], LA = pos["LinguisticAnalyzer"],
    ES = pos["EvidenceService"], AE = pos["AssessmentEngine"];
  arrow(A.x + A.w / 2, A.y, R.x + R.w / 2, R.y + R.h, { label: "uses" });
  arrow(R.x + R.w / 2, R.y, CE.x + CE.w / 2, CE.y + CE.h, { label: "clean text" });
  arrow(CE.x + CE.w, CE.y + CE.h / 2, LA.x, LA.y + LA.h / 2, { label: "same text" });
  arrow(CE.x + CE.w / 2, CE.y, ES.x + ES.w / 2, ES.y + ES.h, { label: "claims" });
  arrow(ES.x + ES.w / 2, ES.y, AE.x + AE.w / 2, AE.y + AE.h, { label: "evidence" });
  arrow(LA.x + LA.w / 2, LA.y, 207 + colW / 2, rbY + bh, { label: "signals", dashed: true });
  arrow(AE.x + AE.w / 2, AE.y, 207 + colW / 2 - 20, rbY + bh, { label: "statuses" });
  doc.caption("Figure 3.2 — Logical class diagram of the Veritas analysis pipeline.");
  doc.h2end();
}

export function drawFlow(doc, D) {
  const { box, diamond, label, arrow } = D;
  doc.h2("3.3", "Flow Chart");
  doc.para("The flow chart traces one submission from START to END, including the branch that matters most for reliability: retrieval failure. If the article cannot be fetched, the pipeline stops immediately — no claims, no verdict, no confidence are produced from nothing. This is the branch that produced the UNABLE TO ANALYZE / RETRIEVAL FAILED behaviour documented in Chapter 4.");
  doc.spacer(6);

  const cx = 250;
  const bw = 128, bh = 22;
  const steps = [
    ["START", 788, "oval"],
    ["Input URL / pasted article text", 752, "box"],
    ["Validate URL structure (http/https)", 716, "box"],
    ["Retrieve article content (fetch, 8 s timeout)", 680, "box"],
  ];
  steps.forEach(([t, y, kind]) => {
    if (kind === "oval") box(cx - 40, y, 80, 20, t, { fill: FILL2, size: 7.8 });
    else box(cx - bw / 2, y, bw, bh, t, { size: 7.6 });
  });
  arrow(cx, 788, cx, 774);
  arrow(cx, 752, cx, 738);
  arrow(cx, 716, cx, 702);
  arrow(cx, 680, cx, 656);

  // decision: retrieval successful?
  diamond(cx, 636, 150, 40, "Retrieval successful?", { size: 7.4 });
  // NO branch → right
  box(cx + 150, 626, 120, 22, "RETRIEVAL FAILURE", { fill: FILL2, size: 7.6 });
  arrow(cx + 75, 636, cx + 150, 637, { label: "NO" });
  box(cx + 150, 590, 120, 22, "Report UNABLE TO ANALYZE — STOP", { size: 7.2 });
  arrow(cx + 210, 626, cx + 210, 612);
  box(cx + 150, 554, 120, 22, "END (no verdict issued)", { fill: FILL2, size: 7.4 });
  arrow(cx + 210, 590, cx + 210, 576);
  // YES continues down
  arrow(cx, 616, cx, 596, { label: "YES" });
  const chain = [
    ["Clean / isolate article body", 574],
    ["Extract factual claims (numbered)", 538],
    ["Retrieve external evidence per claim", 502],
    ["Cross-check: supports / contradicts / partial", 466],
    ["Compute coverage, fingerprint, freshness", 430],
    ["Generate verdict + confidence (evidence-gated)", 394],
    ["Display report + investigation trace", 358],
    ["END", 322],
  ];
  chain.forEach(([t, y], i) => {
    if (t === "END") box(cx - 40, y, 80, 20, t, { fill: FILL2, size: 7.8 });
    else box(cx - bw / 2, y, bw, bh, t, { size: 7.6 });
    const ny = i < chain.length - 1 ? chain[i + 1][1] + bh : null;
    arrow(cx, y, cx, y - (y - (i < chain.length - 1 ? chain[i + 1][1] + bh : y - 24)) - (i < chain.length - 1 ? 0 : 4));
  });
  // fix arrows between chain boxes
  for (let i = 0; i < chain.length - 1; i++) {
    const [, y1] = chain[i]; const [, y2] = chain[i + 1];
    arrow(cx, y1, cx, y2 + bh);
  }
  doc.caption("Figure 3.3 — Flow chart of one Veritas investigation, including the retrieval-failure stop branch.");
  doc.h2end();
}

export function drawActivity(doc, D) {
  const { box, label, arrow } = D;
  doc.h2("3.4", "Activity Diagram");
  doc.para("The activity diagram separates the user's actions (left lane) from the system's work (right lane). The user submits a URL or pastes text and waits; everything after that is Veritas working. The partition boundary makes the division of responsibility explicit — the user never sees intermediate stages unless they open the Trace view, and the system never asks the user to do anything mid-investigation.");
  doc.spacer(6);

  const xU = 120, xS = 380;
  const laneW = 200;
  // swimlanes
  doc.cur.page.drawRectangle({ x: xU - laneW / 2, y: 120, width: laneW, height: 560, borderColor: rgb(0.75, 0.75, 0.78), borderWidth: 0.7 });
  doc.cur.page.drawRectangle({ x: xS - laneW / 2, y: 120, width: laneW, height: 560, borderColor: rgb(0.75, 0.75, 0.78), borderWidth: 0.7 });
  label(xU, 686, "USER", { size: 9, font: "hb", align: "center", color: INK });
  label(xS, 686, "VERITAS SYSTEM", { size: 9, font: "hb", align: "center", color: INK });

  const steps = [
    [xU, 640, "Submit URL or article text"],
    [xS, 596, "Validate input & classify URL"],
    [xS, 552, "Retrieve page (8 s cap)"],
    [xS, 508, "Extract & clean article body"],
    [xS, 464, "Extract numbered claims"],
    [xS, 420, "Search external evidence per claim"],
    [xS, 376, "Classify relationships; cross-check"],
    [xS, 332, "Derive coverage, fingerprint, freshness"],
    [xS, 288, "Produce verdict + confidence"],
    [xU, 244, "Read report / step through Trace"],
    [xU, 200, "END"],
  ];
  for (const [x, y, t] of steps) {
    if (t === "END") box(x - 30, y, 60, 18, t, { fill: FILL2, size: 7.6 });
    else box(x - 85, y, 170, 22, t, { size: 7.4 });
  }
  // vertical arrows down each lane
  arrow(xU, 640, xU, 262);
  arrow(xS, 596, xS, 310);
  // lane crossings
  arrow(xU + 85, 651, xS - 85, 607, { label: "hand-off" });
  arrow(xS - 85, 255, xU + 85, 255, { label: "report returned", dashed: true });
  doc.caption("Figure 3.4 — Activity diagram with user/system swimlanes.");
  doc.h2end();
}

export function drawSequence(doc, D) {
  const { box, label, arrow } = D;
  doc.h2("3.5", "Sequence Diagram");
  doc.para("The sequence diagram shows the same investigation as ordered messages between participants. Two details are worth noting for the viva. First, the Retrieval participant returns a failure object, not an exception: the controller converts it into the RETRIEVAL FAILED response and the sequence simply ends. Second, Evidence Search runs once per claim (the loop fragment), and every result is classified before the database write, so the stored case file already contains the classified evidence rather than raw search output.");
  doc.spacer(6);

  const lanes = [
    ["User", 80],
    ["Browser / UI", 185],
    ["Backend\n(Controller)", 290],
    ["Retrieval", 390],
    ["Claim\nExtraction", 462],
    ["Evidence\nSearch", 530],
    ["Convex DB", 620],
    ["Assessment", 700],
  ];
  const topY = 640, botY = 150;
  for (const [name, x] of lanes) {
    const lines = name.split("\n");
    lines.forEach((ln, i) => label(x, topY + 14 - i * 9, ln, { size: 7.6, font: "hb", align: "center", color: INK }));
    doc.cur.page.drawLine({ start: { x, y: topY + 4 }, end: { x, y: botY }, thickness: 0.6, color: rgb(0.6, 0.6, 0.64), dashArray: { pattern: 4, phase: 2 } });
  }

  const msg = (from, to, y, text, { dashed = false } = {}) => {
    const x1 = lanes.find(l => l[0].startsWith(from))[1];
    const x2 = lanes.find(l => l[0].startsWith(to))[1];
    const p = doc.cur.page;
    p.drawLine({ start: { x: x1, y }, end: { x: x2 - Math.sign(x2 - x1) * 3, y }, thickness: 0.8, color: INK, dashArray: dashed ? { pattern: 3, phase: 0 } : undefined });
    // head
    const hx = x2 - Math.sign(x2 - x1) * 3;
    p.drawLine({ start: { x: hx, y }, end: { x: hx - Math.sign(x2 - x1) * 6, y: y + 2.4 }, thickness: 0.8, color: INK });
    p.drawLine({ start: { x: hx, y }, end: { x: hx - Math.sign(x2 - x1) * 6, y: y - 2.4 }, thickness: 0.8, color: INK });
    label((x1 + x2) / 2, y + 3, text, { size: 6.6, align: "center", color: rgb(0.25, 0.25, 0.3) });
  };

  msg("User", "Browser", 622, "submit URL / text");
  msg("Browser", "Backend", 606, "analyzeNews action");
  msg("Backend", "Retrieval", 590, "fetchArticleText(url)");
  msg("Retrieval", "Backend", 576, "ok: text + metadata", { dashed: true });
  msg("Backend", "Claim", 560, "extractRawClaims(text)");
  msg("Claim", "Backend", 546, "numbered claims", { dashed: true });
  // loop box
  doc.cur.page.drawRectangle({ x: 350, y: 462, width: 310, height: 86, borderColor: rgb(0.4, 0.4, 0.45), borderWidth: 0.7 });
  label(356, 540, "loop [for each claim]", { size: 6.8, font: "hbi" in doc.f ? "hbi" : "hb", color: MUTED });
  msg("Backend", "Evidence", 524, "searchClaim(claim)");
  msg("Evidence", "Backend", 508, "sources + relationships", { dashed: true });
  msg("Backend", "Backend", 488, "classify / cross-check");
  msg("Backend", "Assessment", 440, "claims + statuses + signals");
  msg("Assessment", "Backend", 424, "verdict + confidence", { dashed: true });
  msg("Backend", "Convex", 404, "persist case file");
  msg("Browser", "Convex", 380, "subscribe (reactive query)", { dashed: true });
  msg("Convex", "Browser", 362, "investigation record", { dashed: true });
  msg("Browser", "User", 344, "report + Trace replay", { dashed: true });
  // failure alt path note
  label(350, 320, "alt: retrieval fails → Backend returns RETRIEVAL FAILED (confidence “—”),", { size: 6.8, color: MUTED });
  label(350, 310, "no claims / evidence / verdict are produced, nothing is persisted.", { size: 6.8, color: MUTED });
  doc.caption("Figure 3.5 — Sequence diagram of one investigation across all participants.");
  doc.h2end();
}
