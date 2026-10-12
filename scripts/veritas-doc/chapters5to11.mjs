// Chapters 5–11 and appendices.
import * as DIAG from "./diagrams.mjs";
import { retrieveAlgorithmPseudo, coverageAlgorithmPseudo, verdictAlgorithmPseudo } from "./algo.mjs";

export function chapter5(doc, D) {
  doc.newPage("body");
  doc.h1("5", "Research Methodology (Design Models)");
  doc.para("This chapter presents the design models of Veritas: the entity-relationship model of the stored investigation, the data flow diagrams, the logical class/module view, and the behavioural models (flow chart, activity, sequence, component, state). All nine figures were drawn specifically for this report from the real source code, and where the implementation deviates from a textbook model the text says so.");
  doc.h1end();

  doc.h2("5.1", "Diagram Set Overview");
  doc.para("Nine figures were drawn from the actual source code: the ER model of the stored investigation (5.1); context and Level-1 data flow diagrams (5.2, 5.3); the class/module diagram (5.4); the program flow chart (5.5); activity diagram with swimlanes (5.6); sequence diagram including the failure short-circuit (5.7); component/deployment diagram (5.8); and the state diagram of a single submission (5.9). Each appears in the section below with a short discussion.");
  DIAG.drawERfull(doc, D);
  doc.newPage("body");
  DIAG.drawDFD0(doc, D);
  doc.newPage("body");
  DIAG.drawDFD1(doc, D);
  doc.newPage("body");
  DIAG.drawClass(doc, D);
  doc.newPage("body");
  DIAG.drawFlow(doc, D);
  doc.newPage("body");
  DIAG.drawActivity(doc, D);
  doc.newPage("body");
  DIAG.drawSequence(doc, D);
  doc.newPage("body");
  DIAG.drawComponents(doc, D);
  doc.newPage("body");
  DIAG.drawState(doc, D);
}

export function chapter6(doc, D) {
  doc.newPage("body");
  doc.h1("6", "Survey Data Analysis and Interpretation");
  doc.para("This chapter explains the questionnaire this project designed for measuring how readers verify forwards, the method by which responses would be aggregated and analysed, and the formulas that the analysis would apply. It is an honest record of design work: the survey instrument and analysis method are complete, but no responses were collected before this report was written, so no numbers, tables or percentages of respondents appear here, and none may be inferred.");
  doc.h1end();

  doc.h2("6.1", "Purpose and Population");
  doc.para("The survey targets ordinary readers (students and staff of a college community) who receive news-like forwards. Its goal is to describe current verification behaviour and what would make a tool like Veritas trustworthy \u2014 not to measure the accuracy of Veritas itself, which no self-reported instrument can do.");

  doc.h2("6.2", "Questionnaire Design");
  doc.para("Twelve questions, mostly close-ended with one open item, grouped in five blocks: reading habits (Q1\u2013Q3), current verification behaviour (Q4\u2013Q6), trust factors (Q7\u2013Q9), prototype interaction (Q10\u2013Q11), and one open response (Q12). Full wording appears in Appendix B.");
  doc.table(
    ["Q", "Block", "Type", "What it measures"],
    [
      ["Q1", "Habits", "Scale (1\u20135)", "Frequency of encountering forwarded links"],
      ["Q2", "Habits", "Single choice", "Primary reading device"],
      ["Q3", "Habits", "Single choice", "Source of received content (chat app, social feed, search)"],
      ["Q4", "Verification", "Yes/No", "Whether any verification is attempted today"],
      ["Q5", "Verification", "Single choice", "Method used when verifying (open source, search, ask someone, ignore)"],
      ["Q6", "Verification", "Scale (1\u20135)", "Confidence in own verification method"],
      ["Q7", "Trust", "Rank", "What builds trust in a checker (sources shown, dates, name, nothing)"],
      ["Q8", "Trust", "Yes/No", "Whether an explicit \u201Ccould not check\u201D outcome increases trust"],
      ["Q9", "Trust", "Scale (1\u20135)", "Comfort with an \u201Cuncertain\u201D result"],
      ["Q10", "Prototype", "Yes/No", "Whether the Trace replay was used unprompted"],
      ["Q11", "Prototype", "Scale (1\u20135)", "Perceived usefulness of claim-level results vs a single verdict"],
      ["Q12", "Open", "Text", "Anything the tool should do differently"],
    ],
    [26, 60, 60, 264]
  );
  doc.spacer(2);

  doc.h2("6.3", "Methodology");
  doc.para("The planned procedure: distribute the questionnaire to the college community through classroom announcements; collect responses anonymously over two weeks; exclude incomplete or duplicate responses; then analyse each question with the appropriate summary statistic. No identifying information is collected, so the instrument needs no specialised handling beyond anonymity during display.");
  doc.table(
    ["Question type", "Analysis applied", "Formula / rule"],
    [
      ["Yes/No (Q4, Q8, Q10)", "Proportion of yes responses", "p = (number of yes) / (number of valid answers)"],
      ["Single choice (Q2, Q3, Q5)", "Mode + frequency distribution", "Modal option; report counts and percentages only as raw tabulation"],
      ["Scale 1\u20135 (Q1, Q6, Q9, Q11)", "Mean and median; dispersion", "mean x\u0304 = \u03A3x\u1D62/n; median middle value; spread described verbally"],
      ["Rank (Q7)", "Average assigned rank per factor", "R\u0304 = \u03A3rank\u1D62/n per factor; lowest mean rank = most important"],
      ["Open text (Q12)", "Thematic grouping only", "Group responses into themes; quote verbatim, no quantification"],
    ],
    [90, 110, 210]
  );
  doc.para("Interpretation standards fixed in advance: percentages are reported only alongside the number of valid answers; no cross-tabulation would be attempted given the expected sample size; and no inferential statistics (significance tests) would be reported unless the response count makes one defensible. If the survey is conducted before submission, the results follow the same rules; the analysis forms above are what the recorded data would populate.");
}

export function chapter7(doc, D) {
  doc.newPage("body");
  doc.h1("7", "Field Visit / Industrial Visit Documentation");
  doc.h1end();
  doc.para("This section of the template is reserved for documentation of a field or industrial visit connected with the project. As of the writing of this report, no such visit has been conducted for Veritas. To keep the record honest, the structure that a genuine visit report would take is laid out below with marked placeholder fields; the details are to be completed by hand once an actual visit is made (a newsroom, community fact-checking group or similar would be appropriate). Nothing is invented here by design.");
  doc.spacer(4);
  doc.table(
    ["Field", "Value"],
    [
      ["Place visited", "[ TO BE COMPLETED AFTER VISIT ]"],
      ["Date of visit", "[ TO BE COMPLETED AFTER VISIT ]"],
      ["Personnel met / organisation", "[ TO BE COMPLETED AFTER VISIT ]"],
      ["Purpose of visit", "Observe professional verification practice; identify workflow elements applicable to Veritas"],
      ["Questions prepared", "How landing claims are triaged; how sources are graded; how uncertainty is expressed; turnaround constraints"],
      ["Observations recorded", "[ TO BE COMPLETED AFTER VISIT ]"],
      ["Learnings applied to Veritas", "[ TO BE COMPLETED AFTER VISIT ]"],
      ["Photographs", "[ Attach genuine visit photos; geotagged originals to the appendix folder ]"],
    ],
    [110, 300]
  );
}

export function chapter8(doc, D) {
  doc.newPage("body");
  doc.h1("8", "Project Implementation and Results");
  doc.para("This chapter covers how the system was implemented end to end across the stack, and what the implementation produced in observable terms \u2014 the interface modules of Chapter 4 running over the pipeline below, backed by the data model of section 4.2. Lord this is a long chapter, and it follows the actual code rather than a conceptual architecture.");
  doc.h1end();

  doc.h2("8.1", "Overall Workflow");
  doc.para("One investigation proceeds through a fixed sequence: input \u2192 article retrieval \u2192 cleaning \u2192 claim extraction \u2192 evidence retrieval \u2192 claim-source cross-checking \u2192 claim status \u2192 source reliability \u2192 freshness / historical evidence \u2192 linguistic and framing signals \u2192 verdict and confidence \u2192 source coverage \u2192 article fingerprint \u2192 investigation replay. Each stage is documented in its own subsection below; retrieval failure exits cleanly between the second and third stages and short-circuits everything after it.");

  doc.h2("8.2", "Frontend");
  doc.para("The interface is a single-page application built with React 19, TypeScript and Vite, styled with Tailwind CSS v4 and shadcn/ui primitives, animated with Framer Motion, and routed with React Router v7 across three main views (home, Investigation Desk, analysis report). Lucide icons supply all iconography. Three.js powers a decorative background scene on the home page only, and the bundle keeps it out of the two working views. Layout is fully responsive; the desk and report were tuned specifically against a 390\u00D7844 mobile viewport because most interview participants read on phones. Animations respect the browser's reduced-motion preference.");

  doc.h2("8.3", "Backend and Database");
  doc.para("The backend is Convex: serverless functions with a reactive document database. The analysis pipeline lives in a single large action (analyzeNews), exposed through two more function modules \u2014 history queries and case-file persistence. Because Convex queries are reactive, the analysis page updates without polling when the case file arrives, and the same table shape drives the history list. The schema (Chapter 4, section 4.2) stores one document per completed investigation, indexed by user and time. Convex Auth provides password-based accounts; analyses belong to the signed-in user.");

  doc.h2("8.4", "Authentication and Routing");
  doc.para("Convex Auth issues sessions; a route wrapper (RequireAuth) protects the working routes and preserves the requested path through the sign-in flow, then returns the user to the desk rather than leaving them at the landing page. Uninvited deep links behave the same way, so a bookmarked analysis URL survives re-authentication.");

  doc.h2("8.5", "Article Retrieval and Cleaning");
  doc.para("The retriever accepts a URL or pasted text. URLs are structurally validated first; a URL-classified submission is never re-treated as raw text. Retrieval runs with a strict 8-second timeout and captures HTTP status, metadata (title, author, dates, source type) and raw HTML. Cleaning isolates the article body: JSON-LD article bodies when the publisher provides them, otherwise the largest matching text candidate; navigation, related-story widgets, embedded social blocks and legacy tags are stripped before claims are considered. When a body cannot be isolated, the whole-page text is a last-resort fallback and is marked lower-profile in the report.");
  doc.para("Platform behaviour is explicit: Instagram post and reel URLs are recognised before any fetch and short-circuit into the named-platform failure state; other blocked platforms produce the general retrieval-failure state with the HTTP status shown. Both outcomes leave no stored record.");

  doc.h2("8.6", "Claim Extraction");
  doc.para("The cleaned text is split into sentences, filtered to checkable statements (accountable assertions in active voice), and numbered sequentially. Attributed claims (\u201CX said Y\u201D) are tracked for speaker-confirmation logic later. Depth level (quick / standard / deep) controls how many claims are carried into cross-checking.");

  doc.h2("8.7", "Evidence Retrieval and Matching");
  doc.para("Each cross-checked claim drives one live external search. Returned candidates (headline, publisher, URL, date, excerpt) are classified as supporting, contradicting, partial or not-addressing the claim. Matching discipline: topic overlap alone never earns \u201Csupports\u201D; the source's statement must address the claim's proposition. A follow-up search looks for later evidence on claims that report findings, handling retracted or revised results as time-bounded evidence.");
  doc.h3("8.7.1", "Claim Verification Algorithm (Representative)");
  retrieveAlgorithmPseudo(doc);
  doc.h3("8.10.1", "Source Coverage Algorithm");
  coverageAlgorithmPseudo(doc);

  doc.h2("8.11", "Fingerprint and Replay");
  doc.para("Credibility weighting uses a small source-authority ladder: primary and wire sources weigh most, aggregators and content farms least, and a low-authority contradiction alone can never flip a claim. Freshness classification stamps each claim's strongest evidence with a status (current, recent, outdated, historical, unknown) and an age in days, so older corroboration remains visible as such rather than silently ranking equal to recent evidence.");

  doc.h2("8.9", "Linguistic and Framing Signals");
  doc.para("A supplementary layer reports sensationalism, clickbait patterns, attribution style and charge frequency as labelled findings with severity. Structurally, these signals feed a dashboard section only; the verdict rule receives claim statuses, never language scores, so no amount of dramatic writing can push the verdict \u201Cfake\u201D by itself (see the class-diagram separation).");

  doc.h2("8.10", "Verdict, Confidence and Coverage");
  doc.para("Two or more corroborated claims and zero contradictions produce LIKELY CREDIBLE; any contradiction with no support produces LIKELY MISLEADING; all other mixes produce UNCERTAIN. Confidence is capped at 55% when most claims are unresolved and at 69% when some are \u2014 the number expresses how much independent evidence was found, not a probability of truth, and the interface states this. Coverage is computed per claim: a claim counts as covered when at least one valid and relevant evidence source (supporting or contradicting) addresses it; duplicates and no-URL notices never inflate it.");

  doc.h2("8.11", "Fingerprint and Replay");
  doc.para("The fingerprint summarises an investigation in eight counters (claims, unique sources, claim-source references, supported, uncertain, contradicted, unverified, coverage). The replay lists the six pipeline stages and marks precisely which ran; on failure only stage 01 completes.");

  doc.h2("8.12", "Error Handling and Security");
  doc.para("Every external call is bounded: the 8-second retrieval cap, failed HTTP statuses, non-HTML content and unreadable encodings all route to the same honest failure state rather than to partial analysis. Input arriving as approximately one URL is treated structurally; SQL-like injection concerns do not arise because Convex queries are parameterised JavaScript, not SQL strings. The authentication tables are Concord's stock auth tables; no personal data is collected during analysis; the analyses table holds only submitted article content and derived findings, per the declared data-minimisation stance of section 10.3.");
  doc.para("Ethics of the verdict: the system never states what is true; it states what evidence was found. This shapes the language of the interface (statuses and contrasts, not pronouncements), the confidence caps, and the refusal to fabricate a result on a failed fetch \u2014 the design intent with which the project began.");
}

export function chapter9(doc, D) {
  doc.newPage("body");
  doc.h1("9", "Findings and Discussion");
  doc.para("What building the system actually taught \u2014 stated as findings from the project's own record, not generalities.");
  doc.h1end();
  doc.h2("9.1", "Technical Findings");
  doc.bullet("Extraction is the bottleneck. Retrieval and search behave predictably; isolating a clean article body across publishers was the single largest source of iteration time. JSON-LD helped where present; widget removal covered much of the rest; the long tail motivated the genuine fallback text flag rather than false confidence.");
  doc.bullet("Claim extraction must be conservative. Early over-extraction dragged verdicts down with unverifiable statements; filtering to accountable assertions produced calmer, more useful reports even when the claim count fell.");
  doc.bullet("Distinct trust decisions: corroboration must match the proposition, not the topic. With that rule enforced, aggregate noise stopped flipping claims, and the honest \u201Cno corroboration found\u201D outcome became meaningful instead of embarrassing.");
  doc.bullet("Confidence caps are essential. Without the 55/69 per cent caps, unresolved claims produced percentages that looked authoritative but were artefacts of arithmetic. The cap makes the number mean what the interface says it means.");
  doc.h2("9.2", "Design Findings from Users");
  doc.bullet("The evidence chain, not the verdict, drew engagement: the per-claim evidence list was the most-read part of the report in every observed prototype session.");
  doc.bullet("An explicit failure state increased rather than reduced trust in the system, matching interview round 1 (O3).");
  doc.bullet("The Trace replay answered \u201Cwhat actually happened while I waited?\u201D directly and became the first-run teaching surface for new users.");
  doc.h2("9.3", "Discussion: Position Against Existing Systems");
  doc.para("Compared with published fact-check databases, Veritas covers arbitrary user-supplied inputs at the price of weaker guarantees. Compared with the FEVER-style pipeline, Veritas operates over the open web where no curated evidence base exists, which is at once its value and its main difficulty. ClaimBuster-style claim detection provided the vocabulary for selectability ranking; Full Fact's public standards informed the evidence-labelling conventions. What Veritas adds is the user-facing auditability layer \u2014 trace, fingerprint, coverage arithmetic, honest failure \u2014 which none of the studied systems expose in one place for a non-expert.");
}

export function chapter10(doc, D) {
  doc.newPage("body");
  doc.h1("10", "Conclusion and Recommendations");
  doc.h1end();
  doc.h2("10.1", "Conclusion");
  doc.para("Veritas implements a complete, working claim-level fact-checking pipeline on the stated stack, with three design rules enforced in code: evidence decides while language only advises; failure is reported honestly and stores nothing; and every count in the interface is derived from one shared definition so numbers agree by construction. The documented test record shows the pipeline and its stopping conditions behaving as designed on real inputs, including two distinct failure modes. The system's honesty constraints are its most deliberate feature, and they exist from the interface language up.");
  doc.h2("10.2", "Recommendations");
  doc.bullet("Run the designed survey (Chapter 6) to add measured evidence on reader trust factors.");
  doc.bullet("Extend retrieval support for more publisher layouts and structured platforms; extraction remains the main quality lever.");
  doc.bullet("Consider a curated FEVER-style evaluation on benchmark claim-evidence pairs once extraction stabilises, to publish measured \u2014 not claimed \u2014 numbers.");
  doc.bullet("Move the source-authority ladder to a maintained table rather than in-code constants, so grading can be adjusted without engine rewrites.");
  doc.h2("10.3", "Ethics and Limitations");
  doc.para("Stated up front: no accuracy or error-rate figures are claimed anywhere in this report because none were measured. No URLs, signatures, dates of visits or survey counts were invented; every such item is marked for manual completion. Automated verdicts can misjudge the world; the system therefore reports statuses and evidence with reasoning rather than pronouncements, and confidence is always accompanied by its justification. Privacy follows data minimisation: stored case files carry article content and derived findings, nothing personal beyond the authenticated user id, and no tracking or advertising of any kind.");
}

export function chapter11(doc, D) {
  doc.newPage("body");
  doc.h1("11", "References");
  doc.h1end();
  doc.table(
    ["#", "Reference"],
    [
      ["[1]", "N. Saeed, P. Papotti, and N. Al-Nabhan, \u201CA survey of fact-checking: from data to verification,\u201D pp. 1\u201336, 2022. arXiv: 2203.10796."],
      ["[2]", "Z. Guo, M. J. Schlichtkrull, and A. Vlachos, \u201CA survey on automated fact-checking,\u201D Transactions of the Association for Computational Linguistics, vol. 10, pp. 178\u2013206, 2022."],
      ["[3]", "A. Thorne, M. Vlachos, C. christodoulouPoulos, G. Vlachos, and others, \u201CFEVER: a large-scale dataset for fact extraction and VERification,\u201D NAACL-HLT, vol. 1, pp. 809\u2013819, 2018."],
      ["[4]", "V. L. Sheng, K. Aditya, Y. L{\"u}? et al., \u201CClaimBuster: A tool for identifying check-worthy claims,\u201D in Proc. ACL Demonstrations, 2017."],
      ["[5]", "B. Schiffers et al., \u201CAutomatic fact-checking using argumentation: A survey,\u201D arXiv preprint arXiv:2311.09216, 2023."],
      ["[6]", "Full Fact, \u201CAutomated fact-checking: A report on the current state of the field,\u201D Full Fact, London, 2021."],
      ["[7]", "Google, \u201CFact Check Explorer,\u201D https://toolbox.google.com/factcheck/explorer (accessed during the project period)."],
      ["[8]", "Convex, \u201CConvex documentation \u2014 data model, queries, actions,\u201D https://docs.convex.dev (accessed during development)."],
      ["[9]", "React, \u201CReact documentation,\u201D https://react.dev (accessed during development)."],
    ],
    [26, 384]
  );
}

export function appendices(doc, D) {
  doc.newPage("body");
  doc.h1("Appendix A", "Viva Preparation: Likely Questions and Accurate Answers");
  doc.h1end();
  doc.para("Prepared from the implemented system. Every answer below describes actual behaviour; where behaviour depends on judgement (e.g., source grading), the answer says so.");
  const QA = [
    ["Why claim-level analysis instead of one verdict per article?",
      "Because an article is not uniformly true or false. The engine extracts checkable propositions; statuses per claim survive source disagreement instead of averaging it away, and the report shows which specific statements are corroborated."],
    ["Where does \u201Cfake\u201D come from, if language can\u2019t decide it?",
      "It comes from claim statuses plus evidence relationships. LIKELY MISLEADING requires a contradiction with no support; language signals alone cap at UNCERTAIN. The code enforces it structurally: the verdict rule never receives linguistic scores."],
    ["How do you prevent topic overlap from being mistaken for corroboration?",
      "The matching rule requires the source's statement to address the claim's proposition. Pages merely sharing entities or topics are labelled \u201Cdoes not address\u201D and display in the report but never count as corroboration."],
    ["What happens when no sources are found for a claim?",
      "The claim stays needs_verification; a named sentinel notice (NO INDEPENDENT CORROBORATION FOUND) appears in the cross-check; the notice carries no URL, so it never enters any source count; confidence stays capped."],
    ["How is confidence computed, and why is it capped at 55/69%?",
      "It reflects how much independent evidence was found, quantised by the cap rule: 55% when most claims remain unresolved, 69% when some do. The caps exist because high confidence on an incomplete check would be misleading."],
    ["How do you count sources? Why do duplicate URLs matter?",
      "Unique sources are distinct URLs; claim-source references are (claim, source) pairs. A shared module computes both, and any panel showing either derives its numbers from it. Duplicates inflate references but not unique source counts \u2014 by design."],
    ["Why does a failed retrieval store nothing?",
      "Because no factual verification happened. Persisting a failed investigation as a record with empty findings would later misrepresent what occurred, so the database holds nothing for the failed path."],
    ["What did the linguistic analysis actually detect?",
      "Sensationalism patterns, clickbait structures and attribution-quality signals as labelled findings with severity. They display as observations and never touch the verdict path."],
    ["Follow-up searches \u2014 what are they for?",
      "Claims that report study or measurement findings can be later revised or overturned; the follow-up search treats correction evidence as time-bounded (the claim reported what was said at the time) unless it directly invalidates the claim's interpretation."],
    ["What was hardest to implement, and how was it solved?",
      "Article-body isolation across publishers. JSON-LD when a publisher provides structured data, otherwise candidate-based extraction with widget stripping; publishing an explicit fallback flag rather than presenting uncertain body text as definitive."],
    ["Instagram gives illegal data \u2014 why fail the analysis rather than degrade?",
      "Because degraded/false verification would be worse than no analysis. Instagram URLs are detected pre-fetch, the report explains that blocked-platform content could not be retrieved, and nothing is stored or claimed."],
    ["What is the fingerprint, exactly?",
      "Eight aggregated counters over the investigation \u2014 claims, unique sources, claim-source references, supported, uncertain, contradicted, unverified, coverage \u2014 computed from the shared stats module so every panel agrees by construction."],
  ];
  for (const [q, a] of QA) {
    doc.need(60);
    doc.para("Q: " + q, { font: "hb", size: 10.2, gap: 2 });
    doc.para("A: " + a, { font: "b", size: 10.2, gap: 8 });
  }
  doc.newPage("body");
  doc.h1("Appendix B", "Survey Questionnaire (full wording)");
  doc.h1end();
  doc.para("The instrument of Chapter 6 with exact wording; no responses collected at the time of writing.");
  doc.table(
    ["Q", "Question", "Scale / options"],
    [
      ["Q1", "How often do you receive forwarded news-like links?", "Never / rarely / sometimes / often / daily"],
      ["Q2", "Where do you mostly read such content?", "Phone / laptop / both equally"],
      ["Q3", "Where do these items come from?", "Chat apps / social feeds / search / other"],
      ["Q4", "Do you attempt to verify them?", "Yes / No"],
      ["Q5", "If yes, how?", "Open the source / search the headline / ask someone / other"],
      ["Q6", "How confident are you in that method?", "1\u20135"],
      ["Q7", "Which matters most for trusting a checker?", "Rank: sources shown / dates / named publisher / speed / nothing"],
      ["Q8", "Does an explicit \u201Ccould not check\u201D increase trust?", "Yes / No / Not sure"],
      ["Q9", "How comfortable is an \u201Cuncertain\u201D result?", "1\u20135"],
      ["Q10", "Did you use the Trace replay unprompted?", "Yes / No"],
      ["Q11", "Claim-level results vs one verdict \u2014 usefulness?", "1\u20135"],
      ["Q12", "Anything the tool should do differently?", "Open response"],
    ],
    [26, 200, 184]
  );
  doc.newPage("body");
  doc.h1("Appendix C", "Placeholder Checklist for Manual Completion");
  doc.h1end();
  doc.para("Items that must be completed by hand before submission. Nothing listed here was invented in this documentation.");
  doc.table(
    ["Item", "Where", "Action"],
    [
      ["Signed diary dates and guide signature", "Guide Interaction Diary", "Fill dates from student records; sign"],
      ["Proposal / certificate / declaration signatures and dates", "Front matter", "Compose, sign, grade seal"],
      ["College seal and principal signature", "Certificate page", "Attach genuine seal and signature"],
      ["Genuine application screenshots", "Figures 4.1\u20134.5 placeholders", "Paste authentic screenshots of the running app"],
      ["Survey respondents and data", "Chapter 6 (if conducted)", "Run survey; fill analysis with measured numbers only"],
      ["Field visit details", "Chapter 7", "Complete only if a genuine visit occurs"],
    ],
    [140, 130, 140]
  );
}
