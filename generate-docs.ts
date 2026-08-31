import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

function s(t: string): string { return t.replace(/[\u2500-\u257F\u2550-\u256C]/g, "-").replace(/[\u2018\u2019\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[\u2026]/g, "...").replace(/[^\x00-\x7F]/g, "?"); }

async function gen() {
  const doc = await PDFDocument.create();
  const h = await doc.embedFont(StandardFonts.Helvetica);
  const hb = await doc.embedFont(StandardFonts.HelveticaBold);
  const tr = await doc.embedFont(StandardFonts.TimesRoman);
  const tb = await doc.embedFont(StandardFonts.TimesRomanBold);
  const ti = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const W = 612, H = 792, M = 72, CW = W - M * 2;
  let page: any, y: number, pg = 0;

  function np() { page = doc.addPage([W, H]); y = H - M; pg++; return page; }
  function footer(ch: string) {
    page.drawRectangle({ x: 0, y: 0, width: W, height: 35, color: rgb(0.06, 0.09, 0.17) });
    page.drawText(s("VERITAS - PROJECT DOCUMENTATION"), { x: M, y: 14, size: 7, font: h, color: rgb(0.55, 0.6, 0.65) });
    page.drawText(s(ch), { x: W - M - 80, y: 14, size: 7, font: h, color: rgb(0.55, 0.6, 0.65) });
    page.drawText(String(pg), { x: W / 2 - 4, y: 14, size: 8, font: hb, color: rgb(0.8, 0.83, 0.87) });
  }
  function wrap(text: string, maxW: number, sz: number, f: any): string[] {
    const words = text.split(" "), lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(test, sz) > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }
  function txt(text: string, opts: any = {}) {
    const { x: px = M, sz = 11, f = tr, c = rgb(0.15, 0.17, 0.2), ls = 18 } = opts;
    const lines = wrap(text, CW, sz, f);
    for (const line of lines) {
      if (y < M + 50) { footer("Veritas"); np(); }
      page.drawText(s(line), { x: px, y, size: sz, font: f, color: c }); y -= ls;
    }
    y -= 4;
  }
  function h1(t: string) { y -= 10; if (y < M + 100) { footer("Veritas"); np(); } page.drawText(s(t), { x: M, y, size: 20, font: hb, color: rgb(0.06, 0.09, 0.17) }); y -= 8; page.drawLine({ start: { x: M, y }, end: { x: M + CW, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) }); y -= 25; }
  function h2(t: string) { y -= 6; if (y < M + 80) { footer("Veritas"); np(); } page.drawText(s(t), { x: M, y, size: 14, font: hb, color: rgb(0.1, 0.15, 0.22) }); y -= 22; }
  function h3(t: string) { y -= 4; page.drawText(s(t), { x: M, y, size: 11, font: hb, color: rgb(0.2, 0.25, 0.3) }); y -= 16; }
  function p(t: string) { txt(t); }
  function b(t: string) { txt("  *  " + t, { sz: 10.5, ls: 16 }); y -= 2; }
  function nl(n: number) { y -= n * 18; }

  // ── COVER ──
  np();
  page.drawRectangle({ x: 0, y: H - 8, width: W, y: H - 8, height: 8, color: rgb(0.23, 0.51, 0.96) });
  y = H - 80;
  page.drawText(s("FINAL YEAR ACADEMIC PROJECT REPORT"), { x: M, y, size: 12, font: h, color: rgb(0.23, 0.51, 0.96) });
  y -= 50; page.drawText(s("VERITAS"), { x: M, y, size: 48, font: hb, color: rgb(0.06, 0.09, 0.17) });
  y -= 35; page.drawText(s("AI-Powered Misinformation Detection System"), { x: M, y, size: 16, font: ti, color: rgb(0.23, 0.51, 0.96) });
  y -= 10; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) });
  y -= 50;
  for (const [l, v] of [["Project Type", "Web Application - AI-Powered Misinformation Detection"], ["Stack", "React 19, TypeScript, Convex, Tailwind CSS v4, Framer Motion"], ["Analysis Engine", "Custom NLP Pipeline with 12 Red Flag + 9 Green Flag Categories"], ["New Features v3", "Keyword Highlighting, Category Breakdown, Dark Mode, Export, Share"]]) {
    page.drawText(s(l), { x: M + 60, y, size: 10, font: hb, color: rgb(0.4, 0.45, 0.5) }); y -= 16;
    page.drawText(s(v), { x: M + 60, y, size: 11, font: h, color: rgb(0.15, 0.18, 0.22) }); y -= 24;
  }
  y -= 20; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0.8, 0.83, 0.87) });
  y -= 30;
  for (const [l, v] of [["Prepared By", "BSc Data Science Student"], ["Submitted To", "Department Project Evaluation Committee"], ["Academic Year", "2026-2027"]]) {
    page.drawText(s(l), { x: W / 2 - 50, y, size: 9, font: h, color: rgb(0.45, 0.5, 0.55) }); y -= 14;
    page.drawText(s(v), { x: W / 2 - 50, y, size: 10, font: hb, color: rgb(0.15, 0.18, 0.22) }); y -= 18;
  }

  // ── TOC ──
  footer("Table of Contents"); np();
  page.drawText(s("TABLE OF CONTENTS"), { x: M, y, size: 20, font: hb, color: rgb(0.06, 0.09, 0.17) }); y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: M + CW, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) }); y -= 30;
  const toc = [
    ["Chapter 1", "Abstract", true], ["Chapter 2", "Introduction", true],
    ["", "2.1 Problem Statement", false], ["", "2.2 Objectives", false], ["", "2.3 Design Philosophy", false],
    ["", "2.4 Scope", false], ["", "2.5 Challenges", false], ["", "2.6 Contribution", false],
    ["Chapter 3", "System Architecture", true], ["", "3.1 Architecture", false], ["", "3.2 Tech Stack", false],
    ["", "3.3 Database Design", false], ["", "3.4 Key Modules", false],
    ["Chapter 4", "Methods and Algorithms", true], ["", "4.1 Three-Layer Pipeline", false],
    ["", "4.2 Red Flag Detection (12 Categories)", false], ["", "4.3 Green Flag Detection (9 Categories)", false],
    ["", "4.4 Severity-Weighted Scoring", false], ["", "4.5 Verdict Algorithm", false],
    ["Chapter 5", "New Features (v3 Improvements)", true],
    ["", "5.1 Keyword Highlighting", false], ["", "5.2 Category Breakdown Chart", false],
    ["", "5.3 Export & Share", false], ["", "5.4 Dark Mode", false],
    ["", "5.5 Media Literacy Tips", false], ["", "5.6 Keyboard Shortcuts", false],
    ["", "5.7 Enhanced Sample Articles", false], ["", "5.8 Analysis Counter", false],
    ["Chapter 6", "Project Analysis", true], ["", "6.1 Performance", false], ["", "6.2 UX Evaluation", false],
    ["", "6.3 Strengths", false], ["", "6.4 Limitations", false],
    ["Chapter 7", "Final Results", true], ["Chapter 8", "Conclusion", true],
    ["Chapter 9", "Future Scope", true], ["Chapter 10", "References", true], ["Appendices", "Glossary & Setup", true],
  ];
  for (const [ch, title, isCh] of toc) {
    const indent = isCh ? 0 : 20; const font = isCh ? hb : h; const label = isCh ? `${ch} \u2014 ${title}` : title;
    page.drawText(s(label), { x: M + indent, y, size: isCh ? 11 : 10, font, color: rgb(0.15, 0.18, 0.22) });
    y -= isCh ? 20 : 17;
  }

  // ── CH1: ABSTRACT ──
  footer("Ch1 - Abstract"); np(); h1("Chapter 1 - Abstract");
  p("Veritas is an AI-powered misinformation detection system designed to help the general public identify fake news. The system employs a multi-layered Natural Language Processing pipeline analyzing linguistic patterns, source credibility, and structural elements to determine content authenticity.");
  p("Unlike black-box ML models, Veritas uses a transparent rule-based approach with severity-weighted scoring. Every decision is traceable to specific patterns, making it an explainable AI tool suitable for education and academia.");
  p("The system analyzes 12 red flag categories and 9 green flag categories with severity weights. The verdict uses a calibrated ratio-based algorithm producing confidence scores between 35% and 95%.");
  p("Version 3 introduces significant improvements: keyword highlighting that shows exactly which words triggered detection, category breakdown charts for visual analysis, dark mode, export/share functionality, media literacy tips, keyboard shortcuts, and enhanced sample articles covering science, health, finance, politics, environment, and entertainment.");

  // ── CH2: INTRODUCTION ──
  footer("Ch2 - Introduction"); np(); h1("Chapter 2 - Introduction");
  h2("2.1 Problem Statement");
  p("Digital media proliferation has created unprecedented misinformation challenges. MIT research shows false information spreads 6x faster than truth on social media. Traditional fact-checking cannot scale. Current automated systems use black-box ML models that provide no explanation, undermining trust and educational value.");
  h2("2.2 Objectives");
  b("Develop automated misinformation detection using NLP techniques");
  b("Implement transparent, explainable analysis with traceable patterns");
  b("Provide clear verdicts with confidence scores");
  b("Create intuitive interface accessible to the general public");
  b("Build complete app with history, stats, and methodology documentation");
  b("Add keyword highlighting, category breakdowns, export, and dark mode (v3)");
  h2("2.3 Design Philosophy");
  p("Transparency: Every decision explained through specific flags. Accessibility: No training required, paste-and-click workflow. Explainability Over Accuracy: Rule-based over ML because interpretability matters more than marginal accuracy gains in educational contexts.");
  h2("2.4 Scope");
  p("v3 scope: text analysis, 12+9 pattern categories, severity scoring, history, stats, methodology docs, keyword highlighting, category breakdown charts, dark mode, export/share, media literacy tips, keyboard shortcuts, 6 sample articles across diverse topics.");
  h2("2.5 Challenges");
  b("Linguistic ambiguity: satire vs real news shares patterns");
  b("Evolving tactics: misinformation creators adapt constantly");
  b("Context dependency: same statement factual in one context, misleading in another");
  b("Real-time requirement: must process quickly without sacrificing reliability");
  h2("2.6 Contribution");
  b("Demonstrates rule-based NLP achieves meaningful results without labeled datasets");
  b("Provides transparent pipeline suitable for academic use");
  b("Accessible interface bringing detection to the general public");
  b("Comprehensive methodology documentation for replication");
  b("Practical BSc Data Science application to real-world problem");

  // ── CH3: ARCHITECTURE ──
  footer("Ch3 - Architecture"); np(); h1("Chapter 3 - System Architecture");
  h2("3.1 Overall Architecture");
  p("Three-tier architecture: Presentation (React 19 + TypeScript), Application (Convex serverless NLP engine + auth), Data (Convex real-time database). Frontend communicates via Convex reactive queries and mutations.");
  h2("3.2 Technology Stack");
  b("React 19 with TypeScript for type-safe development");
  b("Vite for fast builds and HMR");
  b("Tailwind CSS v4 with custom Glassmorphism utilities + dark mode");
  b("Shadcn/UI for accessible base components");
  b("Framer Motion for animations");
  b("Recharts for statistics visualization");
  b("Convex serverless backend with real-time sync");
  b("next-themes for dark/light mode toggling");
  b("Lucide React for icons");
  b("Custom NLP pipeline with weighted regex pattern matching");
  h2("3.3 Database Design");
  p("Users table: auth data (name, email, role, anonymous status). Analyses table: userId, inputText, inputType, verdict, confidence, summary, redFlags, greenFlags, reasoning, triggeredKeywords, categoryBreakdown (category/type/score/maxScore/findings), wordCount, createdAt. Indexed by userId + createdAt.");
  h2("3.4 Key Modules");
  b("analyzeNews.ts: Core NLP engine with category breakdowns and keyword detection");
  b("Dashboard.tsx: Main interface with 5 views, dark mode, export, share, tips, shortcuts");
  b("CredibilityGauge.tsx: Animated SVG circular gauge");
  b("StatsView.tsx: Pie/bar charts with Recharts");
  b("MethodologyView.tsx: 8-section academic documentation");
  b("ThemeProvider.tsx: Dark mode via next-themes");

  // ── CH4: METHODS ──
  footer("Ch4 - Methods"); np(); h1("Chapter 4 - Methods and Algorithms");
  h2("4.1 Three-Layer Pipeline");
  p("Layer 1 - Pattern Extraction: 70+ regex patterns across 21 categories with severity weights 1-8. Layer 2 - Category Scoring: weighted aggregation per category with tiered thresholds (30+ high, 15+ moderate, 5+ mild). Layer 3 - Verdict: ratio-based calculation with calibrated thresholds (0.65 = definitive, 0.1 difference = leaning, balanced = uncertain).");
  h2("4.2 Red Flag Detection (12 Categories)");
  b("Sensationalist Language (weight 4-8): emotionally manipulative words");
  b("Clickbait Patterns (weight 5-7): headline manipulation tactics");
  b("Anonymous Sourcing (weight 3-7): vague attribution");
  b("Fear-Mongering (weight 5-7): alarmist framing");
  b("Conspiracy Language (weight 5-7): conspiratorial rhetoric");
  b("Excessive Caps, Emoji Overuse, Multi-Exclamation, Urgency Tactics");
  b("Missing Citations, Inappropriate Length, ALL CAPS Emphasis");
  h2("4.3 Green Flag Detection (9 Categories)");
  b("Named Sources (weight 4-7), Data/Statistics (16 pts), Institutional References (22 pts)");
  b("Temporal Specificity (14 pts), Balanced Reporting (18 pts)");
  b("Journalistic Structure (16 pts), Neutral Tone (12 pts), Appropriate Length (6 pts), Named Quotes (14 pts)");
  h2("4.4 Severity-Weighted Scoring");
  p("Each pattern carries a weight 1-8 reflecting diagnostic significance. Example: 'they don't want you to know' = weight 8 (high), 'urgent' = weight 4 (moderate). Category scores use tiered thresholds preventing false alarms from isolated low-severity matches.");
  h2("4.5 Verdict Algorithm");
  b("Red ratio >= 0.65: Likely Fake (55-95% confidence)");
  b("Green ratio >= 0.65: Likely Real (55-95% confidence)");
  b("Red exceeds green by >0.1: Leaning Fake (42-78%)");
  b("Green exceeds red by >0.1: Leaning Real (42-78%)");
  b("Balanced (diff <0.1): Uncertain (35-50%)");
  b("Confidence capped 35-95% to prevent overconfident claims");

  // ── CH5: NEW FEATURES ──
  footer("Ch5 - New Features"); np(); h1("Chapter 5 - New Features (v3 Improvements)");
  h2("5.1 Keyword Highlighting");
  p("The system identifies specific words and phrases that triggered red flag detection and highlights them directly in the analyzed text. Users can see exactly which words like 'EXPOSED', 'miracle cure', 'big pharma', or 'share before they delete' were flagged. This provides immediate visual feedback and educational value, helping users recognize misinformation patterns in future content.");
  h2("5.2 Category Breakdown Chart");
  p("Each analysis now returns a category-level breakdown showing how much each detection category contributed to the final verdict. The results page displays animated horizontal bars for each category (Sensationalism, Clickbait, Source Quality, Balanced Reporting, etc.) with percentage scores. This transforms the black-box verdict into an interpretable, visual analysis.");
  h2("5.3 Export & Share");
  p("Users can export analysis results as a formatted text file (.txt) containing the full verdict, confidence, summary, reasoning, red/green flags, and analyzed content. The Share button uses the Web Share API on mobile devices or falls back to clipboard copy on desktop. Results can be shared via WhatsApp, email, or social media.");
  h2("5.4 Dark Mode");
  p("A toggle button in the navigation bar switches between light and dark themes. The dark theme uses deep navy backgrounds with adjusted glassmorphism panels, ensuring readability and visual appeal in both modes. Implemented via next-themes with CSS custom properties for seamless transitions.");
  h2("5.5 Media Literacy Tips");
  p("The analyze view displays rotating media literacy tips every 8 seconds. Tips include advice like checking sources, looking for named individuals, being wary of ALL CAPS, verifying statistics, and recognizing urgency tactics. This educates users while they use the tool, turning the app into a learning resource.");
  h2("5.6 Keyboard Shortcuts");
  p("Ctrl+Enter (or Cmd+Enter on Mac) triggers analysis when the textarea is focused and content is entered. The shortcut indicator is visible next to the paste/clear buttons, improving power-user efficiency.");
  h2("5.7 Enhanced Sample Articles");
  p("The system now includes 6 sample articles covering diverse topics: Science (real), Health (fake), Finance (real), Politics (fake), Environment (real), and Entertainment (fake). Each sample shows a category badge and verdict indicator, enabling users to quickly test the system across different misinformation domains.");
  h2("5.8 Analysis Counter");
  p("The landing page displays a dynamic analysis counter showing the total number of articles analyzed through the system. This provides social proof and demonstrates the system's usage to visitors and academic evaluators.");

  // ── CH6: ANALYSIS ──
  footer("Ch6 - Analysis"); np(); h1("Chapter 6 - Project Analysis");
  h2("6.1 Technical Performance");
  b("Analysis Speed: under 100ms on standard hardware");
  b("Pattern Coverage: 70+ patterns across 21 categories");
  b("Scalability: Convex auto-scales for concurrent users");
  b("Type Safety: Full TypeScript across frontend and backend");
  b("Dark Mode: Seamless theme switching without layout shift");
  h2("6.2 UX Evaluation");
  b("Two-step analysis: paste and click");
  b("Keyword highlighting provides immediate visual feedback");
  b("Category breakdown transforms verdict into interpretable analysis");
  b("Export/share enables result distribution");
  b("Media literacy tips educate during use");
  b("6 sample articles cover diverse domains");
  h2("6.3 Strengths");
  b("Full transparency: every decision traceable to patterns");
  b("No external API dependencies for core analysis");
  b("Instant usability with guest access");
  b("Dark mode for user preference");
  b("Export/share for result distribution");
  b("Mobile responsive across all devices");
  h2("6.4 Limitations");
  b("Text-only analysis (no image/video)");
  b("Pattern maintenance requires manual updates");
  b("No external fact-check cross-referencing");
  b("English only");
  b("Cannot fully understand satire or nuanced context");

  // ── CH7: RESULTS ──
  footer("Ch7 - Results"); np(); h1("Chapter 7 - Final Results");
  p("Veritas v3 successfully implements all planned features:");
  b("Text/URL analysis with instant credibility assessment");
  b("Animated credibility gauge with color-coded verdict");
  b("Keyword highlighting showing exact triggered words");
  b("Category breakdown chart with visual bars");
  b("6 diverse sample articles (science, health, finance, politics, environment, entertainment)");
  b("Export results as formatted text file");
  b("Share via Web Share API or clipboard");
  b("Dark/light mode toggle");
  b("Rotating media literacy tips");
  b("Ctrl+Enter keyboard shortcut");
  b("Analysis history with full detail reload");
  b("Statistics dashboard with pie/bar charts");
  b("Methodology documentation (8 sections)");

  // ── CH8: CONCLUSION ──
  footer("Ch8 - Conclusion"); np(); h1("Chapter 8 - Conclusion");
  p("Veritas demonstrates that rule-based NLP can effectively detect misinformation while maintaining full transparency. The three-layer pipeline processes content through pattern extraction, severity scoring, and verdict calculation with comprehensive coverage across 21 categories.");
  p("Version 3 significantly enhances the system with keyword highlighting, category breakdowns, dark mode, export/share, media literacy tips, keyboard shortcuts, and expanded samples. These improvements transform Veritas from a functional tool into a polished, educational platform.");
  p("The system represents a practical application of BSc Data Science concepts, combining NLP, web development, database design, and UX design into a cohesive project addressing real-world misinformation challenges.");

  // ── CH9: FUTURE ──
  footer("Ch9 - Future Scope"); np(); h1("Chapter 9 - Future Scope");
  b("Fine-tuned BERT/RoBERTa classifiers on LIAR dataset");
  b("Google Fact Check Tools API integration");
  b("TF-IDF topic modeling for domain-specific detection");
  b("Image forensics for manipulation detection");
  b("Multi-language support (Hindi, Spanish)");
  b("Chrome extension for in-browser analysis");
  b("Social media API integration");
  b("User feedback loop for continuous improvement");

  // ── CH10: REFERENCES ──
  footer("Ch10 - References"); np(); h1("Chapter 10 - References");
  const refs = [
    "[1] Vosoughi et al. (2018). The spread of true and false news online. Science.",
    "[2] Wang (2017). Liar Liar Pants on Fire: Fake News Detection Dataset. arXiv.",
    "[3] MIT Media Lab. Detecting and Tracking Fake News.",
    "[4] First Draft News. A Field Guide to Misinformation.",
    "[5] Stanford Internet Observatory. Virality Project.",
    "[6] Reuters Institute. Digital News Report: Trust and Credibility.",
    "[7] MediaWise. Teen Media Literacy Research.",
    "[8] Allcott & Gentzkow (2017). Social Media and Fake News. JEP.",
    "[9] Shu et al. (2017). Fake News Detection on Social Media.",
    "[10] Devlin et al. (2019). BERT: Pre-training Transformers. NAACL.",
    "[11] Convex Documentation. https://docs.convex.dev",
    "[12] React Documentation. https://react.dev",
    "[13] Tailwind CSS. https://tailwindcss.com",
    "[14] Framer Motion. https://framer.com/motion",
    "[15] next-themes. https://github.com/pacocoursey/next-themes",
  ];
  for (const r of refs) { txt(r, { sz: 10, ls: 16 }); y -= 2; }

  // ── APPENDICES ──
  footer("Appendices"); np(); h1("Appendices");
  h2("A. Glossary");
  for (const [t, d] of [["NLP", "Natural Language Processing"], ["Regex", "Regular Expression pattern matching"], ["Severity Weight", "Numeric value 1-8 per pattern"], ["Red Flag", "Misinformation indicator"], ["Green Flag", "Credibility indicator"], ["Confidence Score", "35-95% certainty percentage"], ["Glassmorphism", "Translucent panel design style"], ["Convex", "Serverless backend platform"], ["Dark Mode", "Low-light UI theme"]]) {
    b(`${t}: ${d}`); y -= 2;
  }
  h2("B. System Requirements");
  b("Modern browser (Chrome, Firefox, Safari, Edge)");
  b("Internet connection for Convex sync");
  b("Minimum 320px width (mobile responsive)");
  b("No installation required - fully web-based");
  h2("C. Installation");
  b("Clone repository: git clone <url>");
  b("Install: bun install");
  b("Dev server: bun run dev");
  b("Convex: bun convex dev");
  b("Open: http://localhost:5173");

  // Final page
  page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: rgb(0.23, 0.51, 0.96) });
  y = H / 2 + 60;
  page.drawText(s("Veritas"), { x: M, y, size: 42, font: hb, color: rgb(0.06, 0.09, 0.17) });
  y -= 40; page.drawText(s("AI-Powered Misinformation Detection"), { x: M, y, size: 14, font: ti, color: rgb(0.23, 0.51, 0.96) });
  y -= 50; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0.8, 0.83, 0.87) });
  y -= 30; page.drawText(s("BSc Data Science - Third Year Project - 2026-2027"), { x: M, y, size: 12, font: h, color: rgb(0.45, 0.5, 0.55) });

  const pdf = await doc.save();
  fs.writeFileSync("public/Veritas-Project-Documentation.pdf", pdf);
  console.log(`Documentation PDF: ${(pdf.length / 1024).toFixed(1)} KB, ${doc.getPageCount()} pages`);
}

gen().catch(console.error);
