// Veritas project documentation — PDF layout engine (pdf-lib)
// Formatting rules: black text only, no italics/underline in body, A4.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PAGE_W = 595.28, PAGE_H = 841.89;

// Standard-14 fonts are WinAnsi-only: map the few non-encodable glyphs used
// in content strings to ASCII equivalents before measuring or drawing.
const GLYPH_MAP = { "\u2192": "->", "\u2190": "<-", "\u2193": "v", "\u2191": "^", "\u25CF": "*", "\u25CB": "o", "\u25A0": "#", "\u2022": "-", "\u2265": ">=", "\u2264": "<=", "\u0304": "", "\u03A3": "Sum", "\u1D62": "i", "\u00e9": "e", "\u0152": "OE", "\u0153": "oe", "\u00c6": "AE", "\u00e6": "ae", "\u0158": "R", "\u0159": "r", "\u00d8": "O", "\u00f8": "o" };
export function win(s) {
  return String(s)
    .replace(/\u0301/g, "'")
    .replace(/\u00c5/g, "A")
    .replace(/\u00e5/g, "a")
    .replace(/[\u2190-\u21FF\u25A0-\u25FF\u2264\u2265\u2022\u0304\u03A3\u1D62]/g, (c) => GLYPH_MAP[c] ?? "?");
}

export const M = { L: 64, R: 64, T: 68, B: 60 };

export const INK = rgb(0, 0, 0);
export const MUTED = rgb(0.25, 0.25, 0.25);
export const RULE = rgb(0.45, 0.45, 0.45);
export const BOX = rgb(0, 0, 0);
export const LIGHTFILL = rgb(0.94, 0.94, 0.94);

export class Doc {
  static async create() {
    const d = new Doc();
    await d.#init();
    return d;
  }
  async #init() {
    this.pdf = await PDFDocument.create();
    this.f = {
      b: await this.pdf.embedFont(StandardFonts.TimesRoman),      // body
      h: await this.pdf.embedFont(StandardFonts.Helvetica),
      hb: await this.pdf.embedFont(StandardFonts.HelveticaBold),
      c: await this.pdf.embedFont(StandardFonts.Courier),
      cb: await this.pdf.embedFont(StandardFonts.CourierBold),
    };
    this.pages = [];
    this.toc = [];           // { level, text, label, pageNo }
    this.cur = null;
    this.pageNo = 0;
  }
  newPage(style = "body") {
    const p = this.pdf.addPage([PAGE_W, PAGE_H]);
    const pg = { page: p, style };
    this.pageNo++;
    this.pages.push(pg);
    pg.y = PAGE_H - M.T;
    this.cur = pg;
    return pg;
  }

  get y() { return this.cur.y; }
  set y(v) { this.cur.y = v; }

  need(h) {
    if (this.cur.y - h < M.B) this.newPage(this.cur.style);
  }

  width(text, font, size) { return font.widthOfTextAtSize(win(text), size); }

  wrap(text, font, size, maxW) {
    text = win(text);
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (this.width(t, font, size) <= maxW) line = t;
      else {
        if (line) lines.push(line);
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

  para(text, { font = "b", size = 10.6, leading = 15.4, indent = 0, gap = 8, align = "justify" } = {}) {
    text = win(text);
    const fnt = this.f[font];
    const maxW = PAGE_W - M.L - M.R - indent;
    const lines = this.wrap(text, fnt, size, maxW);
    lines.forEach((ln, i) => {
      this.need(leading + 2);
      if (align === "justify" && i < lines.length - 1) {
        const parts = ln.split(" ");
        const wSpace = (maxW - this.width(ln, fnt, size)) / Math.max(1, parts.length - 1);
        let cx = M.L + indent;
        for (const wd of parts) { this.cur.page.drawText(wd, { x: cx, y: this.cur.y - size, size, font: fnt, color: INK }); cx += this.width(wd, fnt, size) + wSpace; }
      } else {
        this.cur.page.drawText(ln, { x: M.L + indent, y: this.cur.y - size, size, font: fnt, color: INK });
      }
      this.cur.y -= leading;
    });
    this.cur.y -= gap;
  }

  bullet(text, { font = "b", size = 10.4, leading = 14.8, gap = 4, indent = 18, marker = "\u2013" } = {}) {
    text = win(text);
    const fnt = this.f[font];
    const maxW = PAGE_W - M.L - M.R - indent - 10;
    const lines = this.wrap(text, fnt, size, maxW);
    lines.forEach((ln, i) => {
      this.need(leading + 2);
      if (i === 0) this.cur.page.drawText(marker + " ", { x: M.L + 4, y: this.cur.y - size, size, font: fnt, color: INK });
      this.cur.page.drawText(ln, { x: M.L + indent, y: this.cur.y - size, size, font: fnt, color: INK });
      this.cur.y -= leading;
    });
    this.cur.y -= gap;
  }

  h1front(title) {
    title = win(title);
    this.need(90);
    this.cur.y -= 8;
    this.cur.page.drawText(title, { x: M.L, y: this.cur.y - 14, size: 14, font: this.f.hb, color: INK });
    this.cur.y -= 22;
    this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.8, color: BOX });
    this.cur.y -= 16;
    this.toc.push({ level: 0, text: title, page: null });
  }
  h1frontend() { this.toc[this.toc.length - 1].page = this.pageNo; }

  h1(num, title) {
    title = win(title);
    this.need(110);
    this.cur.y -= 12;
    this.cur.page.drawText(num + "  " + title.toUpperCase(), { x: M.L, y: this.cur.y - 14.5, size: 14, font: this.f.hb, color: INK });
    this.cur.y -= 21;
    this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.8, color: BOX });
    this.cur.y -= 15;
    this.toc.push({ level: 0, text: num + ".  " + title, page: this.pageNo });
  }
  h1end() { const e = this.toc[this.toc.length - 1]; if (e && e.page == null) e.page = this.pageNo; }

  h2(num, title) {
    title = win(title);
    this.need(80);
    this.cur.y -= 8;
    this.cur.page.drawText(num + "  " + title, { x: M.L, y: this.cur.y - 11.5, size: 12, font: this.f.hb, color: INK });
    this.cur.y -= 19;
    this.toc.push({ level: 1, text: num + "  " + title, page: this.pageNo });
  }
  h2end() { const e = this.toc[this.toc.length - 1]; if (e && e.page == null) e.page = this.pageNo; }

  h3(num, title) {
    title = win(title);
    this.need(60);
    this.cur.y -= 6;
    this.cur.page.drawText(num + "  " + title, { x: M.L, y: this.cur.y - 10.5, size: 10.8, font: this.f.hb, color: INK });
    this.cur.y -= 18;
    this.toc.push({ level: 2, text: num + "  " + title, page: this.pageNo });
  }
  h3end() { const e = this.toc[this.toc.length - 1]; if (e && e.page == null) e.page = this.pageNo; }

  caption(text) {
    text = win(text);
    this.need(20);
    this.cur.y -= 2;
    for (const ln of this.wrap(text, this.f.b, 8.8, PAGE_W - M.L - M.R)) {
      this.cur.page.drawText(ln, { x: M.L, y: this.cur.y - 8.8, size: 8.8, font: this.f.b, color: INK });
      this.cur.y -= 11.5;
    }
    this.cur.y -= 7;
  }

  table(headers, rows, colw, { size = 8.7, pad = 4.5, headFill = true } = {}) {
    headers = headers.map(win);
    rows = rows.map((r) => r.map(win));
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
      if (headFill) this.cur.page.drawRectangle({ x: M.L, y: this.cur.y - headH, width: PAGE_W - M.L - M.R, height: headH, color: LIGHTFILL });
      let x = M.L;
      headers.forEach((hh, i) => {
        let ty = this.cur.y - pad - size;
        for (const ln of cellLines(hh, fH, size, cw[i])) { this.cur.page.drawText(ln, { x: x + pad, y: ty, size, font: fH, color: INK }); ty -= size + 3.4; }
        x += cw[i];
      });
      this.cur.y -= headH + 3;
      this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.9, color: BOX });
      this.cur.y -= 2.5;
    };
    drawHead();
    for (const r of rows) {
      const h = rowH(r, fB, size);
      this.need(h + 4);
      const startY = this.cur.y;
      let x = M.L;
      r.forEach((c, i) => {
        let ly = startY - pad - size;
        for (const ln of cellLines(c, fB, size, cw[i])) { this.cur.page.drawText(ln, { x: x + pad, y: ly, size, font: fB, color: INK }); ly -= size + 3.4; }
        x += cw[i];
      });
      this.cur.y = startY - h;
      this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: 0.4, color: RULE });
    }
    this.cur.y -= 9;
  }

  code(lines, { size = 8.3, leading = 11.2 } = {}) {
    lines = lines.map(win);
    const wMax = PAGE_W - M.L - M.R;
    for (const raw of lines) {
      const lns = this.wrap(raw, this.f.c, size, wMax - 12);
      this.need(lns.length * leading + 4);
      const topY = this.cur.y;
      this.cur.page.drawRectangle({ x: M.L, y: topY - lns.length * leading + 4, width: wMax, height: lns.length * leading, color: LIGHTFILL });
      let y = topY - size;
      for (const ln of lns) { this.cur.page.drawText(ln, { x: M.L + 6, y, size, font: this.f.c, color: INK }); y -= leading; }
      this.cur.y = y - 1;
    }
    this.cur.y -= 8;
  }

  quoteBlock(text, { size = 9.9, leading = 13.8 } = {}) {
    text = win(text);
    const maxW = PAGE_W - M.L - M.R - 18;
    const lines = this.wrap(text, this.f.b, size, maxW);
    this.need(lines.length * leading + 10);
    const top = this.cur.y;
    this.cur.page.drawRectangle({ x: M.L + 2, y: top - lines.length * leading + 3, width: 2, height: lines.length * leading, color: BOX });
    let y = top - size;
    for (const ln of lines) { this.cur.page.drawText(ln, { x: M.L + 14, y, size, font: this.f.b, color: INK }); y -= leading; }
    this.cur.y = y - 6;
  }

  spacer(h) { this.need(h); this.cur.y -= h; }

  center(text, { font = "b", size = 11, yOff = 0, gap = 0 } = {}) {
    text = win(text);
    const fnt = this.f[font];
    const tw = fnt.widthOfTextAtSize(text, size);
    this.need(size + 16);
    this.cur.page.drawText(text, { x: (PAGE_W - tw) / 2, y: this.cur.y - size - yOff, size, font: fnt, color: INK });
    this.cur.y -= size + gap;
  }

  hr(weight = 0.6) {
    this.cur.page.drawLine({ start: { x: M.L, y: this.cur.y }, end: { x: PAGE_W - M.R, y: this.cur.y }, thickness: weight, color: BOX });
    this.cur.y -= 10;
  }

  // ── chrome ──
  finalize({ frontStart = 2, arabicStartAt = 1 } = {}) {
    // printed numbers: cover none; front matter (styles "front") roman starting at 1
    // body pages arabic starting at arabicStartAt
    const romans = ["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv","xvi"];
    let frontIdx = 0, bodyIdx = arabicStartAt - 1;
    for (const pg of this.pages) {
      pg.no = null;
      if (pg.style === "body") { bodyIdx++; pg.no = String(bodyIdx); }
      else if (pg.style === "front") { pg.no = romans[frontIdx++] ?? String(frontIdx); }
      const p = pg.page;
      if (pg.style === "cover" || pg.no === null) continue;
      p.drawLine({ start: { x: M.L, y: PAGE_H - 46 }, end: { x: PAGE_W - M.R, y: PAGE_H - 46 }, thickness: 0.5, color: RULE });
      p.drawText("VERITAS - PROJECT DOCUMENTATION", { x: M.L, y: PAGE_H - 41, size: 7.2, font: this.f.hb, color: INK, letterSpacing: 0.6 });
      const rt = pg.no;
      p.drawText(rt, { x: PAGE_W - M.R - this.width(rt, this.f.h, 8.4), y: PAGE_H - 41, size: 8.4, font: this.f.h, color: INK });
      p.drawText("Md Ali - B.Sc. Data Science - SNGCC", { x: M.L, y: 36, size: 7.2, font: this.f.h, color: INK });
      p.drawText(rt, { x: PAGE_W - M.R - this.width(rt, this.f.h, 8.4), y: 36, size: 8.4, font: this.f.h, color: INK });
    }
  }
}
