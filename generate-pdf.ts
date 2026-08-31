import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

function sanitize(text: string): string {
  return text.replace(/[\u2500-\u257F\u2550-\u256C]/g, "-").replace(/[\u2018\u2019\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[\u2026]/g, "...").replace(/[^\x00-\x7F]/g, "?");
}

const files = [
  { num: "01", name: "src/convex/analyzeNews.ts", desc: "NLP engine v3 - category breakdowns, keyword detection", path: "src/convex/analyzeNews.ts" },
  { num: "02", name: "src/convex/schema.ts", desc: "Database schema with breakdown fields", path: "src/convex/schema.ts" },
  { num: "03", name: "src/convex/analyses.ts", desc: "Backend CRUD operations", path: "src/convex/analyses.ts" },
  { num: "04", name: "src/components/CredibilityGauge.tsx", desc: "Animated SVG confidence gauge", path: "src/components/CredibilityGauge.tsx" },
  { num: "05", name: "src/components/StatsView.tsx", desc: "Statistics with Recharts", path: "src/components/StatsView.tsx" },
  { num: "06", name: "src/components/MethodologyView.tsx", desc: "Academic methodology docs", path: "src/components/MethodologyView.tsx" },
  { num: "07", name: "src/components/ThemeProvider.tsx", desc: "Dark mode provider", path: "src/components/ThemeProvider.tsx" },
  { num: "08", name: "src/pages/Dashboard.tsx", desc: "Main app - 10 improvements integrated", path: "src/pages/Dashboard.tsx" },
];

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50, pageWidth = 612, pageHeight = 792;
  let page: any, y: number;

  // Cover
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  page.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 8, color: rgb(0.23, 0.51, 0.96) });
  y = pageHeight - 120;
  page.drawText(sanitize("Veritas"), { x: margin, y, size: 42, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
  y -= 35;
  page.drawText(sanitize("AI-Powered Misinformation Detection - Source Code"), { x: margin, y, size: 14, font: helvetica, color: rgb(0.23, 0.51, 0.96) });
  y -= 25;
  page.drawText(sanitize("BSc Data Science Third Year Project | August 2026"), { x: margin, y, size: 11, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
  y -= 50;
  page.drawText(sanitize("Contents"), { x: margin, y, size: 16, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
  y -= 8;
  page.drawLine({ start: { x: margin, y }, end: { x: 200, y }, thickness: 1, color: rgb(0.23, 0.51, 0.96) });
  y -= 25;
  for (const f of files) {
    page.drawText(sanitize(`${f.num}. ${f.name}`), { x: margin + 10, y, size: 10, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
    y -= 14;
    page.drawText(sanitize(`   ${f.desc}`), { x: margin + 10, y, size: 9, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
    y -= 18;
  }

  // Files
  for (const f of files) {
    const code = fs.readFileSync(f.path, "utf-8");
    const lines = code.split("\n");
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({ x: margin, y: pageHeight - 80, width: 40, height: 40, color: rgb(0.23, 0.51, 0.96) });
    page.drawText(sanitize(f.num), { x: margin + 12, y: pageHeight - 67, size: 18, font: helveticaBold, color: rgb(1, 1, 1) });
    page.drawText(sanitize(f.name), { x: margin + 50, y: pageHeight - 55, size: 13, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
    page.drawText(sanitize(f.desc), { x: margin + 50, y: pageHeight - 72, size: 9, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
    page.drawLine({ start: { x: margin, y: pageHeight - 90 }, end: { x: pageWidth - margin, y: pageHeight - 90 }, thickness: 1, color: rgb(0.8, 0.83, 0.87) });

    let ly = pageHeight - 110;
    for (let i = 0; i < lines.length; i++) {
      if (ly < margin + 20) { page = pdfDoc.addPage([pageWidth, pageHeight]); page.drawText(sanitize(f.name + " (cont.)"), { x: margin, y: pageHeight - 40, size: 8, font: helvetica, color: rgb(0.5, 0.55, 0.6) }); ly = pageHeight - 60; }
      const ln = String(i + 1).padStart(4, " ");
      page.drawText(ln, { x: margin, y: ly, size: 6, font, color: rgb(0.6, 0.63, 0.67) });
      const safe = sanitize(lines[i]).slice(0, 95);
      let col = rgb(0.12, 0.14, 0.18);
      const t = lines[i].trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) col = rgb(0.5, 0.55, 0.6);
      else if (/^(import|export|const|function|async|return|if|else|for|type|interface) /.test(t)) col = rgb(0.4, 0.25, 0.65);
      page.drawText(safe, { x: margin + 30, y: ly, size: 6.5, font, color: col });
      ly -= 9;
    }
    const pages = pdfDoc.getPages();
    pages[pages.length - 1].drawText(sanitize("Veritas - Source Code"), { x: margin, y: margin - 5, size: 7, font: helvetica, color: rgb(0.65, 0.68, 0.72) });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("public/Veritas-Project-Source-Code.pdf", pdfBytes);
  console.log(`Source Code PDF: ${(pdfBytes.length / 1024).toFixed(1)} KB, ${pdfDoc.getPageCount()} pages`);
}

generatePDF().catch(console.error);
