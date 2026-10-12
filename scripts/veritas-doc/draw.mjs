// Drawing primitives for diagrams and GUI mockups (drawn directly on the page)
import { rgb } from "pdf-lib";

const INK = rgb(0.13, 0.13, 0.15);
const MUTED = rgb(0.38, 0.38, 0.42);
const RULE = rgb(0.72, 0.72, 0.75);
const FILL = rgb(0.94, 0.94, 0.955);
const FILL2 = rgb(0.90, 0.90, 0.92);

export function makeDraw(doc) {
  const f = doc.f;

  function box(x, y, w, h, label, { size = 7.6, fill = null, bold = true, lh = 9.4 } = {}) {
    const p = doc.cur.page;
    if (fill) p.drawRectangle({ x, y, width: w, height: h, color: fill });
    p.drawRectangle({ x, y, width: w, height: h, borderColor: INK, borderWidth: 0.9 });
    const fnt = bold ? f.hb : f.h;
    const maxW = w - 8;
    const lines = doc.wrap(label, fnt, size, maxW);
    const total = lines.length * lh;
    let ty = y + h / 2 + total / 2 - size;
    for (const ln of lines) {
      const tw = fnt.widthOfTextAtSize(ln, size);
      p.drawText(ln, { x: x + (w - tw) / 2, y: ty, size, font: fnt, color: INK });
      ty -= lh;
    }
  }

  function diamond(cx, cy, w, h, label, { size = 7.2 } = {}) {
    const p = doc.cur.page;
    p.drawLine({ start: { x: cx, y: cy + h / 2 }, end: { x: cx + w / 2, y: cy }, thickness: 0.9, color: INK });
    p.drawLine({ start: { x: cx + w / 2, y: cy }, end: { x: cx, y: cy - h / 2 }, thickness: 0.9, color: INK });
    p.drawLine({ start: { x: cx, y: cy - h / 2 }, end: { x: cx - w / 2, y: cy }, thickness: 0.9, color: INK });
    p.drawLine({ start: { x: cx - w / 2, y: cy }, end: { x: cx, y: cy + h / 2 }, thickness: 0.9, color: INK });
    const lines = doc.wrap(label, f.hb, size, w - 10);
    let ty = cy + lines.length * 4.4 - size / 2;
    for (const ln of lines) {
      const tw = f.hb.widthOfTextAtSize(ln, size);
      p.drawText(ln, { x: cx - tw / 2, y: ty, size, font: f.hb, color: INK });
      ty -= size + 1.6;
    }
  }

  function arrow(x1, y1, x2, y2, { label = null, dashed = false, side = "right" } = {}) {
    const p = doc.cur.page;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    p.drawLine({ start: { x: x1, y: y1 }, end: { x: x2 - ux * 6, y: y2 - uy * 6 }, thickness: 0.9, color: INK, dashArray: dashed ? { pattern: 3, phase: 0 } : undefined });
    // arrowhead
    const ax = x2 - ux * 6, ay = y2 - uy * 6;
    const px = -uy, py = ux;
    p.drawLine({ start: { x: ax, y: ay }, end: { x: ax + ux * 6 + px * 2.4, y: ay + uy * 6 + py * 2.4 }, thickness: 0.9, color: INK });
    p.drawLine({ start: { x: ax, y: ay }, end: { x: ax + ux * 6 - px * 2.4, y: ay + uy * 6 - py * 2.4 }, thickness: 0.9, color: INK });
    if (label) {
      const size = 6.8;
      const tw = f.h.widthOfTextAtSize(label, size);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const lx = side === "right" ? mx + 4 : mx - 4 - tw;
      p.drawText(label, { x: lx, y: my + 2, size, font: f.h, color: MUTED });
    }
  }

  function elbow(x1, y1, x2, y2, { label = null, dashed = false } = {}) {
    const p = doc.cur.page;
    const midY = (y1 + y2) / 2;
    p.drawLine({ start: { x: x1, y: y1 }, end: { x: x1, y: midY }, thickness: 0.9, color: INK, dashArray: dashed ? { pattern: 3, phase: 0 } : undefined });
    p.drawLine({ start: { x: x1, y: midY }, end: { x: x2, y: midY }, thickness: 0.9, color: INK, dashArray: dashed ? { pattern: 3, phase: 0 } : undefined });
    arrow(x2, midY, x2, y2, {});
    if (label) {
      const size = 6.8;
      const tw = f.h.widthOfTextAtSize(label, size);
      p.drawText(label, { x: (x1 + x2) / 2 - tw / 2, y: midY + 2, size, font: f.h, color: MUTED });
    }
  }

  function label(x, y, text, { size = 7.2, font = "h", color = MUTED, align = "left" } = {}) {
    const p = doc.cur.page;
    const fnt = f[font];
    const tw = fnt.widthOfTextAtSize(text, size);
    const xx = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x;
    p.drawText(text, { x: xx, y, size, font: fnt, color });
  }

  function crow(ruler) {
    return { one: "1", many: "N", oneOpt: "1" };
  }

  return { box, diamond, arrow, elbow, label };
}
