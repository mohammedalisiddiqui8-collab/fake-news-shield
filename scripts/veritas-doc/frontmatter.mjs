// Front matter: cover, diary, proposal, certificate, abstract, acknowledgement,
// declaration, and the Table of Contents rendered from the real page numbers.
import { INK, M } from "./pager.mjs";
export function cover(doc) {
  doc.newPage("cover");
  const y = doc.y;
  doc.cur.page.drawText("SREE NARAYANA GURU COLLEGE OF COMMERCE (AUTONOMOUS)", { x: 76, y: y - 14, size: 12, font: doc.f.hb, color: INK });
  doc.y = y - 34;
  doc.center("A PROJECT REPORT", { font: "hb", size: 12, gap: 6 });
  doc.center("ON", { font: "b", size: 10.5, gap: 6 });
  doc.center("\u201CVERITAS \u2013 FAKE NEWS DETECTION AND AUTOMATED FACT-CHECKING SYSTEM\u201D", { font: "hb", size: 12.5, gap: 10 });
  doc.center("Submitted in partial fulfilment of the requirements for the degree of", { font: "b", size: 10, gap: 4 });
  doc.center("BACHELOR OF SCIENCE IN DATA SCIENCE", { font: "hb", size: 11.5, gap: 10 });
  doc.center("Academic Year 2026\u20132027", { font: "b", size: 10.5, gap: 16 });

  const top = 470;
  const rows = [
    ["Submitted by", "Md Ali"],
    ["Class / Course", "S.Y.B.Sc. Data Science (First Submission)"],
    ["College", "Sree Narayana Guru College of Commerce (Autonomous)"],
    ["Under the Guidance of", "Ms. Manali M. Kotkar"],
    ["Guide Experience", "5 years"],
  ];
  doc.cur.page.drawText("Submitted by:", { x: 150, y: top + 20, size: 10.5, font: doc.f.hb, color: INK });
  doc.cur.page.drawText("Md Ali", { x: 290, y: top + 20, size: 10.5, font: doc.f.b, color: INK });
  doc.cur.page.drawText("College:", { x: 150, y: top, size: 10.5, font: doc.f.hb, color: INK });
  doc.cur.page.drawText("Sree Narayana Guru College of Commerce (Autonomous)", { x: 290, y: top, size: 10.5, font: doc.f.b, color: INK });
  doc.cur.page.drawText("Degree:", { x: 150, y: top - 20, size: 10.5, font: doc.f.hb, color: INK });
  doc.cur.page.drawText("B.Sc. (Data Science)", { x: 290, y: top - 20, size: 10.5, font: doc.f.b, color: INK });
  doc.cur.page.drawText("Under the Guidance of:", { x: 150, y: top - 40, size: 10.5, font: doc.f.hb, color: INK });
  doc.cur.page.drawText("Ms. Manali M. Kotkar", { x: 290, y: top - 40, size: 10.5, font: doc.f.b, color: INK });

  doc.cur.page.drawText("Academic Year: 2026\u20132027", { x: 215, y: 150, size: 10.5, font: doc.f.hb, color: INK });
  // manual completion placeholders
  doc.cur.page.drawLine({ start: { x: 200, y: 120 }, end: { x: 400, y: 120 }, thickness: 0.6, color: INK });
  doc.cur.page.drawText("College Seal", { x: 218, y: 104, size: 8.5, font: doc.f.h, color: INK });
  doc.cur.page.drawLine({ start: { x: 200, y: 120 }, end: { x: 400, y: 120 }, thickness: 0.6, color: INK });
}

export function guideDiary(doc) {
  doc.newPage("front");
  doc.h1front("GUIDE INTERACTION DIARY");
  doc.para("This diary records the interactions between the student and the project guide during the semester as required by the documentation format. Each entry records the date, the topics discussed and the guidance direction received. Dates are to be completed by hand from the student's own records at submission.", { gap: 10 });

  // table with blank date column
  const rows = [
    ["1", "\u2014\u2014/\u2014\u2014/2026", "Initial project discussion; feasibility of a claim-level fact-checking web app; scope of the literature study.", ""],
    ["2", "\u2014\u2014/\u2014\u2014/2026", "Presentation of the pipeline plan (retrieve \u2192 clean \u2192 claim extraction \u2192 evidence \u2192 cross-check \u2192 verdict). Guide advised marking retrieval failures explicitly.", ""],
    ["3", "\u2014\u2014/\u2014\u2014/2026", "Discussion of data design and coverage counting; agreed that per-claim coverage must not be inflated by repeated sources.", ""],
    ["4", "\u2014\u2014/\u2014\u2014/2026", "Prototype walkthrough; guide reviewed the Trace replay and asked for the retrieval-failure state to be documented as a first-class behaviour.", ""],
    ["5", "\u2014\u2014/\u2014\u2014/2026", "Review of testing record structure; agreed to present observed outputs only, labelled as observed test cases.", ""],
    ["6", "\u2014\u2014/\u2014\u2014/2026", "Discussion of limitations chapter and ethics of automated verdicts; guide emphasised that confidence must never be presented as certainty.", ""],
    ["7", "\u2014\u2014/\u2014\u2014/2027", "Final documentation review; structure, references and viva preparation appendix.", ""],
  ];
  doc.table(["No.", "Date", "Topics Discussed / Guidance Received", "Sign."], rows, [30, 70, 360, 40], { size: 8.6 });
  doc.spacer(6);
  doc.para("Signature of Guide: Ms. Manali M. Kotkar        Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014", { size: 10 });
}

export function proposal(doc) {
  doc.newPage("front");
  doc.h1front("PROJECT PROPOSAL");
  doc.para("Title of the project: Veritas \u2013 Fake News Detection and Automated Fact-Checking System.", { gap: 8 });
  doc.para("Problem addressed: readers who receive a suspicious article or forward currently have no structured way to check it in the moment. Manual checking is slow; professional fact-checks cover a small fraction of circulating content and arrive late; and article-level labels hide which specific statements hold up. The project addresses the missing middle ground: an automatic first pass that divides an article into claims, searches for independent coverage of each claim, and reports what was found \u2014 including when nothing could be found or fetched.", { gap: 8 });
  doc.para("Proposed work: build a web application (React + TypeScript on the front end, Convex serverless functions and database on the back end) implementing a fixed investigation pipeline: article retrieval with an 8-second cap and honest failure state; body-text cleaning; claim extraction with numbering; per-claim external evidence retrieval and classification (supports / contradicts / partial / does-not-address); cross-checking with credibility weighting; freshness handling; supplementary linguistic analysis that can never decide a verdict on its own; and a final evidence-gated verdict with confidence and written reasoning.", { gap: 8 });
  doc.para("Deliverables: the working application with three main views (landing, Investigation Desk, analysis report); an investigation Trace replay; a documented data model; a testing record of observed cases including retrieval failures; and this documentation.", { gap: 8 });
  doc.para("Non-goals stated up front: the project does not claim to measure truth directly, does not train a machine-learning model, does not provide accuracy benchmarks, and does not replace human review in high-impact cases. Where verification is impossible (blocked platforms, paywalls, malformed input), the system reports a retrieval failure and performs no verification.", { gap: 8 });
  doc.spacer(10);
  doc.para("Signature of student: \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014        Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014", { size: 10 });
  doc.spacer(8);
  doc.para("Signature of guide (approved for work): \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014        Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014", { size: 10 });
}

export function certificate(doc) {
  doc.newPage("front");
  doc.center("SREE NARAYANA GURU COLLEGE OF COMMERCE (AUTONOMOUS)", { font: "hb", size: 12, gap: 8 });
  doc.center("Department of Data Science", { font: "b", size: 11, gap: 26 });
  doc.center("CERTIFICATE", { font: "hb", size: 14, gap: 22 });
  doc.para("This is to certify that the project entitled \u201CVeritas \u2013 Fake News Detection and Automated Fact-Checking System\u201D submitted by Mr. Md Ali, a student of S.Y.B.Sc. Data Science, is a record of work completed under my guidance during the academic year 2026\u20132027, in partial fulfilment of the requirements of the degree of Bachelor of Science in Data Science of this college.", { gap: 10 });
  doc.para("The work is first submission of the project by the candidate for this degree.", { gap: 10 });
  doc.para("Place: Mumbai            Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014", { gap: 6 });
  doc.spacer(24);
  doc.para("Signature of Guide       Signature of Head of Dept.       Signature of Principal", { size: 9.5 });
  doc.spacer(6);
  const lines = ["\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", "\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", "\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014"];
  doc.para("Ms. Manali M. Kotkar", { size: 10, gap: 2 });
  doc.para("(5 years teaching/guiding experience)", { size: 9, gap: 14 });
  doc.para("Name: \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014,", { size: 9.5 });
  doc.para("Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014");
}

export function abstract(doc) {
  doc.newPage("front");
  doc.h1front("ABSTRACT");
  doc.para("Veritas is a web application that performs an automated first pass of fact-checking on a news article supplied as a URL or as pasted text. The system retrieves the article, isolates the primary body content, divides it into individually checkable claims, and searches for independent external coverage of each claim. Retrieved sources are classified by their relationship to the claim (supports, contradicts, partially addresses, or does not address it), then weighed for credibility and freshness. A final assessment combines the claim-level outcomes into one of three verdicts \u2014 Likely Credible, Likely Misleading or Uncertain \u2014 together with a confidence level that is capped while claims remain unresolved, and a written reasoning block. Linguistic and framing signals (sensationalism, clickbait, attribution style) are computed and reported as supplementary context but are structurally prevented from producing a verdict by themselves.");
  doc.para("The central design rule is honesty on failure. When content cannot be retrieved \u2014 for example an Instagram post, which does not serve its content to automated readers \u2014 the system reports UNABLE TO ANALYZE / RETRIEVAL FAILED, keeps the submitted URL visible, performs no verification, and records no fingerprint or confidence. A six-stage Trace replay shows which stages of the investigation genuinely ran, so a reader can audit the process without reading code.");
  doc.para("The implementation uses React 19 with TypeScript and Vite, styled with Tailwind CSS and shadcn/ui, animated with Framer Motion, and backed by Convex (serverless functions and document store) with Convex Auth. The report documents the actual observed behaviour of the system on documented test cases \u2014 including successful analyses and three distinct retrieval-failure situations \u2014 without inventing accuracy figures. Areas for future work include improved extraction support for more publishers, multilingual verification and evaluation on a structured benchmark.");
}

export function acknowledgement(doc) {
  doc.newPage("front");
  doc.h1front("ACKNOWLEDGEMENT");
  doc.para("I would like to thank my guide, Ms. Manali M. Kotkar, for the way she guided this project. The advice that shaped Veritas most was not about code but about honesty: when the system cannot check something, it must say so plainly, and when it is uncertain, it must not sound certain. Every design rule in this report traces back to discussions in the guide-interaction diary in one way or another.");
  doc.para("I thank the Head of the Department of Data Science and the faculty of Sree Narayana Guru College of Commerce (Autonomous) for the laboratory resources, project reviews and for permitting the viva-format evaluation this documentation supports.");
  doc.para("I also thank the volunteers and fellow students who tried early prototypes and asked the uncomfortable question that changed the interface: how do I know the tool is not just making this up? The evidence-chain view is the direct answer to them.");
  doc.para("Finally, I thank my family for their patience during the long evenings this project consumed.");
  doc.spacer(14);
  doc.para("Md Ali", { size: 10.5, gap: 2 });
  doc.para("S.Y.B.Sc. Data Science", { size: 10 });
}

export function declaration(doc) {
  doc.newPage("front");
  doc.h1front("DECLARATION");
  doc.para("I, Md Ali, student of S.Y.B.Sc. Data Science, Sree Narayana Guru College of Commerce (Autonomous), hereby declare that the project entitled \u201CVeritas \u2013 Fake News Detection and Automated Fact-Checking System\u201D is a record of original work carried out by me under the guidance of Ms. Manali M. Kotkar during the academic year 2026\u20132027.");
  doc.para("This is the first submission of this project by me for this degree. The testing results recorded in this report are the observed outputs of the documented test cases on the implemented system, stated as observed behaviour and not as statistical claims. Content that could not be verified by hand \u2014 dates of record entries, signatures and seal spaces \u2014 has been left as marked placeholders for manual completion at submission, rather than invented.");
  doc.spacer(30);
  doc.para("Place: Mumbai          Date: \u2014\u2014/\u2014\u2014/\u2014\u2014\u2014\u2014", { gap: 26 });
  doc.para("Signature of Student: \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", { gap: 4 });
  doc.para("(Md Ali)");
}

// Table of contents, rendered after everything else with real page numbers
export function renderTOC(doc, tocEntries, startPageLabel) {
  doc.newPage("front");
  doc.center("TABLE OF CONTENTS", { font: "hb", size: 13, gap: 14 });
  // two-pass approach: this is drawn fresh from the collected entries
  const indentByLevel = [0, 16, 32];
  for (const e of tocEntries) {
    const indent = indentByLevel[e.level] ?? 0;
    const size = e.level === 0 ? 10.8 : 9.8;
    const font = e.level === 0 ? "hb" : "b";
    const maxLabel = 430 - indent;
    let label = e.text;
    const fnt = doc.f[font];
    while (doc.width(label, fnt, size) > maxLabel && label.length > 4) label = label.slice(0, -1);
    if (label !== e.text) label = label.slice(0, -3) + "...";
    const pageStr = String(e.page ?? "");
    const pageW = doc.width(pageStr, fnt, size);
    const dotsW = Math.max(8, 470 - indent - doc.width(label, fnt, size) - pageW);
    doc.need(size + 8);
    const startX = M.L + indent;
    doc.cur.page.drawText(label, { x: startX, y: doc.y - size, size, font: fnt, color: INK });
    const labelEnd = startX + doc.width(label, fnt, size);
    // dot leaders
    const dot = ".";
    const nDots = Math.floor(dotsW / doc.width(dot, fnt, size));
    for (let i = 0; i < nDots; i++) doc.cur.page.drawText(dot, { x: labelEnd + i * doc.width(dot, fnt, size), y: doc.y - size, size, font: fnt, color: INK });
    doc.cur.page.drawText(pageStr, { x: M.L + 470, y: doc.y - size, size, font: fnt, color: INK });
    doc.y -= size + 5.5;
  }
}
