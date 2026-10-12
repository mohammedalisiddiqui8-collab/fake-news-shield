import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export async function savePdfIfPossible(doc) {
  const out = process.env.OUT ||
    "public/veritas-files/Veritas-Project-Documentation.pdf";
  mkdirSync(path.dirname(out), { recursive: true });
  const bytes = await doc.pdf.save();
  writeFileSync(out, Buffer.from(bytes));
  const pages = doc.pdf.getPageCount();
  console.log("Saved", out, (bytes.length / 1024).toFixed(0) + " KB,", pages, "pages,", doc.toc.length, "TOC entries");
  return pages;
}
