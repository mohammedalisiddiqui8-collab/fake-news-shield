import { savePdfIfPossible, Doc, makeDraw, FM, C13, C4a, C4b, LATER } from "./parts.mjs";

// PASS 1: full content once, only to collect the real TOC entries and
// page numbers. Body numbering restarts at 1, so these stay valid in pass 2.
const probe = await Doc.create();
runContent(probe);
if (probe.toc.some((e) => e.page == null)) {
  const missing = probe.toc.filter((e) => e.page == null).map((e) => e.text);
  throw new Error("TOC entries without page numbers: " + missing.join("; "));
}
const tocEntries = probe.toc;

// PASS 2: final document with TOC placed after the Declaration.
const doc = await Doc.create();
const D = makeDraw(doc);

FM.cover(doc);
FM.guideDiary(doc);
FM.proposal(doc);
FM.certificate(doc);
FM.abstract(doc);
FM.acknowledgement(doc);
FM.declaration(doc);

FM.renderTOC(doc, tocEntries);

runContent(doc);

doc.finalize();
await savePdfIfPossible(doc);

function runContent(d) {
  const DD = makeDraw(d);
  C13.chapter1(d, DD);
  C13.chapter2(d, DD);        // 2 Objectives of the Project
  C13.chapter2lit(d, DD);     // 3 Literature Review
  C4a.chapter4a(d, DD);
  C4b.chapter4b(d, DD);
  LATER.chapter5(d, DD);
  LATER.chapter6(d, DD);
  LATER.chapter7(d, DD);
  LATER.chapter8(d, DD);
  LATER.chapter9(d, DD);
  LATER.chapter10(d, DD);
  LATER.chapter11(d, DD);
  LATER.appendices(d, DD);
}
