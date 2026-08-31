import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

function sanitize(text: string): string {
  return text
    .replace(/[\u2500-\u257F\u2550-\u256C\u250A\u2551\u2554\u2557\u255A\u255D\u2560\u2563\u2566\u2569\u256C]/g, "-")
    .replace(/[\u25B8\u25B9\u25BA\u25C6\u25CF\u25A0\u25A1\u25AA\u25AB]/g, "'")
    .replace(/[\u2018\u2019\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .replace(/[\u2713\u2714\u2715\u2716\u2718\u2605\u2606\u2666\u2660\u2663\u2665]/g, "*")
    .replace(/[\u2190\u2192\u2191\u2193\u2194\u2195]/g, "<>")
    .replace(/[\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8]/g, "?")
    .replace(/[\u2220\u00B0\u00B1\u221E\u2211\u220F\u222B\u221A\u2207\u2208\u2209\u2282\u2283\u222A]/g, "=")
    .replace(/[\u00D7\u00F7]/g, "x")
    .replace(/[\u00E9\u00E8\u00EA]/g, "e")
    .replace(/[\u00E0\u00E1\u00E2]/g, "a")
    .replace(/[\u00F4\u00F6]/g, "o")
    .replace(/[\u00FC]/g, "u")
    .replace(/[^\x00-\x7F]/g, "?");
}

const files = [
  { num: "01", name: "src/convex/analyzeNews.ts", desc: "NLP-based fake news detection engine", path: "src/convex/analyzeNews.ts" },
  { num: "02", name: "src/convex/schema.ts", desc: "Database schema for analysis storage", path: "src/convex/schema.ts" },
  { num: "03", name: "src/convex/analyses.ts", desc: "Backend queries and mutations", path: "src/convex/analyses.ts" },
  { num: "04", name: "src/components/CredibilityGauge.tsx", desc: "Animated SVG confidence gauge", path: "src/components/CredibilityGauge.tsx" },
  { num: "05", name: "src/components/StatsView.tsx", desc: "Statistics dashboard with charts", path: "src/components/StatsView.tsx" },
  { num: "06", name: "src/components/MethodologyView.tsx", desc: "Academic methodology documentation", path: "src/components/MethodologyView.tsx" },
];

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;

  // ── COVER PAGE ──
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  page.drawText("Veritas", {
    x: margin, y: pageHeight - 120, size: 42, font: helveticaBold,
    color: rgb(0.06, 0.09, 0.17),
  });
  page.drawText("AI-Powered Misinformation Detection System", {
    x: margin, y: pageHeight - 165, size: 16, font: helvetica,
    color: rgb(0.4, 0.45, 0.55),
  });
  page.drawLine({
    start: { x: margin, y: pageHeight - 185 },
    end: { x: pageWidth - margin, y: pageHeight - 185 },
    thickness: 2, color: rgb(0.06, 0.09, 0.17),
  });

  const meta = ["BSc Data Science - Third Year Project", "Source Code Documentation", "August 2026"];
  let my = pageHeight - 220;
  for (const line of meta) {
    page.drawText(sanitize(line), { x: margin, y: my, size: 12, font: helvetica, color: rgb(0.5, 0.55, 0.6) });
    my -= 20;
  }

  my -= 30;
  page.drawText(sanitize("Contents"), { x: margin, y: my, size: 18, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
  my -= 10;
  page.drawLine({ start: { x: margin, y: my }, end: { x: 150, y: my }, thickness: 1, color: rgb(0.06, 0.09, 0.17) });
  my -= 25;

  for (const f of files) {
    page.drawText(sanitize(`${f.num}. ${f.name}`), { x: margin + 10, y: my, size: 11, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
    my -= 16;
    page.drawText(sanitize(`   ${f.desc}`), { x: margin + 10, y: my, size: 10, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
    my -= 22;
  }

  // ── FILE PAGES ──
  for (const f of files) {
    const code = fs.readFileSync(f.path, "utf-8");
    const lines = code.split("\n");

    page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Header
    page.drawRectangle({
      x: margin, y: pageHeight - 80, width: 40, height: 40,
      color: rgb(0.23, 0.51, 0.96),
    });
    page.drawText(sanitize(f.num), {
      x: margin + 12, y: pageHeight - 67, size: 18, font: helveticaBold, color: rgb(1, 1, 1),
    });
    page.drawText(sanitize(f.name), {
      x: margin + 50, y: pageHeight - 55, size: 14, font: helveticaBold, color: rgb(0.06, 0.09, 0.17),
    });
    page.drawText(sanitize(f.desc), {
      x: margin + 50, y: pageHeight - 72, size: 10, font: helvetica, color: rgb(0.45, 0.5, 0.55),
    });
    page.drawLine({
      start: { x: margin, y: pageHeight - 90 }, end: { x: pageWidth - margin, y: pageHeight - 90 },
      thickness: 1, color: rgb(0.8, 0.83, 0.87),
    });

    // Code
    const fontSize = 7;
    const lineHeight = 9.5;
    let y = pageHeight - 110;
    let lineNum = 1;

    for (const rawLine of lines) {
      if (y < margin + 20) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawText(sanitize(f.name + " (continued)"), {
          x: margin, y: pageHeight - 40, size: 9, font: helvetica, color: rgb(0.5, 0.55, 0.6),
        });
        page.drawLine({
          start: { x: margin, y: pageHeight - 48 }, end: { x: pageWidth - margin, y: pageHeight - 48 },
          thickness: 0.5, color: rgb(0.85, 0.87, 0.9),
        });
        y = pageHeight - 65;
      }

      const ln = String(lineNum).padStart(4, " ");
      page.drawText(ln, { x: margin, y, size: 6, font, color: rgb(0.6, 0.63, 0.67) });

      const safeLine = sanitize(rawLine);
      const displayLine = safeLine.length > 95 ? safeLine.slice(0, 95) + "..." : safeLine;

      let lineColor = rgb(0.12, 0.14, 0.18);
      const trimmed = rawLine.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        lineColor = rgb(0.5, 0.55, 0.6);
      } else if (/^(import|export|const|function|async|return|if|else|for|type|interface) /.test(trimmed)) {
        lineColor = rgb(0.4, 0.25, 0.65);
      }

      page.drawText(displayLine, { x: margin + 30, y, size: fontSize, font, color: lineColor });
      y -= lineHeight;
      lineNum++;
    }

    // Footer
    const allPages = pdfDoc.getPages();
    const lastPage = allPages[allPages.length - 1];
    lastPage.drawText(sanitize("Veritas - Project Source Code"), {
      x: margin, y: margin - 5, size: 7, font: helvetica, color: rgb(0.65, 0.68, 0.72),
    });
  }

  // ── FINAL PAGE ──
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  page.drawText(sanitize("Veritas"), {
    x: margin, y: pageHeight / 2 + 40, size: 36, font: helveticaBold, color: rgb(0.06, 0.09, 0.17),
  });
  page.drawText(sanitize("AI-Powered Misinformation Detection System"), {
    x: margin, y: pageHeight / 2 + 10, size: 14, font: helvetica, color: rgb(0.4, 0.45, 0.55),
  });
  page.drawText(sanitize("BSc Data Science Third Year Project - August 2026"), {
    x: margin, y: pageHeight / 2 - 15, size: 10, font: helvetica, color: rgb(0.55, 0.6, 0.65),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("Veritas-Project-Source-Code.pdf", pdfBytes);
  console.log("PDF generated: Veritas-Project-Source-Code.pdf");
  console.log("Size:", (pdfBytes.length / 1024).toFixed(1), "KB");
}

generatePDF().catch(console.error);
