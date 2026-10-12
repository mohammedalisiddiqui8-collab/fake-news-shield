// Chapter 4 part B: graphical interface (gui 4.3) with wireframe figures
// and manual screenshot placeholders, plus the testing record (4.4).
import * as GUI from "./gui.mjs";
export function chapter4b(doc, D) {
  doc.newPage("body");
  doc.h2("4.3", "Graphical Interface (GUI)");
  doc.para("The figures below are wireframe sketches drawn of the interface as built \u2014 they show layout and content, printed in black and white. Because a wireframe is a diagram rather than a photograph, each figure is followed by a marked slot where a genuine screenshot of the application should be pasted before the hard copy is printed. No simulated screenshots appear in this report.");
  const GUI_W = 467, GUI_H = 150;

  doc.h3("4.3.1", "Home Page");
  doc.para("Masthead artwork, a rotating evidence-thesis line, horizontal scan animation, and a single entry affordance into the Investigation Desk. Nothing else competes for attention.", { gap: 4 });
  GUI.wfHome(doc, D, 64, doc.y, GUI_W, GUI_H);
  doc.y -= GUI_H + 10;
  doc.caption("Figure 4.1 - Wireframe of the home page (\u201C/\u201D).");
  GUI.screenshotPlaceholder(doc);

  doc.newPage("body");
  doc.h3("4.3.2", "Investigation Desk");
  doc.para("Opening states the six-stage method as a numbered timeline, followed by the dual-mode input area (URL or pasted text), the depth selector, and the Framework section describing the two analysis tracks.", { gap: 4 });
  GUI.wfDesk(doc, D, 64, doc.y, GUI_W, GUI_H);
  doc.y -= GUI_H + 10;
  doc.caption("Figure 4.2 - Wireframe of the Investigation Desk (\u201C/desk\u201D).");
  GUI.screenshotPlaceholder(doc);

  doc.h3("4.3.3", "Analysis Report");
  doc.para("Nine fixed sections presented in pipeline order. The final assessment appears only after the evidence sections; on retrieval failure the page shows the dedicated failed state instead.", { gap: 4 });
  GUI.wfReport(doc, D, 64, doc.y, GUI_W, 150);
  doc.y -= 160;
  doc.caption("Figure 4.3 - Wireframe of the analysis report section order (\u201C/analysis\u201D).");
  GUI.screenshotPlaceholder(doc);

  doc.h3("4.3.4", "Retrieval-Failed State");
  doc.para("The honest failure state: the submitted URL stays visible, the verdict reads RETRIEVAL FAILED with confidence shown as a dash, and the page explains that no factual verification was performed \u2014 for example when an Instagram URL cannot be fetched.", { gap: 4 });
  GUI.wfFailed(doc, D, 64, doc.y, GUI_W, 120);
  doc.y -= 130;
  doc.caption("Figure 4.4 - Wireframe of the dedicated retrieval-failed report state.");
  GUI.screenshotPlaceholder(doc);

  doc.h3("4.3.5", "Trace Replay and Claim Cross-Check");
  doc.para("Two inspection surfaces: the six-stage Trace replay (which lights up only stages that genuinely ran) and the per-claim cross-check panel listing retrieved sources with their relationship labels, dates and excerpts.", { gap: 4 });
  GUI.wfTrace(doc, D, 64, doc.y, 225, 140);
  GUI.wfEvidence(doc, D, 306, doc.y, 225, 140);
  doc.y -= 150;
  doc.caption("Figure 4.5 - Wireframes: Trace replay (left) and per-claim cross-check (right).");
  GUI.screenshotPlaceholder(doc);
  doc.y -= 6;

  doc.h2("4.4", "Testing (Test Cases and Outputs)");
  doc.para("The table records the five documented test cases that were run against the implemented system during the final testing round. Output descriptions are the observed behaviour, not statistics. The failure cases (T3, T4) are as much a part of the system's specification as the success cases: they verify that the failure path reports honestly and stores nothing.");
  doc.table(
    ["Case", "Input", "Observed output", "Result"],
    [
      ["T1", "Full news article URL (mainstream publisher)", "Report produced: numbered claims; per-claim cross-check; fingerprint; LIKELY CREDIBLE verdict with conditional reasoning listed.", "Pass"],
      ["T2", "Pasted article text (no URL)", "Pipeline runs on the pasted body; source profile fields unavailable and marked NOT AVAILABLE; extraction and assessment proceed normally.", "Pass"],
      ["T3", "Instagram post URL", "Recognised before fetching; verdict RETRIEVAL FAILED; confidence dash; no case file stored; Trace shows stop after stage 01.", "Pass (honest failure)"],
      ["T4", "Malformed URL string", "Rejected as invalid URL with no network call; submitted string kept visible; nothing persisted.", "Pass"],
      ["T5", "Press-release-style text with very few checkable sentences", "Zero or minimal claims extracted; fingerprint shows counts without a fabricated percentage; no verdict inflation.", "Pass"],
    ],
    [30, 120, 200, 60]
  );
  doc.para("Edge cases exercised beyond the formal table: duplicate sources across claims (counted once as unique sources, twice in references); contradictory evidence with no support (drives verdict to LIKELY MISLEADING via the hard rule); historical evidence on otherwise confirmed claims (corroboration retained but marked outdated); and input text that is only a URL (routed to the retrieval path automatically). Each behaved as the design rules in 4.2.1 require.", { gap: 6 });
  doc.para("What testing did not establish: accuracy or error rates. The five cases demonstrate that the pipeline executes the designed rules on realistic inputs and that every stopping condition works; they do not measure how often the engine is right, and the report makes no such claim anywhere.", { gap: 6 });
}
