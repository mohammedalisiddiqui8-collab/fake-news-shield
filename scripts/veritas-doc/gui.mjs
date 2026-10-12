// Interface wireframe figures of the ACTUAL Veritas UI — drawn as vector
// wireframes (no fake screenshots), each followed by a manual-completion
// placeholder where a genuine screenshot should be pasted before printing.
import { rgb } from "pdf-lib";

const INK = rgb(0, 0, 0);
const FILL = rgb(0.95, 0.95, 0.95);
const FILLD = rgb(0.12, 0.12, 0.12);

const win = (s) => String(s).replace(/[\u2190-\u21FF\u25A0-\u25FF\u2264\u2265\u2022\u00b7]/g, (c) => ({ "\u2192": "->", "\u2190": "<-", "\u2193": "v", "\u2191": "^", "\u25CF": "*", "\u25CB": "o", "\u25A0": "#", "\u2022": "-", "\u2265": ">=", "\u2264": "<=", "\u00b7": "-" })[c] ?? "?");

function frame(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  p.drawRectangle({ x, y, width: w, height: h, color: FILL, borderColor: INK, borderWidth: 0.9 });
  return { ix: x + 8, iy: y + 8, iw: w - 16, ih: h - 16 };
}

function line(p, x1, y, x2, wgt = 0.5) { p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: wgt, color: INK }); }
function bar(p, x, y, w, h, g) { p.drawRectangle({ x, y, width: w, height: h, color: g }); }

function tlines(p, D, x, y, widths, { gap = 4.6, h = 2.0, g } = {}) {
  widths.forEach((w, i) => bar(p, x, y - i * gap - h, w, h, g));
}

export function screenshotPlaceholder(doc) {
  const y0 = doc.y;
  const h = 120;
  doc.need(h + 14);
  const p = doc.cur.page;
  p.drawRectangle({ x: 64 + 40, y: y0 - h, width: 595.28 - 128 - 80, height: h, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.35,0.35,0.35), borderWidth: 0.7, dashArray: undefined });
  p.drawLine({ start: { x: 64 + 40, y: y0 - h }, end: { x: 595.28 - 64 - 40, y: y0 }, thickness: 0.5, color: rgb(0.55,0.55,0.55) });
  p.drawLine({ start: { x: 64 + 40, y: y0 }, end: { x: 595.28 - 64 - 40, y: y0 - h }, thickness: 0.5, color: rgb(0.55,0.55,0.55) });
  const msg = win("PASTE GENUINE VERITAS SCREENSHOT HERE BEFORE PRINTING");
  const tw = doc.f.h.widthOfTextAtSize(msg, 9);
  p.drawText(msg, { x: (595.28 - tw) / 2, y: y0 - h / 2 + 3, size: 9, font: doc.f.h, color: INK });
  doc.y = y0 - h - 10;
}

export function wfHome(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  // dark artwork placeholder representing hero image
  p.drawRectangle({ x: ix, y: iy, width: iw, height: ih, color: FILLD });
  p.drawRectangle({ x: ix + iw/2 - 60, y: iy + ih/2 - 8, width: 120, height: 16, color: rgb(0.2,0.2,0.2) });
  D.label(ix + iw/2, iy + ih/2 + 60, "masthead artwork (genuine asset: veritas-hero.png)", { size: 6.2, align: "center" });
  D.label(ix + iw/2, iy + ih/2 - 4 + 10, "rotating line: \u201CEvidence before certainty.\u201D", { size: 5.8, align: "center" });
  const pw = 74, ph = 15;
  p.drawRectangle({ x: ix + iw/2 - pw/2, y: iy + ih/2 - 40, width: pw, height: ph, color: FILLD, borderColor: rgb(0.75,0.75,0.75), borderWidth: 0.7 });
  D.label(ix + iw/2, iy + ih/2 - 34.5, win("ENTER VERITAS \u2192"), { size: 5.2, align: "center" });
}

export function wfDesk(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  D.label(ix, iy + ih - 10, "Opening", { size: 6.2, font: "h" });
  D.label(ix, iy + ih - 22, "Examine any article, claim by claim.", { size: 7.6, font: "hb" });
  D.label(ix, iy + ih - 34, "ABOUT THE METHOD \u2193", { size: 5.6 });
  line(p, ix, iy + ih - 39, ix + iw, 0.5);
  const labels = ["01", "02", "03", "04", "05", "06"];
  const stage = iw / 6;
  line(p, ix, iy + ih - 62, ix + iw, 0.5);
  labels.forEach((t, i) => {
    const cx = ix + stage * i + stage / 2;
    p.drawRectangle({ x: cx - 2, y: iy + ih - 64, width: 4, height: 4, color: INK });
    D.label(cx, iy + ih - 56, t, { size: 5.4, font: "hb", align: "center" });
    D.label(cx, iy + ih - 70, ["Article", "Claims", "Sources", "Evidence", "Cross-check", "Assessment"][i], { size: 3.8, align: "center" });
  });
  p.drawRectangle({ x: ix, y: iy + 26, width: iw * 0.66, height: 13, borderColor: INK, borderWidth: 0.6 });
  D.label(ix + 3, iy + 30, "paste article URL or text\u2026", { size: 4.6 });
  p.drawRectangle({ x: ix + iw * 0.68, y: iy + 26, width: iw * 0.32, height: 13, color: INK });
  D.label(ix + iw * 0.84, iy + 30, "BEGIN INVESTIGATION", { size: 4.4, align: "center" });
  D.label(ix, iy + 18, "URL \u25CF\u25CB TEXT      depth: quick / standard / deep", { size: 4.2 });
}

export function wfReport(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  D.label(ix, iy + ih - 10, "Report sections (fixed order)", { size: 5.4 });
  const secs = [
    ["01", "Source profile"], ["02", "Claims identified"], ["03", "Source cross-check"],
    ["04", "Evidence timeline"], ["05", "Freshness"], ["06", "Fingerprint"],
    ["07", "Framing signals"], ["08", "Investigation replay"], ["09", "Final assessment"],
  ];
  secs.forEach(([n, t], i) => {
    const ry = iy + ih - 24 - i * 13;
    D.label(ix, ry, n, { size: 5.2, font: "hb" });
    bar(p, ix + 16, ry - 1.5, iw * (0.62 - i * 0.03), 2.4, FILL);
    D.label(ix + 16 + iw * (0.62 - i * 0.03) + 6, ry, t, { size: 5.6 });
    line(p, ix, ry - 7, ix + iw, 0.4);
  });
  line(p, ix, iy + 18, ix + iw, 0.5);
  D.label(ix, iy + 10, "Final assessment: LIKELY CREDIBLE \u00b7 confidence 55% \u00b7 reasoning text", { size: 5 });
  D.label(ix, iy + 3, "Retrieval failed state: UNABLE TO ANALYZE / RETRIEVAL FAILED \u00b7 confidence \u201C\u2014\u201D", { size: 5 });
}

export function wfTrace(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  D.label(ix, iy + ih - 10, "Trace replay \u2014 six stages, light up only if genuinely run", { size: 5.6 });
  const ss = [["01", "Article received"], ["02", "Claims identified"], ["03", "Sources retrieved"], ["04", "Evidence evaluated"], ["05", "Cross-check performed"], ["06", "Assessment produced"]];
  line(p, ix + 8, iy + 16, ix + 8, iy + ih - 18, 0.6);
  ss.forEach(([n, t], i) => {
    const sy = iy + ih - 26 - i * 18;
    p.drawRectangle({ x: ix + 5, y: sy - 1.5, width: 6, height: 6, color: INK });
    D.label(ix + 20, sy, n, { size: 5.4, font: "hb" });
    D.label(ix + 36, sy, t, { size: 5.6 });
    D.label(ix + iw, sy, i < 5 ? "complete" : "complete", { size: 4.6, align: "right" });
  });
  line(p, ix, iy + 12, ix + iw, 0.5);
  D.label(ix, iy + 5, "On retrieval failure only stage 01 completes \u2014 replay shows the stop.", { size: 4.6 });
}

export function wfFailed(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  p.drawRectangle({ x: ix, y: iy + 8, width: iw, height: ih - 16, color: FILLD });
  D.label(ix + iw/2, iy + ih/2 + 16, "UNABLE TO ANALYZE", { size: 8.5, font: "hb", align: "center" });
  D.label(ix + iw/2, iy + ih/2 + 2, "RETRIEVAL FAILED", { size: 6.8, font: "hb", align: "center" });
  D.label(ix + iw/2, iy + ih/2 - 12, "Instagram content could not be retrieved automatically.", { size: 5.2, align: "center" });
  D.label(ix + iw/2, iy + ih/2 - 21, "No factual verification was performed.", { size: 5.2, align: "center" });
  p.drawRectangle({ x: ix, y: iy - 2, width: iw, height: 10, borderColor: INK, borderWidth: 0.5 });
  D.label(ix + 3, iy + 1, "submitted URL kept visible \u00b7 verdict: RETRIEVAL FAILED \u00b7 confidence: \u2014", { size: 4.4 });
}

export function wfEvidence(doc, D, x, y, w, h) {
  const p = doc.cur.page;
  const { ix, iw, iy, ih } = frame(doc, D, x, y, w, h);
  D.label(ix, iy + ih - 8, "Claim 03 \u2014 cross-check result", { size: 5.4 });
  for (let i = 0; i < 3; i++) {
    const cy = iy + ih - 18 - i * 26;
    p.drawRectangle({ x: ix, y: cy - 20, width: iw, height: 22, borderColor: INK, borderWidth: 0.5 });
    D.label(ix + 4, cy - 3, ["SUPPORTS", "PARTIAL", "CONTRADICTS"][i], { size: 4.8, font: "hb" });
    D.label(ix + 44, cy - 3, ["\u201C\u2026 matches the reported figure.\u201D", "\u201C\u2026 addresses part of the claim.\u201D", "\u201C\u2026 conflicting account.\u201D"][i], { size: 4.6 });
    D.label(ix + iw, cy - 17, ["date: recent", "date: recent", "date: historical"][i], { size: 4.2, align: "right" });
  }
  D.label(ix, iy + 8, "Notices with no URL are never counted as sources.", { size: 4.4 });
}
