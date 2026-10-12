// Better structural check: walk PDF objects (incl. object streams) for page
// count, decode every flate stream, extract text-showing operators.
import { readFileSync } from "node:fs";
import zlib from "node:zlib";
import { PDFDocument } from "pdf-lib";

const path = process.argv[2] ?? "/tmp/veritas-test.pdf";
const buf = readFileSync(path);

const pdf = await PDFDocument.load(buf);
console.log("pdf-lib page count:", pdf.getPageCount());

// decode all streams
const raw = buf.toString("latin1");
const chunks = [];
const re = /stream(\r\n|\n|\r)/g;
let m;
while ((m = re.exec(raw)) !== null) {
  const start = m.index + m[0].length;
  const end = raw.indexOf("endstream", start);
  if (end === -1) break;
  const data = buf.subarray(start, end);
  // check the dictionary right before this stream for /FlateDecode
  const dictStart = Math.max(0, m.index - 400);
  const dict = raw.slice(dictStart, m.index);
  // /Length may be an indirect ref; inflate as far as possible with bit tolerance
  let got = null;
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { got = fn(data); break; } catch {}
    try { got = fn(data.subarray(0, data.length - 4)); break; } catch {}
  }
  if (got) chunks.push(got.toString("latin1"));
  re.lastIndex = end;
}
const content = chunks.join("\n");

// text strings: ( ... ) Tj  and  [ ... ] TJ  and  ( ... ) ' variants
// WinAnsi strings: extract every (...) literal regardless of the operator
// that follows — pdf-lib emits one prefix operand then a text run, so
// operator-anchored regexes miss most strings.
const texts = [];
const tjRe = /\((?:\\.|[^\\()])*\)/g;
for (const s of content.match(tjRe) || []) {
  try {
    texts.push(JSON.parse(s.replace(/\\([()])/g, "$1").replace(/\\\\/g, "\\")));
  } catch {
    texts.push(s.slice(1, -1));
  }
}
const all = texts.join(" ").toLowerCase();
console.log("decoded stream chars:", content.length, "text literals:", texts.length, "first:", JSON.stringify(texts.slice(0, 3)));

const mustHave = [
  "GUIDE INTERACTION DIARY", "PROJECT PROPOSAL", "CERTIFICATE", "ABSTRACT",
  "ACKNOWLEDGEMENT", "DECLARATION", "TABLE OF CONTENTS", "Introduction".toLowerCase(),
  "SURVEY DATA ANALYSIS", "FIELD VISIT", "FINDINGS AND DISCUSSION",
  "CONCLUSION AND RECOMMENDATIONS", "REFERENCES", "VIVA PREPARATION",
  "PASTE GENUINE VERITAS SCREENSHOT HERE", "RETRIEVAL FAILED", "UNABLE TO ANALYZE",
  "Md Ali".toLowerCase(), "Ms. Manali M. Kotkar", "ClaimBuster".toLowerCase(),
  "Full Fact".toLowerCase(), "FEVER".toLowerCase(), "instagram",
  "WINANSI-ONLY-SHOULD-NOT-APPEAR",
].slice(0, -1);

let miss = 0;
for (const s of mustHave) {
  const found = all.includes(s.toLowerCase());
  if (!found) { miss++; console.log("  MISSING:", s); }
}
console.log(miss === 0 ? "all content markers present" : miss + " markers missing");

// crude order check: find indexes of front matter markers in draw order
const order = ["GUIDE INTERACTION DIARY", "PROJECT PROPOSAL", "CERTIFICATE", "ABSTRACT",
  "ACKNOWLEDGEMENT", "DECLARATION", "TABLE OF CONTENTS", "INTRODUCTION",
  "SURVEY DATA ANALYSIS", "FIELD VISIT", "CONCLUSION AND RECOMMENDATIONS", "REFERENCES", "VIVA PREPARATION"];
const idx = order.map((s) => { const i = all.indexOf(s.toLowerCase()); return i; });
let ordered = true;
for (let i = 1; i < idx.length; i++) {
  if (idx[i] === -1 || idx[i - 1] === -1 || idx[i] < idx[i - 1]) { ordered = false; }
}
console.log("front-matter/chapter draw order:", ordered ? "correct" : "check: " + order.map((s, i) => s + "=" + idx[i]).join(", "));

// forbidden styling: pdf-lib has no underline/italic used; verify no italic fonts embedded
const fontsUsed = [...new Set((content.match(/\/Font[a-z]*/g) || []))].slice(0, 8);
console.log("fonts referenced:", fontsUsed.join(", "));
console.log("checks complete");
