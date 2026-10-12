// Veritas project documentation — PDF layout engine (pdf-lib)
// All coordinates in pt. A4 = 595.28 x 841.89.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PAGE_W = 595.28, PAGE_H = 841.89;
export const M = { L: 62, R: 62, T: 66, B: 62 };

export const INK = rgb(0.13, 0.13, 0.15);
export const MUTED = rgb(0.38, 0.38, 0.42);
export const RULE = rgb(0.72, 0.72, 0.75);
export const BOX = rgb(0.22, 0.22, 0.26);
export const LIGHTFILL = rgb(0.955, 0.955, 0.96);
export const ACCENT = rgb(0.35, 0.35, 0.40);

export class Doc {
  constructor(pdf, fonts) {
    this.pdf = pdf;
    this.f = fonts;
    this.pages = [];
    this.toc = [];           // { level, text, label, page }
    this.cur = null;
    this.pageNo = 0;
  }

  newPage(style = "body") {
    const p = this.pdf.addPage([PAGE_W, PAGE_H]);
    const pg = { page: p, style };
    this.pageNo++;
    this.pages.push(pg);
    pg.head = { y: PAGE_H - 40 };
    pg.y = PAGE_H - M.T;
    this.cur = pg;
    return pg;
  }

  get y() { return this.cur.y; }
  set y(v) { this.cur.y = v; }

  need(h) {
    if (this.cur.y - h < M.B) this.newPage(this.cur.style);
  }

  // ── text measurement ──
  width(text, font, size) { return font.widthOfTextAtSize(text, size); }

  wrap(text, font, size, maxW) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (this.width(t, font, size) <= maxW) line = t;
      else {
        if (line) lines.push(line);
        // hard-break very long words (URLs)
        let rem = w;
        while (this.width(rem, font, size) > maxW) {
          let lo = 1, hi = rem.length, k = 1;
          while (lo <= hi) { const mid = (lo + hi) >> 1; if (this.width(rem.slice(0, mid), font, size) <= maxW) { k = mid; lo = mid + 1; } else hi = mid - 1; }
          lines.push(rem.slice(0, k)); rem = rem.slice(k);
        }
        line = rem;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // ── flow primitives ──
  para(text, { font = "b", size = 10.6, leading = 15.2, indent = 0, gap = 9, align = "justify" } = {}) {
    const fnt = this.f[font];
    const maxW = PAGE_W - M.L - M.R - indent;
    const lines = this.wrap(text, fnt, size, maxW);
    lines.forEach((ln, i) => {
      this.need(leading + 2);
      let x = M.L + indent;
      if (align === "justify" && i < lines.length - 1) {
        const wSpace = (maxW - this.width(ln, fnt, size)) / Math.max(1, ln.split(" ").length - 1);
        let cx = x;
        const parts = ln.split(" ");
        for (const wd of parts) { this.cur.page.drawText(wd, { x: cx, y: this.cur.y - size, size, font: fnt, color: INK }); cx += this.width(wd, fnt, size) + wSpace; }
      } else {
        this.cur.page.drawText(ln, { x, y: this.cur.y - size, size, font: fnt, color: INK });
      }
      this.cur.y -= leading;
    });
    this.cur.y -= gap;
  }

  bullet(text, { font = "b", size = 10.4, leading = 14.6, gap = 5, indent = 16, marker = "–" } = {}) {
    const fnt = this.f[font];
    const maxW = PAGE_W - M.L - M.R - indent - 12;
    const lines = this.wrap(text, fnt, size, maxW);
    lines.forEach((ln, i) => {
      this.need(leading + 2);
      if (i === 0) this.cur.page.drawText(marker + "  ", { x: M.L + 6, y: this.cur.y - size, size, font: fnt, color: INK });
      this.cur.page.drawText(ln, { x: M.L + indent, y: this.cur.y - size, size, font: fnt, color: INK });
      this.cur.y -= leading;
    });
    this.cur.y -= gap;
  }

  h1(num, title) {
    this.need(120);
    this.cur.y -= 14;
    this.cur.page.drawText(num + "  " + title.toUpperCase(), { x: M.L, y: this.cur.y - 15, size: 14.5, font: this.f.hb, color: INK });
    this.cur.y -= 22;
    this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.8, color: BOX });
    this.cur.y -= 16;
    this.toc.push({ level: 0, text: num + "  " + title, page: null });
  }
  h1end() { this.toc[this.toc.length - 1].page = this.pageNo; }

  h2(num, title) {
    this.need(90);
    this.cur.y -= 10;
    this.cur.page.drawText(num + "  " + title, { x: M.L, y: this.cur.y - 11.5, size: 12.2, font: this.f.hb, color: INK });
    this.cur.y -= 20;
    this.toc.push({ level: 1, text: num + "  " + title, page: null });
  }
  h2end() { this.toc[this.toc.length - 1].page = this.pageNo; }

  h3(num, title) {
    this.need(70);
    this.cur.y -= 8;
    this.cur.page.drawText(num + "  " + title, { x: M.L, y: this.cur.y - 10.5, size: 10.8, font: this.f.hb, color: INK });
    this.cur.y -= 19;
    this.toc.push({ level: 2, text: num + "  " + title, page: null });
  }
  h3end() { this.toc[this.toc.length - 1].page = this.pageNo; }

  caption(text) {
    this.need(26);
    this.cur.y -= 4;
    const lines = this.wrap(text, this.f.ho, 8.6, PAGE_W - M.L - M.R);
    for (const ln of lines) {
      this.need(12);
      this.cur.page.drawText(ln, { x: M.L, y: this.cur.y - 8.6, size: 8.6, font: this.f.ho, color: MUTED });
      this.cur.y -= 11.5;
    }
    this.cur.y -= 8;
  }

  // generic multi-column table. colw widths in pt. rows = array of arrays (strings).
  table(headers, rows, colw, { size = 8.8, pad = 4.5, headFill = true, minRows } = {}) {
    const fH = this.f.hb, fB = this.f.b;
    const totalW = colw.reduce((a, b) => a + b, 0);
    const scale = (PAGE_W - M.L - M.R) / totalW;
    const cw = colw.map(w => w * scale);

    const cellLines = (txt, f, sz, w) => this.wrap(String(txt), f, sz, w - pad * 2);

    const rowH = (cells, f, sz) => {
      let n = 1;
      cells.forEach((c, i) => { n = Math.max(n, cellLines(c, f, sz, cw[i]).length); });
      return n * (sz + 3.4) + pad * 2 - 3.4;
    };

    const headH = rowH(headers, fH, size);

    const drawHead = () => {
      this.need(headH + 8);
      let x = M.L;
      if (headFill) this.cur.page.drawRectangle({ x, y: this.cur.y - headH, width: PAGE_W - M.L - M.R, height: headH, color: LIGHTFILL });
      headers.forEach((h, i) => {
        const lines = cellLines(h, fH, size, cw[i]);
        let ty = this.cur.y - pad - size;
        for (const ln of lines) { this.cur.page.drawText(ln, { x: x + pad, y: ty, size, font: fH, color: INK }); ty -= size + 3.4; }
        x += cw[i];
      });
      this.cur.y -= headH + 2;
      x = M.L;
      this.cur.page.drawLine({ start: { x, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.9, color: BOX });
      this.cur.y -= 2;
    };

    drawHead();
    for (const r of rows) {
      const h = rowH(r, fB, size);
      this.need(h + 4);
      let x = M.L;
      let ty = this.cur.y - pad - size;
      const startY = this.cur.y;
      r.forEach((c, i) => {
        const lines = cellLines(c, fB, size, cw[i]);
        let ly = ty;
        for (const ln of lines) { this.cur.page.drawText(ln, { x: x + pad, y: ly, size, font: fB, color: INK }); ly -= size + 3.4; }
        x += cw[i];
      });
      this.cur.y = startY - h;
      this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.4, color: RULE });
    }
    this.cur.y -= 10;
  }

  // code/mono block
  code(lines, { size = 8.4, leading = 11.4 } = {}) {
    const wMax = PAGE_W - M.L - M.R;
    for (const raw of lines) {
      const lns = this.wrap(raw, this.f.c, size, wMax - 12);
      this.need(lns.length * leading + 4);
      const topY = this.cur.y;
      this.cur.page.drawRectangle({ x: M.L, y: topY - lns.length * leading + 4, width: wMax, height: lns.length * leading, color: LIGHTFILL });
      let y = topY - size;
      for (const ln of lns) {
        this.cur.page.drawText(ln, { x: M.L + 6, y, size, font: this.f.c, color: INK });
        y -= leading;
      }
      this.cur.y = y - 1;
    }
    this.cur.y -= 8;
  }

  quoteBlock(text, { size = 9.8, leading = 13.8 } = {}) {
    const maxW = PAGE_W - M.L - M.R - 20;
    const lines = this.wrap(text, this.f.i, size, maxW);
    this.need(lines.length * leading + 10);
    const top = this.cur.y;
    this.cur.page.drawRectangle({ x: M.L + 4, y: top - lines.length * leading + 3, width: 2.2, height: lines.length * leading, color: BOX });
    let y = top - size;
    for (const ln of lines) {
      this.cur.page.drawText(ln, { x: M.L + 16, y, size, font: this.f.i, color: INK });
      y -= leading;
    }
    this.cur.y = y - 6;
  }

  spacer(h) { this.need(h); this.cur.y -= h; }

  // ── chrome (header/footer) ──
  drawChrome() {
    for (const pg of this.pages) {
      if (pg.style === "cover" || pg.style === "chromeless") continue;
      const p = pg.page;
      p.drawLine({ start: { x: M.L, y: PAGE_H - 46 }, end: { x: PAGE_W - M.R, y: PAGE_H - 46 }, thickness: 0.5, color: RULE });
      p.drawText("VERITAS — PROJECT DOCUMENTATION", { x: M.L, y: PAGE_H - 41, size: 7.3, font: this.f.h, color: MUTED, letterSpacing: 0.8 });
      p.drawText("Automated Fake News Detection and Evidence-Based Fact-Checking", { x: PAGE_W - M.R - this.width("Automated Fake News Detection and Evidence-Based Fact-Checking", this.f.h, 7.3), y: PAGE_H - 41, size: 7.3, font: this.f.h, color: MUTED });
      p.drawText(String(pg.no ?? ""), { x: PAGE_W - M.R - this.width(String(pg.no ?? ""), this.f.h, 8.2), y: 38, size: 8.2, font: this.f.h, color: MUTED });
      p.drawText("B.Sc. Data Science — Final Year Project", { x: M.L, y: 38, size: 7.3, font: this.f.h, color: MUTED });
    }
  }

  setNumbers(startAt) {
    // physical index -> printed number offset (cover has no number)
    this.pages.forEach((pg, i) => { pg.no = i === 0 ? null : i + 1 - startAt; });
  }
}
