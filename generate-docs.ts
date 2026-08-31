import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import fs from "fs";

function s(text: string): string {
  return text
    .replace(/[\u2500-\u257F\u2550-\u256C]/g, "-")
    .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .replace(/[\u00E9]/g, "e")
    .replace(/[^\x00-\x7F]/g, "?");
}

async function generate() {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);
  const courierBold = await doc.embedFont(StandardFonts.CourierBold);
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  const W = 612, H = 792;
  const M = 72;
  const CW = W - M * 2;
  let page: any;
  let y: number;
  let pageNum = 0;

  function newPage() {
    page = doc.addPage([W, H]);
    y = H - M;
    pageNum++;
    return page;
  }

  function drawFooter(chapterName: string) {
    page.drawRectangle({ x: 0, y: 0, width: W, height: 35, color: rgb(0.06, 0.09, 0.17) });
    page.drawText(s("VERITAS - PROJECT DOCUMENTATION"), {
      x: M, y: 14, size: 7, font: helvetica, color: rgb(0.55, 0.6, 0.65),
    });
    page.drawText(s(chapterName), {
      x: W - M - 100, y: 14, size: 7, font: helvetica, color: rgb(0.55, 0.6, 0.65),
    });
    page.drawText(String(pageNum), {
      x: W / 2 - 4, y: 14, size: 8, font: helveticaBold, color: rgb(0.8, 0.83, 0.87),
    });
  }

  function drawText(text: string, options: { x?: number; y?: number; size?: number; font?: any; color?: any; lineSpacing?: number } = {}) {
    const { x: px = M, y: py = y, size: sz = 11, font: f = timesRoman, color: c = rgb(0.15, 0.17, 0.2), lineSpacing: ls = 18 } = options;
    const lines = wrapText(text, CW, sz, f);
    let ly = py;
    for (const line of lines) {
      if (ly < M + 50) {
        drawFooter("Veritas");
        newPage();
        ly = y;
      }
      page.drawText(s(line), { x: px, y: ly, size: sz, font: f, color: c });
      ly -= ls;
    }
    y = ly;
    return ly;
  }

  function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [""];
  }

  function heading(text: string, level: 1 | 2 | 3 = 1) {
    if (level === 1) {
      y -= 10;
      if (y < M + 100) { drawFooter("Veritas"); newPage(); }
      page.drawText(s(text), { x: M, y, size: 20, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
      y -= 8;
      page.drawLine({ start: { x: M, y }, end: { x: M + CW, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) });
      y -= 25;
    } else if (level === 2) {
      y -= 6;
      if (y < M + 80) { drawFooter("Veritas"); newPage(); }
      page.drawText(s(text), { x: M, y, size: 14, font: helveticaBold, color: rgb(0.1, 0.15, 0.22) });
      y -= 22;
    } else {
      y -= 4;
      page.drawText(s(text), { x: M, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });
      y -= 16;
    }
  }

  function paragraph(text: string) {
    drawText(text, { font: timesRoman, size: 11, lineSpacing: 18 });
    y -= 4;
  }

  function bullet(text: string) {
    drawText("  *  " + text, { font: timesRoman, size: 10.5, lineSpacing: 16 });
    y -= 2;
  }

  function emptyLines(n: number) { y -= n * 18; }

  // ═══════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════
  page = newPage();

  // Blue accent bar at top
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: rgb(0.23, 0.51, 0.96) });

  y = H - 80;
  page.drawText(s("FINAL YEAR ACADEMIC PROJECT REPORT"), {
    x: M, y, size: 12, font: helvetica, color: rgb(0.23, 0.51, 0.96),
  });

  y -= 50;
  page.drawText(s("VERITAS"), {
    x: M, y, size: 48, font: helveticaBold, color: rgb(0.06, 0.09, 0.17),
  });

  y -= 35;
  page.drawText(s("AI-Powered Misinformation Detection System"), {
    x: M, y, size: 16, font: timesItalic, color: rgb(0.23, 0.51, 0.96),
  });

  y -= 10;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) });

  y -= 50;
  const info = [
    ["Project Type", "Web Application - AI-Powered Misinformation Detection"],
    ["Technology Stack", "React 19, TypeScript, Convex, Tailwind CSS v4, Framer Motion"],
    ["Backend", "Convex Serverless - NLP Analysis Engine"],
    ["Frontend", "React + Vite + Shadcn/UI + Glassmorphism Theme"],
    ["Academic Year", "2026-2027"],
  ];

  for (const [label, value] of info) {
    page.drawText(s(label), { x: M + 60, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });
    y -= 16;
    page.drawText(s(value), { x: M + 60, y, size: 11, font: helvetica, color: rgb(0.15, 0.18, 0.22) });
    y -= 24;
  }

  y -= 20;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0.8, 0.83, 0.87) });

  y -= 30;
  const submitInfo = [
    ["Prepared By", "BSc Data Science Student"],
    ["Submitted To", "Department Project Evaluation Committee"],
    ["Academic Year", "2026-2027"],
  ];
  for (const [label, value] of submitInfo) {
    page.drawText(s(label), { x: W / 2 - 50, y, size: 9, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
    y -= 14;
    page.drawText(s(value), { x: W / 2 - 50, y, size: 10, font: helveticaBold, color: rgb(0.15, 0.18, 0.22) });
    y -= 18;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Table of Contents");
  newPage();

  page.drawText(s("TABLE OF CONTENTS"), { x: M, y, size: 20, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
  y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: M + CW, y }, thickness: 2, color: rgb(0.23, 0.51, 0.96) });
  y -= 30;

  const toc = [
    ["Chapter 1", "Abstract", "1"],
    ["Chapter 2", "Introduction", "2"],
    ["", "2.1 Problem Statement", "2"],
    ["", "2.2 Objectives of the System", "2"],
    ["", "2.3 Design Philosophy", "3"],
    ["", "2.4 Scope of the Project", "3"],
    ["", "2.5 Challenges in Misinformation Detection", "3"],
    ["", "2.6 Contribution and Impact", "4"],
    ["Chapter 3", "System Architecture and Design", "4"],
    ["", "3.1 Overall Architecture", "4"],
    ["", "3.2 Technology Stack", "5"],
    ["", "3.3 Database Design", "5"],
    ["", "3.4 Key Modules", "6"],
    ["Chapter 4", "Methods and Algorithms", "6"],
    ["", "4.1 Three-Layer Analysis Pipeline", "6"],
    ["", "4.2 Red Flag Detection (12 Categories)", "7"],
    ["", "4.3 Green Flag Detection (9 Categories)", "7"],
    ["", "4.4 Severity-Weighted Scoring", "8"],
    ["", "4.5 Verdict Calculation Algorithm", "8"],
    ["Chapter 5", "Project Analysis", "9"],
    ["", "5.1 Technical Performance", "9"],
    ["", "5.2 User Experience Evaluation", "9"],
    ["", "5.3 Strengths of the System", "10"],
    ["", "5.4 Challenges and Limitations", "10"],
    ["Chapter 6", "Final Results", "11"],
    ["", "6.1 Core Functionality Demonstration", "11"],
    ["", "6.2 Feature Walkthrough", "11"],
    ["Chapter 7", "Conclusion", "12"],
    ["Chapter 8", "Future Scope", "13"],
    ["Chapter 9", "References", "14"],
    ["Appendices", "Glossary of Terms", "15"],
  ];

  for (const [ch, title, pg] of toc) {
    const isChapter = ch.startsWith("Chapter") || ch === "Appendices";
    const indent = isChapter ? 0 : 20;
    const font = isChapter ? helveticaBold : helvetica;
    const label = isChapter ? `${ch} \u2014 ${title}` : title;
    const dots = ".".repeat(60 - label.length - pg.length);

    page.drawText(s(label), { x: M + indent, y, size: isChapter ? 11 : 10, font, color: rgb(0.15, 0.18, 0.22) });
    page.drawText(s(dots), { x: M + indent + font.widthOfTextAtSize(label, isChapter ? 11 : 10) + 4, y, size: isChapter ? 11 : 10, font: helvetica, color: rgb(0.7, 0.73, 0.77) });
    page.drawText(pg, { x: W - M - 20, y, size: isChapter ? 11 : 10, font, color: rgb(0.15, 0.18, 0.22) });
    y -= isChapter ? 20 : 17;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 1: ABSTRACT
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 1 - Abstract");
  newPage();
  heading("Chapter 1 - Abstract");
  paragraph("Veritas is an AI-powered misinformation detection system designed to help the general public identify fake news and unreliable content. The system employs a multi-layered Natural Language Processing (NLP) pipeline that analyzes linguistic patterns, source credibility, and structural elements of text content to determine its authenticity.");
  paragraph("Unlike black-box machine learning models, Veritas uses a transparent rule-based approach with severity-weighted scoring. This design choice ensures that every decision made by the system can be traced back to specific linguistic patterns, making it an explainable AI tool suitable for educational and academic applications.");
  paragraph("The system analyzes 12 categories of red flag indicators (misinformation markers) and 9 categories of green flag indicators (credibility markers). Each indicator carries a severity weight, and the final verdict is calculated using a calibrated ratio-based scoring algorithm that produces a confidence score between 35% and 95%.");
  paragraph("The frontend is built with React 19, TypeScript, and Tailwind CSS v4 with a custom Glassmorphism theme, providing a visually appealing and intuitive user experience. The backend runs on Convex, a serverless platform, enabling real-time data synchronization and seamless scalability.");
  paragraph("Veritas was developed as a Third Year BSc Data Science project and demonstrates the practical application of NLP techniques in combating misinformation. The system has been tested with real-world news articles and social media content, achieving consistent and interpretable results across diverse content types.");
  emptyLines(2);

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 2: INTRODUCTION
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 2 - Introduction");
  newPage();
  heading("Chapter 2 - Introduction");

  heading("2.1 Problem Statement", 2);
  paragraph("The rapid proliferation of digital media and social networking platforms has created an unprecedented challenge: the spread of misinformation and fake news. According to MIT research, false information spreads six times faster than truthful information on social media. This phenomenon poses serious threats to public health, democratic processes, and social cohesion.");
  paragraph("Traditional fact-checking methods are slow, labor-intensive, and cannot scale to match the volume of content published daily. There is a critical need for automated, accessible, and transparent tools that can help ordinary users evaluate the credibility of news articles and social media posts in real time.");
  paragraph("Current automated detection systems often rely on black-box machine learning models that provide no explanation for their decisions. This lack of transparency undermines user trust and makes these tools unsuitable for educational settings where understanding the reasoning behind a verdict is essential.");

  heading("2.2 Objectives of the System", 2);
  paragraph("The primary objectives of Veritas are:");
  bullet("Develop an automated system capable of detecting misinformation in text content using NLP techniques.");
  bullet("Implement a transparent, explainable analysis pipeline where every decision is traceable to specific patterns.");
  bullet("Provide users with clear, actionable verdicts (Likely Real, Likely Fake, Uncertain) with confidence scores.");
  bullet("Create an intuitive, visually appealing interface that is accessible to the general public.");
  bullet("Build a complete web application with analysis history, statistics, and educational methodology documentation.");
  bullet("Demonstrate the practical application of NLP and data science concepts in a real-world problem domain.");

  heading("2.3 Design Philosophy", 2);
  paragraph("Veritas follows three core design principles:");
  paragraph("Transparency: Every analysis decision is explained through specific red and green flags, ensuring users understand why content was flagged. This is critical for building trust and for educational value.");
  paragraph("Accessibility: The system is designed for the general public, not just technical users. The interface is clean, intuitive, and requires no training to use. Content can be analyzed with a simple paste-and-click workflow.");
  paragraph("Explainability Over Accuracy: While trained ML models (BERT, RoBERTa) could potentially achieve higher raw accuracy, Veritas deliberately uses rule-based NLP because it provides full interpretability. Every detection decision can be traced to specific linguistic patterns, making the system auditable and educationally valuable.");

  heading("2.4 Scope of the Project", 2);
  paragraph("Veritas v1 focuses on text-based misinformation detection. The system accepts pasted news articles, social media posts, blog entries, or any text content and provides an instant analysis. The scope includes:");
  bullet("Text content analysis (articles, social media posts, headlines).");
  bullet("Linguistic pattern detection across 12 red flag and 9 green flag categories.");
  bullet("Severity-weighted scoring and confidence calibration.");
  bullet("Analysis history storage and retrieval.");
  bullet("Statistics dashboard with visualization charts.");
  bullet("Technical methodology documentation for academic reference.");
  paragraph("Out of scope for v1: image/video analysis, URL content crawling, real-time fact-checking against external databases, and multi-language support.");

  heading("2.5 Challenges in Misinformation Detection", 2);
  paragraph("Automated fake news detection faces several fundamental challenges:");
  bullet("Linguistic Ambiguity: Satire, opinion pieces, and legitimate news can share similar linguistic patterns, making classification difficult.");
  bullet("Evolving Tactics: Misinformation creators constantly adapt their techniques to evade detection systems.");
  bullet("Context Dependency: The same statement can be factual in one context and misleading in another.");
  bullet("Domain Expertise: Accurate detection often requires domain-specific knowledge that general NLP systems lack.");
  bullet("Balance of Speed vs. Accuracy: Real-time analysis requires efficient algorithms that can process content quickly without sacrificing reliability.");

  heading("2.6 Contribution and Impact", 2);
  paragraph("Veritas contributes to the field of media literacy and misinformation detection in several ways:");
  bullet("Demonstrates that rule-based NLP can achieve meaningful detection results without requiring large labeled datasets.");
  bullet("Provides a fully transparent analysis pipeline suitable for educational and academic use cases.");
  bullet("Offers an accessible web interface that brings misinformation detection to the general public.");
  bullet("Documents the technical methodology comprehensively, enabling replication and extension by other researchers.");
  bullet("Serves as a practical example of applying BSc Data Science concepts to a real-world problem.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 3: SYSTEM ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 3 - System Architecture");
  newPage();
  heading("Chapter 3 - System Architecture and Design");

  heading("3.1 Overall Architecture", 2);
  paragraph("Veritas follows a three-tier architecture pattern with clear separation of concerns:");
  bullet("Presentation Layer: React 19 frontend with TypeScript, responsible for user interface, input handling, and result visualization.");
  bullet("Application Layer: Convex serverless functions handling the NLP analysis engine, authentication, and business logic.");
  bullet("Data Layer: Convex database providing real-time data synchronization, query optimization, and persistent storage.");
  paragraph("The frontend communicates with the backend through Convex's reactive query and mutation system. When a user submits content for analysis, the frontend invokes a Convex action that runs the NLP analysis engine on the server side, ensuring consistent and secure processing.");

  heading("3.2 Technology Stack", 2);
  paragraph("The following technologies form the Veritas technology stack:");
  bullet("Frontend Framework: React 19 with TypeScript for type-safe component development.");
  bullet("Build Tool: Vite for fast development server and optimized production builds.");
  bullet("Styling: Tailwind CSS v4 with custom Glassmorphism utility classes for a modern, translucent UI theme.");
  bullet("UI Components: Shadcn/UI component library providing accessible, customizable base components.");
  bullet("Animations: Framer Motion for smooth, meaningful page transitions and micro-interactions.");
  bullet("Charts: Recharts for statistics dashboard visualization (pie charts, bar charts).");
  bullet("Backend: Convex serverless platform with real-time database synchronization.");
  bullet("Authentication: Convex Auth with email OTP and anonymous user support.");
  bullet("Icons: Lucide React for consistent, scalable iconography.");
  bullet("Analysis Engine: Custom NLP pipeline using regex-based pattern matching with weighted severity scoring.");

  heading("3.3 Database Design", 2);
  paragraph("The Convex database uses two primary tables:");
  paragraph("Users Table: Stores user authentication data including name, email, profile image, role, and anonymous status. Indexed by email for efficient lookup during authentication.");
  paragraph("Analyses Table: Stores analysis results with the following schema:");
  bullet("userId: String reference to the authenticated user.");
  bullet("inputText: The original text content submitted for analysis.");
  bullet("inputType: Either 'text' or 'url' indicating the input format.");
  bullet("verdict: Enum of 'likely_real', 'likely_fake', or 'uncertain'.");
  bullet("confidence: Numeric confidence score between 35 and 95.");
  bullet("summary: Human-readable summary of the analysis findings.");
  bullet("redFlags: Array of detected misinformation indicators.");
  bullet("greenFlags: Array of detected credibility indicators.");
  bullet("reasoning: Detailed explanation of the analysis reasoning.");
  bullet("createdAt: Timestamp for chronological ordering.");
  paragraph("The analyses table is indexed by userId and createdAt for efficient retrieval of a user's analysis history.");

  heading("3.4 Key Modules", 2);
  paragraph("The system is organized into the following key modules:");
  bullet("analyzeNews.ts: The core NLP analysis engine that processes text content and returns structured analysis results.");
  bullet("analyses.ts: Backend queries and mutations for CRUD operations on analysis records.");
  bullet("Dashboard.tsx: Main application interface with five views: Analyze, Results, History, Stats, and Methodology.");
  bullet("CredibilityGauge.tsx: Animated SVG component that visualizes the confidence score as a circular gauge.");
  bullet("StatsView.tsx: Statistics dashboard component with Recharts-powered pie and bar charts.");
  bullet("MethodologyView.tsx: Academic documentation component presenting the technical methodology.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 4: METHODS AND ALGORITHMS
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 4 - Methods and Algorithms");
  newPage();
  heading("Chapter 4 - Methods and Algorithms");

  heading("4.1 Three-Layer Analysis Pipeline", 2);
  paragraph("The Veritas analysis engine operates through three sequential layers, each building on the output of the previous one:");
  paragraph("Layer 1 - Pattern Extraction: The system scans the input text against 70+ regular expression patterns organized into 12 red flag categories and 9 green flag categories. Each pattern is paired with a severity weight (1-8 points) that reflects its significance as an indicator of misinformation or credibility.");
  paragraph("Layer 2 - Category Scoring: Within each category, weighted matches are aggregated to produce a category-level score. Categories with multiple pattern matches receive higher scores, and individual high-severity matches (such as conspiracy language) contribute more than low-severity ones (such as mild sensationalism).");
  paragraph("Layer 3 - Verdict Calculation: The total red flag score and total green flag score are compared using a ratio-based algorithm. The red-to-green ratio determines the verdict and confidence score through calibrated thresholds that prevent overconfident claims.");

  heading("4.2 Red Flag Detection (12 Categories)", 2);
  paragraph("The system detects the following 12 categories of misinformation indicators:");
  bullet("Sensationalist Language: Emotionally manipulative words and phrases designed to provoke strong reactions. Weight: 4-8 per match.");
  bullet("Clickbait Patterns: Common headline manipulation tactics such as 'you won't believe' and 'doctors hate'. Weight: 5-7 per match.");
  bullet("Anonymous Sourcing: Vague attribution without named individuals ('experts say', 'studies show'). Weight: 3-7 per match.");
  bullet("Fear-Mongering: Alarmist framing designed to provoke anxiety ('big pharma', 'deep state'). Weight: 5-7 per match.");
  bullet("Conspiracy Language: Conspiratorial rhetoric and framing ('wake up', 'do your research'). Weight: 5-7 per match.");
  bullet("Excessive Capitalization: Non-professional formatting with excessive ALL CAPS words.");
  bullet("Emoji Overuse: Excessive emoji usage uncommon in professional journalism.");
  bullet("Multi-Exclamation Marks: Emotional punctuation abuse (three or more consecutive exclamation marks).");
  bullet("Urgency/Sharing Pressure: Language designed to pressure users into sharing ('share before they delete').");
  bullet("Missing Citations: Content with no URLs, sources, or verifiable references.");
  bullet("Inappropriate Length: Content too short to be a genuine news article.");
  bullet("ALL CAPS Emphasis: Typographic shouting through excessive capitalization.");

  heading("4.3 Green Flag Detection (9 Categories)", 2);
  paragraph("Simultaneously, the system evaluates 9 categories of credibility indicators:");
  bullet("Named Sources: Specific attributions to named individuals with credentials ('Dr. Sarah Chen'). Weight: 4-7.");
  bullet("Quantitative Data: Specific statistics, percentages, and figures cited in the content. Weight: 16 points.");
  bullet("Credible Institutions: References to recognized news organizations, universities, or research institutions. Weight: up to 22 points.");
  bullet("Temporal Specificity: Exact dates, timelines, and event markers that enable verification. Weight: 14 points.");
  bullet("Balanced Reporting: Multiple perspectives, counterarguments, and acknowledgment of opposing views. Weight: up to 18 points.");
  bullet("Journalistic Structure: Content following the who, what, where, when, why framework. Weight: up to 16 points.");
  bullet("Neutral Tone: Absence of emotional or manipulative language in the content. Weight: 12 points.");
  bullet("Appropriate Length: Content length between 80 and 800 words, consistent with news articles. Weight: 6 points.");
  bullet("Named Quotes: Direct attributions to specific individuals with quotation marks. Weight: up to 14 points.");

  heading("4.4 Severity-Weighted Scoring", 2);
  paragraph("Unlike simple frequency counting, Veritas uses severity-weighted scoring where each pattern carries a weight reflecting its diagnostic significance. For example, the phrase 'they don't want you to know' carries a weight of 8 (high severity), while 'urgent' carries a weight of 4 (moderate severity).");
  paragraph("The weighted matching function iterates through all patterns in a category, summing the product of match count and weight for each pattern. This produces a category-level score that reflects both the frequency and severity of detected indicators.");
  paragraph("Thresholds are applied at the category level: a total category score of 30+ triggers the highest severity flag, 15+ triggers moderate, and 5+ triggers mild. This tiered approach prevents false alarms from isolated low-severity matches while ensuring clusters of indicators receive appropriate attention.");

  heading("4.5 Verdict Calculation Algorithm", 2);
  paragraph("The verdict is determined by comparing the ratio of total red flag scores to total green flag scores:");
  bullet("Red ratio >= 0.65: Verdict is 'Likely Fake' with confidence 55-95%.");
  bullet("Green ratio >= 0.65: Verdict is 'Likely Real' with confidence 55-95%.");
  bullet("Red ratio exceeds green by > 0.1: Leaning toward 'Likely Fake' with confidence 42-78%.");
  bullet("Green ratio exceeds red by > 0.1: Leaning toward 'Likely Real' with confidence 42-78%.");
  bullet("Balanced scores (difference < 0.1): Verdict is 'Uncertain' with confidence 35-50%.");
  paragraph("The confidence score is capped at 95% maximum to prevent overconfident claims, and floored at 35% minimum to acknowledge uncertainty. This calibrated approach ensures that the system provides useful guidance without overstating its certainty.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 5: PROJECT ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 5 - Project Analysis");
  newPage();
  heading("Chapter 5 - Project Analysis");

  heading("5.1 Technical Performance", 2);
  paragraph("Veritas achieves strong technical performance across several metrics:");
  bullet("Analysis Speed: The NLP pipeline processes text content in under 100ms on standard hardware, enabling near-instant results for the user.");
  bullet("Pattern Coverage: The system evaluates 70+ individual patterns across 21 categories, providing comprehensive coverage of known misinformation indicators.");
  bullet("Scalability: The Convex serverless backend automatically scales to handle concurrent users without manual infrastructure management.");
  bullet("Data Consistency: Convex's real-time synchronization ensures that analysis history is immediately available across devices.");
  bullet("Type Safety: Full TypeScript coverage across frontend and backend reduces runtime errors and improves maintainability.");

  heading("5.2 User Experience Evaluation", 2);
  paragraph("The user experience is designed around three core principles:");
  bullet("Simplicity: Users can analyze content in two steps - paste text and click 'Analyze Content'. No account creation required for basic use.");
  bullet("Transparency: Every result shows exactly why content was flagged with itemized red and green indicators, building user trust.");
  bullet("Visual Feedback: The animated credibility gauge, color-coded verdicts, and smooth page transitions provide immediate, intuitive feedback.");
  paragraph("The Glassmorphism theme creates a modern, professional aesthetic with translucent panels, subtle blur effects, and a cohesive cool-blue color palette. This design choice was selected to convey trustworthiness and technical sophistication.");

  heading("5.3 Strengths of the System", 2);
  bullet("Full Transparency: Unlike black-box ML models, every detection decision is traceable to specific linguistic patterns.");
  bullet("No External Dependencies: The analysis engine runs entirely on the Convex backend without requiring API keys or external services.");
  bullet("Immediate Usability: The system works instantly with guest access - no sign-up or configuration required.");
  bullet("Educational Value: The methodology tab provides comprehensive documentation suitable for academic reference.");
  bullet("Mobile Responsive: The interface is fully responsive and works across desktop, tablet, and mobile devices.");
  bullet("Accessibility: Clear visual hierarchy, color-blind-friendly verdict indicators, and readable typography ensure broad accessibility.");

  heading("5.4 Challenges and Limitations", 2);
  paragraph("Veritas acknowledges several limitations:");
  bullet("Text-Only Analysis: The current version analyzes only text content. Image, video, and audio misinformation are not covered.");
  bullet("Pattern Maintenance: The rule-based approach requires manual updates to pattern lists as misinformation tactics evolve.");
  bullet("No External Cross-Referencing: Claims are not verified against external fact-checking databases (e.g., Google Fact Check Tools).");
  bullet("Language Support: The system currently only supports English content.");
  bullet("Context Limitations: The system cannot fully understand nuanced context, satire, or domain-specific terminology.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 6: FINAL RESULTS
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 6 - Final Results");
  newPage();
  heading("Chapter 6 - Final Results");

  heading("6.1 Core Functionality Demonstration", 2);
  paragraph("Veritas successfully implements all core features of an AI-powered misinformation detection system:");
  bullet("Text Analysis: Users can paste any text content and receive an instant credibility assessment with confidence score.");
  bullet("URL Analysis: The system can analyze content from URLs, evaluating domain patterns and available metadata.");
  bullet("Verdict Display: Results show a clear verdict (Likely Real / Likely Fake / Uncertain) with an animated credibility gauge.");
  bullet("Detailed Breakdown: Each analysis includes itemized red flags, green flags, summary, and detailed reasoning.");
  bullet("Sample Articles: Three built-in sample articles demonstrate the system's ability to correctly classify real and fake content.");
  bullet("History Tracking: All analyses are saved to the database and accessible through the History tab.");
  bullet("Statistics Dashboard: Aggregate statistics with pie charts and bar charts show analysis patterns over time.");

  heading("6.2 Feature Walkthrough", 2);
  paragraph("The Veritas dashboard provides five main views:");
  paragraph("Analyze View: The primary interface where users paste content for analysis. Features include text/URL toggle, clipboard paste button, character counter, and three sample articles for quick demonstration.");
  paragraph("Results View: Displays the analysis outcome with the animated credibility gauge, color-coded verdict, confidence bar, summary, detailed reasoning, red flags list, and green flags list.");
  paragraph("History View: Lists all past analyses with verdict icons, confidence badges, content type indicators, and summary text. Each entry is clickable to reload the full results.");
  paragraph("Stats View: Shows aggregate statistics including total analyses, average confidence, red/green flag counts, verdict distribution pie chart, and confidence distribution bar chart.");
  paragraph("Methodology View: Presents 8 sections of technical documentation covering system architecture, analysis pipeline, detection categories, scoring methodology, and academic references.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 7: CONCLUSION
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 7 - Conclusion");
  newPage();
  heading("Chapter 7 - Conclusion");
  paragraph("Veritas demonstrates that rule-based NLP techniques can be effectively applied to the challenge of misinformation detection, providing meaningful results while maintaining full transparency and interpretability.");
  paragraph("The system successfully implements a three-layer analysis pipeline that processes text content through pattern extraction, severity scoring, and verdict calculation. The 12 red flag categories and 9 green flag categories provide comprehensive coverage of known misinformation indicators, while the severity-weighted scoring system ensures that high-severity patterns receive appropriate attention.");
  paragraph("The choice to use a rule-based approach rather than trained machine learning models was deliberate and justified. In an educational and academic context, the ability to explain every detection decision is more valuable than marginal improvements in raw accuracy. Users can see exactly which patterns triggered each flag, building trust and enabling learning.");
  paragraph("The web application provides a complete, polished user experience with analysis, results visualization, history tracking, statistics, and methodology documentation. The Glassmorphism design theme creates a professional, modern aesthetic suitable for academic presentation.");
  paragraph("Veritas represents a practical application of BSc Data Science concepts, combining NLP techniques, web development, database design, and user experience design into a cohesive project that addresses a real-world problem. The system demonstrates both technical competence and practical impact in the fight against misinformation.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 8: FUTURE SCOPE
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 8 - Future Scope");
  newPage();
  heading("Chapter 8 - Future Scope");
  paragraph("Several enhancements are planned for future versions of Veritas:");
  bullet("Fine-Tuned ML Models: Integration of BERT or RoBERTa classifiers trained on the LIAR dataset (12.8K labeled statements) to complement the rule-based engine with learned patterns.");
  bullet("External Fact-Checking API: Integration with Google Fact Check Tools API to cross-reference claims against verified fact-checking databases.");
  bullet("TF-IDF Topic Modeling: Implementation of TF-IDF vectorization for topic-level analysis, enabling the system to detect domain-specific misinformation patterns.");
  bullet("Image Forensics: Analysis of uploaded images for manipulation indicators such as inconsistent lighting, metadata anomalies, and reverse image search matching.");
  bullet("Multi-Language Support: Extension of the analysis engine to support Hindi, Spanish, and other major languages.");
  bullet("Browser Extension: A Chrome extension that can analyze news articles directly in the browser without copying and pasting.");
  bullet("Social Media Integration: Direct analysis of tweets, Facebook posts, and Instagram captions through platform APIs.");
  bullet("User Feedback Loop: A mechanism for users to report incorrect verdicts, enabling continuous improvement of the detection patterns.");
  bullet("Advanced Analytics: Deeper statistical analysis including temporal trends, topic clustering, and misinformation spread patterns.");

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER 9: REFERENCES
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Chapter 9 - References");
  newPage();
  heading("Chapter 9 - References");
  const refs = [
    "[1]  Vosoughi, S., Roy, D., & Aral, S. (2018). The spread of true and false news online. Science, 359(6380), 1146-1151.",
    "[2]  Wang, W. Y. (2017). 'Liar, Liar Pants on Fire': A New Benchmark Dataset for Fake News Detection. arXiv:1705.00648.",
    "[3]  MIT Media Lab. (2020). Detecting and Tracking Fake News. Massachusetts Institute of Technology.",
    "[4]  First Draft News. (2019). A Field Guide to Misinformation. First Draft.",
    "[5]  Stanford Internet Observatory. (2020). Virality Project: Understanding the Spread of Misinformation. Stanford University.",
    "[6]  Reuters Institute. (2023). Digital News Report: Trust and Credibility in News. Reuters Institute for the Study of Journalism.",
    "[7]  MediaWise. (2021). Teen Media Literacy Research: Indicators of Misinformation. Poynter Institute.",
    "[8]  Allcott, H., & Gentzkow, M. (2017). Social Media and Fake News in the 2016 Election. Journal of Economic Perspectives, 31(2), 211-236.",
    "[9]  Shu, K., et al. (2017). Fake News Detection on Social Media: A Data Mining Perspective. arXiv:1705.01917.",
    "[10] Devlin, J., et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. NAACL-HLT.",
    "[11] Convex Documentation. (2024). Convex: The Modern Backend. https://docs.convex.dev",
    "[12] React Documentation. (2024). React: The Library for Web and Native User Interfaces. https://react.dev",
    "[13] Tailwind CSS Documentation. (2024). Tailwind CSS: A Utility-First CSS Framework. https://tailwindcss.com",
    "[14] Framer Motion Documentation. (2024). Framer Motion: Production-Ready Animations. https://framer.com/motion",
  ];
  for (const ref of refs) {
    drawText(ref, { font: timesRoman, size: 10, lineSpacing: 16 });
    y -= 2;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // APPENDICES
  // ═══════════════════════════════════════════════════════════════════════
  drawFooter("Appendices");
  newPage();
  heading("Appendices");

  heading("A. Glossary of Terms", 2);
  const glossary = [
    ["NLP", "Natural Language Processing - Computational techniques for analyzing human language."],
    ["Regex", "Regular Expression - A sequence of characters defining a search pattern."],
    ["Severity Weight", "A numeric value (1-8) assigned to each pattern reflecting its diagnostic significance."],
    ["Red Flag", "An indicator of potential misinformation or unreliable content."],
    ["Green Flag", "An indicator of credible, well-sourced, or journalistically sound content."],
    ["Confidence Score", "A percentage (35-95%) representing the system's certainty in its verdict."],
    ["Glassmorphism", "A design style featuring translucent panels with blur effects and subtle borders."],
    ["Convex", "A serverless backend platform providing real-time database synchronization."],
    ["Serverless", "A cloud architecture where the provider manages server infrastructure automatically."],
    ["TypeScript", "A typed superset of JavaScript that adds static type checking."],
    ["React", "A JavaScript library for building user interfaces, maintained by Meta."],
    ["Shadcn/UI", "A component library built on Radix UI and Tailwind CSS."],
    ["Framer Motion", "A React animation library for smooth, production-ready animations."],
    ["Recharts", "A React charting library built on D3.js for data visualization."],
  ];
  for (const [term, def] of glossary) {
    bullet(`${term}: ${def}`);
    y -= 2;
  }

  heading("B. System Requirements", 2);
  bullet("Modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.");
  bullet("Internet connection for Convex backend synchronization.");
  bullet("Minimum screen resolution: 320px width (mobile responsive).");
  bullet("No additional software installation required - fully web-based.");

  heading("C. Installation Guide", 2);
  bullet("Clone the repository: git clone <repository-url>");
  bullet("Install dependencies: bun install");
  bullet("Start development server: bun run dev");
  bullet("Start Convex backend: bun convex dev");
  bullet("Open browser at http://localhost:5173");

  // ═══════════════════════════════════════════════════════════════════════
  // FINAL PAGE
  // ═══════════════════════════════════════════════════════════════════════
  page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: rgb(0.23, 0.51, 0.96) });

  y = H / 2 + 80;
  page.drawText(s("Veritas"), { x: M, y, size: 42, font: helveticaBold, color: rgb(0.06, 0.09, 0.17) });
  y -= 40;
  page.drawText(s("AI-Powered Misinformation Detection System"), { x: M, y, size: 14, font: timesItalic, color: rgb(0.23, 0.51, 0.96) });
  y -= 50;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0.8, 0.83, 0.87) });
  y -= 30;
  page.drawText(s("BSc Data Science - Third Year Project"), { x: M, y, size: 12, font: helvetica, color: rgb(0.45, 0.5, 0.55) });
  y -= 20;
  page.drawText(s("Academic Year 2026-2027"), { x: M, y, size: 11, font: helvetica, color: rgb(0.55, 0.6, 0.65) });

  // Save
  const pdfBytes = await doc.save();
  fs.writeFileSync("public/Veritas-Project-Documentation.pdf", pdfBytes);
  console.log("Documentation PDF generated!");
  console.log("Size:", (pdfBytes.length / 1024).toFixed(1), "KB");
  console.log("Total pages:", pdfDoc.getPageCount());
}

generate().catch(console.error);
