// GUI mockups of the actual Veritas interface (wireframe-faithful, monochrome)
// Drawn from the real component structure: dark editorial theme, mono labels,
// hairline rules, serif headlines.
import { rgb } from "pdf-lib";

const DARK = rgb(0.045, 0.045, 0.05);
const DARK2 = rgb(0.09, 0.09, 0.10);
const IVORY = rgb(0.93, 0.92, 0.89);
const GREY = rgb(0.55, 0.55, 0.56);
const LINE = rgb(0.28, 0.28, 0.30);

export function guiFrame(doc, D, x, y, w, h, titleText) {
  const p = doc.cur.page;
  p.drawRectangle({ x, y, width: w, height: h, color: DARK });
  p.drawRectangle({ x, y, width: w, height: h, borderColor: rgb(0.35, 0.35, 0.38), borderWidth: 0.8 });
  // top chrome
  p.drawLine({ start: { x, y: y + h - 14 }, end: { x: x + w, y: y + h - 14 }, thickness: 0.5, color: LINE });
  D.label(x + 6, y + h - 10.5, "VERITAS", { size: 5.6, font: "hb", color: GREY });
  D.label(x + w - 6, y + h - 10.5, titleText, { size: 5.6, font: "h", color: GREY, align: "right" });
  return { ix: x + 10, iy: y, iw: w - 20, ih: h - 20 };
}

function hair(p, x1, y, x2) { p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.4, color: LINE }); }
function textBar(p, x, y, w, h, color) { p.drawRectangle({ x, y, width: w, height: h, color }); }

// Generic grey text line to suggest copy without printing fake words
function lines(p, D, x, y, widths, { gap = 5.4, h = 2.2, color = rgb(0.45, 0.45, 0.47) } = {}) {
  widths.forEach((w, i) => textBar(p, x, y - i * gap - h, w, h, color));
  return y - widths.length * gap;
}

export function mockHome(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  home");
  // centered masthead
  D.label(ix + iw / 2, y + h * 0.62, "V E R I T A S", { size: 11, font: "hb", color: IVORY, align: "center" });
  D.label(ix + iw / 2, y + h * 0.52, "\u201CEvidence before certainty.\u201D", { size: 6.4, font: "i", color: GREY, align: "center" });
  // scan line
  p.drawLine({ start: { x: ix, y: y + h * 0.47 }, end: { x: ix + iw * 0.42, y: y + h * 0.47 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.52) });
  // enter pill
  const pw = 74, ph = 15;
  p.drawRectangle({ x: ix + iw / 2 - pw / 2, y: y + h * 0.30, width: pw, height: ph, borderColor: rgb(0.7, 0.7, 0.72), borderWidth: 0.7 });
  D.label(ix + iw / 2, y + h * 0.30 + 5.4, "ENTER VERITAS  →", { size: 5.4, font: "h", color: IVORY, align: "center" });
  hair(p, ix, y + 14, ix + iw);
  D.label(ix, y + 8, "truth deserves evidence", { size: 4.6, font: "h", color: GREY });
}

export function mockDesk(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  desk");
  // kicker + headline
  D.label(ix, y + h - 30, "THE INVESTIGATION DESK", { size: 4.8, font: "h", color: GREY });
  D.label(ix, y + h - 44, "Examine any article,", { size: 8.4, font: "hb", color: IVORY });
  D.label(ix, y + h - 54, "claim by claim.", { size: 8.4, font: "hb", color: IVORY });
  // method toggle row
  D.label(ix, y + h - 70, "ABOUT THE METHOD  \u2193", { size: 5.2, font: "h", color: GREY });
  hair(p, ix, y + h - 76, ix + iw);
  // timeline 01..06
  const labels = ["01", "02", "03", "04", "05", "06"];
  const step = iw / 6;
  p.drawLine({ start: { x: ix, y: y + h - 100 }, end: { x: ix + iw, y: y + h - 100 }, thickness: 0.4, color: LINE });
  labels.forEach((t, i) => {
    const cx = ix + step * i + step / 2;
    p.drawRectangle({ x: cx - 2.2, y: y + h - 102.2, width: 4.4, height: 4.4, color: IVORY });
    D.label(cx, y + h - 90, t, { size: 5.6, font: "hb", color: IVORY, align: "center" });
    D.label(cx, y + h - 113, ["Article", "Claims", "Sources", "Evidence", "Cross-check", "Assessment"][i], { size: 4.0, font: "h", color: GREY, align: "center" });
  });
  // input area
  p.drawRectangle({ x: ix, y: y + 34, width: iw * 0.66, height: 14, borderColor: LINE, borderWidth: 0.6 });
  D.label(ix + 4, y + 38.4, "paste article URL or text\u2026", { size: 4.8, font: "h", color: GREY });
  p.drawRectangle({ x: ix + iw * 0.68, y: y + 34, width: iw * 0.32, height: 14, color: IVORY });
  D.label(ix + iw * 0.68 + iw * 0.16, y + 38.4, "BEGIN INVESTIGATION", { size: 4.6, font: "hb", color: DARK, align: "center" });
  // text/url toggle
  D.label(ix, y + 24, "URL  \u25CF\u25CB  TEXT          depth: quick / standard / deep", { size: 4.4, font: "h", color: GREY });
}

export function mockAnalysisVerdict(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  analysis \u00b7 assessment");
  D.label(ix, y + h - 28, "FINAL ASSESSMENT", { size: 4.8, font: "h", color: GREY });
  D.label(ix, y + h - 42, "LIKELY CREDIBLE", { size: 9.5, font: "hb", color: IVORY });
  D.label(ix + 82, y + h - 42, "confidence 55%", { size: 5.6, font: "h", color: GREY });
  // confidence bar
  p.drawRectangle({ x: ix, y: y + h - 50, width: iw, height: 3.2, color: DARK2 });
  p.drawRectangle({ x: ix, y: y + h - 50, width: iw * 0.55, height: 3.2, color: IVORY });
  lines(p, D, ix, y + h - 62, [iw * 0.9, iw * 0.82, iw * 0.86]);
  // summary strip
  D.label(ix, y + h - 92, "2 CORROBORATED  \u00b7  2 UNVERIFIED  \u00b7  1 UNCERTAIN", { size: 5.0, font: "hb", color: GREY });
  hair(p, ix, y + h - 98, ix + iw);
  // claim rows
  const rows = [["01", "supported"], ["02", "needs verification"], ["03", "supported"], ["04", "uncertain"], ["05", "needs verification"]];
  rows.forEach(([n, s], i) => {
    const ry = y + h - 112 - i * 13;
    D.label(ix, ry, n, { size: 5.2, font: "hb", color: GREY });
    textBar(p, ix + 14, ry - 0.5, iw * (0.5 - i * 0.04), 2.4, rgb(0.42, 0.42, 0.44));
    D.label(ix + iw, ry, s, { size: 4.6, font: "h", color: GREY, align: "right" });
    hair(p, ix, ry - 6, ix + iw);
  });
  // fingerprint strip
  hair(p, ix, y + 26, ix + iw);
  D.label(ix, y + 18, "FINGERPRINT  5 claims \u00b7 9 sources \u00b7 15 refs \u00b7 coverage 40%", { size: 4.6, font: "h", color: IVORY });
}

export function mockEvidence(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  analysis \u00b7 evidence");
  D.label(ix, y + h - 28, "SOURCE CROSS-CHECK", { size: 5.0, font: "h", color: GREY });
  D.label(ix, y + h - 40, "Claim 03 \u2014 external coverage", { size: 6.6, font: "hb", color: IVORY });
  // three source cards
  for (let i = 0; i < 3; i++) {
    const cy = y + h - 96 - i * 34;
    p.drawRectangle({ x: ix, y: cy, width: iw, height: 28, borderColor: LINE, borderWidth: 0.5, color: DARK2 });
    D.label(ix + 5, cy + 20, ["SUPPORTS", "PARTIAL", "CONTRADICTS"][i], { size: 4.8, font: "hb", color: [IVORY, GREY, IVORY][i] });
    D.label(ix + 48, cy + 20, ["reuters.com", "apnews.com", "bloomberg.com"][i], { size: 4.8, font: "h", color: GREY });
    D.label(ix + 5, cy + 12, ["\u201C\u2026 matches the reported figure.\u201D", "\u201C\u2026 addresses part of the claim.\u201D", "\u201C\u2026 conflicting account.\u201D"][i], { size: 4.8, font: "i", color: rgb(0.62, 0.62, 0.64) });
    D.label(ix + 5, cy + 4, ["Mar 2026 \u00b7 fresh", "Feb 2026 \u00b7 recent", "Aug 2024 \u00b7 historical"], { size: 4.2, font: "h", color: GREY });
  }
  hair(p, ix, y + 22, ix + iw);
  D.label(ix, y + 14, "NO INDEPENDENT CORROBORATION FOUND \u2014 honest notice, never counted as a source", { size: 4.2, font: "h", color: GREY });
}

export function mockTrace(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  desk \u00b7 trace");
  D.label(ix, y + h - 28, "INVESTIGATION TRACE", { size: 5.0, font: "h", color: GREY });
  const stages = [
    ["01", "Article received", true],
    ["02", "Claims identified", true],
    ["03", "Sources retrieved", true],
    ["04", "Evidence evaluated", true],
    ["05", "Cross-check performed", true],
    ["06", "Assessment produced", true],
  ];
  p.drawLine({ start: { x: ix + 8, y: y + 20 }, end: { x: ix + 8, y: y + h - 40 }, thickness: 0.5, color: LINE });
  stages.forEach(([n, t, done], i) => {
    const sy = y + h - 46 - i * 26;
    p.drawRectangle({ x: ix + 5.4, y: sy - 1, width: 5.2, height: 5.2, color: done ? IVORY : DARK2 });
    D.label(ix + 20, sy, n, { size: 5.4, font: "hb", color: GREY });
    D.label(ix + 38, sy, t, { size: 5.8, font: "h", color: IVORY });
    D.label(ix + iw, sy, done ? "complete" : "pending", { size: 4.4, font: "h", color: GREY, align: "right" });
  });
  hair(p, ix, y + 16, ix + iw);
  D.label(ix, y + 8, "only stages that genuinely occurred are marked complete", { size: 4.2, font: "h", color: GREY });
}

export function mockRetrievalFailed(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  analysis \u00b7 retrieval failed");
  D.label(ix + iw / 2, y + h - 40, "UNABLE TO ANALYZE", { size: 9.5, font: "hb", color: IVORY, align: "center" });
  D.label(ix + iw / 2, y + h - 54, "RETRIEVAL FAILED", { size: 7.5, font: "hb", color: GREY, align: "center" });
  D.label(ix + iw / 2, y + h - 70, "Instagram content could not be retrieved automatically.", { size: 5.0, font: "h", color: GREY, align: "center" });
  D.label(ix + iw / 2, y + h - 79, "No factual verification was performed.", { size: 5.0, font: "h", color: GREY, align: "center" });
  // url retained
  p.drawRectangle({ x: ix, y: y + 34, width: iw, height: 14, borderColor: LINE, borderWidth: 0.5, color: DARK2 });
  D.label(ix + 5, y + 38.4, "submitted URL: https://www.instagram.com/p/\u2026  (kept visible)", { size: 4.4, font: "c", color: GREY });
  D.label(ix, y + 24, "verdict: RETRIEVAL FAILED          confidence: \u2014", { size: 4.8, font: "h", color: IVORY });
  hair(p, ix, y + 18, ix + iw);
  D.label(ix, y + 10, "investigation stops at retrieval \u00b7 no claims \u00b7 no evidence \u00b7 nothing persisted", { size: 4.2, font: "h", color: GREY });
}

export function mockFramework(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw } = guiFrame(doc, D, x, y, w, h, "veritas  /  desk \u00b7 framework");
  D.label(ix, y + h - 30, "THE FRAMEWORK", { size: 5.2, font: "h", color: GREY });
  // two tracks
  const colW = (iw - 10) / 2;
  p.drawRectangle({ x: ix, y: y + 24, width: colW, height: h - 66, borderColor: LINE, borderWidth: 0.5, color: DARK2 });
  p.drawRectangle({ x: ix + colW + 10, y: y + 24, width: colW, height: h - 66, borderColor: LINE, borderWidth: 0.5, color: DARK2 });
  D.label(ix + colW / 2, y + h - 44, "CLAIM TRACK", { size: 5.6, font: "hb", color: IVORY, align: "center" });
  D.label(ix + colW + 10 + colW / 2, y + h - 44, "LANGUAGE TRACK", { size: 5.6, font: "hb", color: GREY, align: "center" });
  const ct = ["claim extraction", "source retrieval", "external evidence", "cross-checking", "credibility assessment", "verdict + confidence"];
  const lt = ["sensationalism patterns", "clickbait markers", "attribution language", "framing signals", "supplementary only", "never decides a verdict"];
  ct.forEach((t, i) => D.label(ix + 6, y + h - 58 - i * 12, t, { size: 4.6, font: "h", color: GREY }));
  lt.forEach((t, i) => D.label(ix + colW + 16, y + h - 58 - i * 12, t, { size: 4.6, font: "h", color: rgb(0.45, 0.45, 0.47) }));
  D.label(ix + iw / 2, y + 16, "the claim track is the path to factual verification", { size: 4.4, font: "i", color: GREY, align: "center" });
}
