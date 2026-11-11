const ITEMS = [
  "Claim traced to a primary filing",
  "Two sources disagree — flagged",
  "Verdict withheld: insufficient evidence",
  "Parliamentary record retrieved",
  "Quote verified against transcript",
  "Context restored to a cropped image",
  "Retraction found in the archive",
  "No verdict without a retrievable source",
];

/* The ticker is the page's pulse: a single hairline band of process notes,
   always moving, never shouting. Two identical lists are laid end to end so
   the loop has no seam; hover pauses it so a line can actually be read, and
   reduced motion holds the first frame. */
export default function Ticker() {
  return (
    <div
      className="v-ticker relative overflow-hidden border-y border-[#F1F0EA]/10 bg-[#0A0A09] py-4"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
      }}
      aria-label="Veritas process notes"
    >
      <div className="v-ticker-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-6 whitespace-nowrap px-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#F1F0EA]/55"
              >
                <span className="text-[#F1F0EA]/30">◆</span>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
