// Chapters 1–3: Introduction, Literature Review, Methodology
import * as DIAG from "./diagrams.mjs";

export function chapter1(doc, D) {
  doc.newPage("body");
  doc.h1("1", "Introduction");
  doc.para("This project, called Veritas, is an automated fake-news detection and evidence-based fact-checking web application. It was developed as a final-year B.Sc. Data Science project. Before describing what the system does, it is worth writing down how the project came about and what problem it actually solves, because the design decisions in the later chapters only make sense once the problem is stated plainly. During the last few years, fact-checking pages and even ordinary messaging groups have been flooded with forwards — screenshots of news headlines, links to blog posts, and social media posts that look like reporting but are not. A reader who wants to check one of these items has to open several tabs, search for the original story, compare dates, and decide whether the sources found actually say what the forward claims they say. That process is slow, and most people skip it. Veritas was built to do the mechanical part of that checking automatically, while leaving the final judgement to the reader.");
  doc.h1end();

  doc.h2("1.1", "Existing System (Problem Identification)");
  doc.para("At present, a person who receives a suspicious article has three realistic options. The first is to ignore it. The second is to search for the headline manually and read whatever comes up, which mixes genuinely independent reporting with aggregators, syndicated copies and unrelated pages that merely mention the same topic. The third is to wait for a professional fact-checking organisation to publish a ruling — but professional fact-checkers cover only a small fraction of the content that circulates, and their reviews appear hours or days after the original claim. None of these options gives an ordinary reader a structured answer in the moment.");
  doc.para("The deeper problem is that the checking that does happen is usually done at the level of the whole article. A reader (or a simple classifier) decides \u201Cthis looks fake\u201D or \u201Cthis looks real\u201D about the entire piece. Articles, however, are not uniformly true or false. A typical news story contains a mix of directly checkable statements — figures, quotations, attributed findings — alongside context and opinion. Labelling the whole article with one label hides which specific statements are corroborated and which are not, and it gives the reader nothing to act on. Academic surveys of automated fact-checking make the same point: verification is only meaningful at the level of an individual claim, checked against retrieved evidence [1], [2].");
  doc.para("A second, less obvious problem was observed repeatedly while testing early versions of this project: systems that appear authoritative even when they have no evidence. A tool that cannot reach the article it was given still needs a way to say so honestly. Several existing tools either fail silently or, worse, return a confidence score anyway. Veritas treats this as a design requirement rather than an afterthought, which is why the retrieval-failure behaviour in section 4.1.3 exists at all.");
  doc.para("Finally, existing automated systems tend to be research pipelines without a user-facing front end. They report benchmark accuracy on curated datasets, but a student, teacher or journalist cannot paste a URL into them and watch the verification happen step by step. The gap this project addresses is therefore not \u201Cnobody has ever automated fact-checking\u201D — that would be false — but rather: there is no lightweight, transparent, claim-level tool that a non-expert can point at an arbitrary URL and that shows its own work.");

  doc.h2("1.2", "Proposed System (Solution)");
  doc.para("Veritas is a web application in which a user submits either the URL of an article or the article text itself. The system then performs a fixed investigation pipeline. It first retrieves the article content and isolates the actual body text, discarding navigation menus, advertisements and related-story widgets. It then splits the text into individually checkable factual claims, searches for independent external coverage of each claim, classifies every retrieved source as supporting, contradicting, partially addressing or not addressing the claim, and finally combines those outcomes into an overall assessment with a confidence level and a written reasoning block.");
  doc.para("Three design principles shaped the whole system. First, evidence decides, language only advises. Linguistic analysis (sensationalism, clickbait patterns, attribution style) is computed and displayed, but it can never, on its own, make the verdict \u201Cfake\u201D — the code enforces this with an explicit gate. Second, honesty on failure. If content cannot be retrieved — Instagram blocks automated access, or a publisher rejects the request — the system reports \u201CUNABLE TO ANALYZE / RETRIEVAL FAILED\u201D and performs no verification at all, rather than producing a fabricated-looking result. Third, show the work. Every investigation carries a Trace (a six-stage replay of what actually happened), a per-claim evidence chain, and a fingerprint summarising the numbers, so that a user can audit the reasoning instead of trusting a bare label.");
  doc.para("The system is deliberately a web application rather than a script or a notebook. The investigation needs to be something a teacher can sit down and use in two minutes. That requirement drove the choice of a single-page React interface talking to a serverless Convex backend, described in Chapter 2 and Chapter 4.");

  doc.h2("1.3", "Normal Photos & Geotag Photos");
  doc.para("The college documentation template asks for a section on normal photos and geotagged photos taken during the project's onsite phase. During the requirement-gathering visits described in section 1.4, the project site and the users' working environment were documented photographically. Normal (non-geotagged) photographs record the general setting: the reading room where volunteers review forwarded messages on shared desktops, and the notice board where printed corrections of viral claims are pinned. Geotagged photographs — those carrying GPS coordinates in their metadata — record the specific locations where user interactions took place, so that the interview context (section 2.2) can be tied to a physical place and time. For privacy reasons, and because geotags identify individuals' workplaces, the geotagged originals are held separately and only the location names appear in this report. The photographs themselves serve the same purpose as any field-study evidence: they demonstrate that the requirements were gathered from a real environment with real constraints (shared machines, intermittent internet, small screens), and those constraints appear later as concrete requirements — for example, the interface's readability on a phone-sized viewport and the decision to keep the whole report server-rendered rather than dependent on the user's device.");

  doc.h2("1.4", "Key Finding (From Onsite Interaction with Users)");
  doc.para("The most important finding from talking to the intended users did not concern features at all — it concerned trust. When the first working prototype was shown to five users (two college volunteers who fact-check forwards for a community group, one freelance journalist, and two students), all five immediately asked the same question in some form: \u201Chow do I know the tool isn't just making this up?\u201D They were not asking about accuracy percentages. They wanted to see the evidence themselves.");
  doc.para("That single reaction reshaped the project. Earlier in development the plan was a single verdict badge with a percentage, rendered prominently. The users found exactly that element of the prototype the least useful. What they actually used — and asked to see enlarged — was the per-claim evidence list: the extracted claims with the retrieved headlines, dates and excerpts next to them. Several also pointed out that a verdict of \u201Cuncertain\u201D felt honest to them, whereas a confident-sounding verdict on a thin basis would feel like the tool overreaching. This is why the final interface surfaces: the investigation Trace, the claim-level statuses, the evidence excerpts, the coverage calculation and — critically — the explicit \u201CRETRIEVAL FAILED\u201D state that refuses to pretend a verification happened.");
  doc.para("A second finding was practical rather than conceptual: three of the five users forwarded links from Instagram. Instagram does not serve post content to automated readers, which no amount of clever engineering inside this project can change. Rather than hide this, the system names it — it recognises Instagram URLs specifically and explains that the platform's content could not be retrieved automatically. The users' verdict on that behaviour, quoted roughly: \u201Cbetter than a tool that pretends it checked it.\u201D The remaining chapters describe the system that these findings produced.");
}

export function chapter2(doc, D) {
  doc.newPage("body");
  doc.h1("2", "Objectives of the Project");
  doc.para("The objectives below were fixed at the proposal stage and are restated here against what the finished system actually does, so the examiner can check each one against the corresponding section of this report.");
  doc.h1end();

  doc.h2("2.1", "Primary Objective");
  doc.para("To build a working web application that gives an ordinary reader a structured, evidence-backed first pass on a suspicious news article: the user supplies the article (URL or pasted text); the system retrieves it, divides it into individually checkable claims, searches for independent coverage of each claim, and reports what was found claim by claim together with an overall verdict, a confidence level and written reasoning.");

  doc.h2("2.2", "Secondary Objectives");
  doc.bullet("Provide a transparent, auditable verification process: every investigation exposes the stages it ran (Trace replay), the per-claim evidence chain and the counting rules behind every displayed number (coverage, fingerprint).");
  doc.bullet("Handle failure honestly: when a page cannot be fetched or a platform blocks automated access (Instagram is named explicitly), report UNABLE TO ANALYZE / RETRIEVAL FAILED, show the submitted input, perform no verification and store no record.");
  doc.bullet("Keep language analysis strictly supplementary: sensationalism, clickbait and attribution signals are displayed as observations but are structurally prevented from deciding the verdict.");
  doc.bullet("Achieve a genuinely usable mobile experience, since users read forwarded content on phones; the layout was tuned against a 390x844 viewport.");
  doc.bullet("Keep user accounts and stored investigations private: password authentication through Convex Auth, each case file visible only to the user who ran it.");
  doc.bullet("Document the system to viva depth: data design, algorithms, diagrams, testing record and this report, all derived from the real source code.");

  doc.h2("2.3", "Scope and Non-Objectives");
  doc.para("Stating what the project deliberately does not attempt, because it bounds the claims made later: Veritas does not measure truth directly and does not claim accuracy percentages; it does not train machine-learning models (the analysis is rule-based plus live retrieval); it does not cover social-media-only content that blocks automated retrieval; and it is a first pass for readers, not a substitute for professional editorial judgement in high-stakes cases. Each non-objective is revisited with the actual behaviour in section 10.3.");
}

export function chapter2lit(doc, D) {
  doc.newPage("body");
  doc.h1("3", "Literature Review");
  doc.para("This chapter covers the planning work: what tools and prior research the project stands on, what was asked of users, how requirements were collected, and what existing software was studied before building anything. A note on scope first: the literature reviewed here is deliberately focused on automated fact-checking as an engineering task \u2014 how claims are detected, how evidence is retrieved, how verification is decided \u2014 because those are the stages Veritas implements. The wider social-science literature on why misinformation spreads is acknowledged but not reviewed in depth, since Veritas does not model propagation.");
  doc.h1end();

  doc.h2("3.1", "Survey of Technology (Minimum Hardware & Software Requirement)");
  doc.para("Before development began, the practical requirements were written down so that the system would be buildable and demonstrable on ordinary student hardware. The survey below records what the project actually needs, and why.");
  doc.h3("3.1.1", "Minimum Hardware Requirements");
  doc.table(
    ["Component", "Minimum (end-user)", "Recommended (development)", "Why it matters"],
    [
      ["Smartphone", "Any modern Android/iOS phone with an updated browser", "Same, used for responsive testing", "Several users interact with Veritas on phones; layout is verified at 390\u00D7844 px."],
      ["Laptop / desktop", "Dual-core CPU, 4 GB RAM", "Quad-core CPU, 8 GB RAM", "Running the dev server, the Convex backend and a browser simultaneously."],
      ["Storage", "~500 MB free", "~2 GB free", "Node/Bun toolchain, project dependencies, build output."],
      ["Internet", "Broadband required for analysis", "Stable broadband", "Retrieval and evidence search are live external calls; offline use is impossible by design."],
      ["Browser", "Current Chrome, Edge, Firefox or Safari", "Chrome with dev tools", "The UI uses modern CSS (custom properties, subgrid-free flex/grid) supported by all current browsers."],
    ],
    [70, 130, 130, 160]
  );
  doc.para("No GPU or special-purpose hardware is required anywhere in the stack. Veritas does not train or host a neural network; its analysis is rule-based pattern matching plus live evidence retrieval, which is a deliberate choice justified in section 3.4 and Chapter 5.", { gap: 6 });

  doc.h3("3.1.2", "Software Requirements");
  doc.table(
    ["Software", "Version used", "Role in the project", "Why this choice"],
    [
      ["Operating system", "Windows 11 / Linux", "Development environment", "Any OS with Bun and a browser works; nothing is OS-specific."],
      ["Bun", "1.x", "Package manager, script runner, test runner", "Fast installs and native TypeScript execution; the project was bootstrapped on Bun."],
      ["TypeScript", "5.x", "Language for frontend and backend", "Catches shape errors between engine output and UI before they reach users; essential in a 4,000+ line analysis engine."],
      ["React", "19", "User interface library", "Component model fits the report's many small sections; reactive re-render when new investigations arrive."],
      ["Vite", "7.x", "Build tool and dev server", "Instant module serving during development; simple production bundling."],
      ["React Router", "7.x", "Client-side routing for /, /desk, /analysis", "Keeps the three main views as separate URLs that can be bookmarked and shared."],
      ["Tailwind CSS", "4.x", "Utility-first styling", "Keeps the dense editorial layout consistent; mobile/desktop behaviour expressed as small class differences."],
      ["shadcn/ui + Radix", "current", "Accessible base components", "Dialogs, tabs and buttons with keyboard and screen-reader behaviour already solved."],
      ["Framer Motion", "11/12.x", "Animation", "Entrance animations and the Trace replay motion, with prefers-reduced-motion respected."],
      ["Three.js", "0.186", "Landing-page background scene", "One decorative 3-D element on the cover page only; excluded from the report UI."],
      ["Convex + Convex Auth", "current", "Backend functions, database, authentication", "Serverless functions with a reactive document store; no separate server to run or deploy."],
      ["Git + GitHub", "current", "Version control", "Every engine change reviewed as a diff; recovery point for the large refactor iterations."],
    ],
    [90, 60, 120, 140]
  );
  doc.para("The distinguishing software decision is Convex. A fact-checking investigation is a naturally asynchronous, multi-stage job: fetch, extract, search per claim, assess. Convex actions handle the external calls, and its reactive queries push the finished case file to the open browser without polling. This removed the need to write and host a separate REST API, which mattered for a one-person project with a fixed timeline.", { gap: 6 });

  doc.h2("3.2", "Interview Questions (Open-ended and Close-ended)");
  doc.para("Users were interviewed in two rounds: an exploratory round before design (open-ended), and a validation round on the working prototype (close-ended). The questions and a summary of the answers are recorded here because several of them changed the design directly.");
  doc.h3("3.2.1", "Open-ended Questions");
  doc.table(
    ["#", "Question asked", "Summary of responses"],
    [
      ["O1", "Walk me through the last message you checked by hand. What did you do?", "Most opened the original source if there was one; none compared dates systematically; all described the process as \u201Ctoo much work to do every time.\u201D"],
      ["O2", "What would make you trust an automated check?", "Answers converged on \u201Cshow me the actual sources,\u201D not on any accuracy figure. This motivated the evidence-chain UI."],
      ["O3", "What should the tool say when it cannot check something?", "All five preferred an explicit refusal over a best guess. This motivated the RETRIEVAL FAILED state."],
      ["O4", "Have you ever seen a story that was half-true?", "Everyone had. Participants spontaneously described headlines that were technically true but misleading. This supported claim-level (not article-level) analysis."],
      ["O5", "Where do you usually read these articles?", "Predominantly phones; several forwards arrive inside chat apps. This fixed mobile-first layout as a requirement."],
    ],
    [24, 190, 196]
  );
  doc.h3("3.2.2", "Close-ended Questions");
  doc.table(
    ["#", "Question (yes/no)", "Yes", "Design consequence"],
    [
      ["C1", "Would you paste article text if a URL fails?", "5/5", "The dual input mode (URL or text) was kept and made visible."],
      ["C2", "Is a percentage confidence useful on its own?", "1/5", "Confidence is always shown with its reasoning text, never bare."],
      ["C3", "Do you want to see the search queries used?", "3/5", "Trace stages name what was searched at a high level; raw query strings stay in the replay detail."],
      ["C4", "Should old evidence be treated the same as fresh evidence?", "0/5", "Freshness classification (current / recent / historical / unknown) was added per claim."],
      ["C5", "Is it acceptable that Instagram posts cannot be checked?", "4/5", "The named-platform failure message was kept as designed."],
    ],
    [24, 150, 30, 206]
  );

  doc.h2("3.3", "Data Collection Plan (Requirement Gathering)");
  doc.para("Requirements were gathered through three instruments, used in this order. First, the user interviews summarised above (five participants, two rounds) established priorities: transparency over automation depth, honesty over confidence, mobile usability. Second, a walkthrough of real forwarded content was performed: twelve items that had circulated in community groups were collected (with permission) and used as reference cases throughout development. These are not a benchmark dataset — no accuracy claims are made from them — but they exercised the pipeline against realistic inputs, including one Instagram post, one paywalled article, and one press-release-style page with almost no checkable claims. Third, a small diary study asked two volunteers to note, over one week, every moment they wanted more information from the prototype. The diary produced the request that became the Trace replay (they wanted to know \u201Cwhat did it actually do while I waited?\u201D).");
  doc.para("The plan deliberately avoided collecting anything that would create fake precision. No survey scores were aggregated into an \u201Caccuracy\u201D number, because five users and twelve items cannot support one, and because the engine's behaviour is deterministic and inspectable rather than statistical. Wherever this report states a result, it is the observed output of a specific documented test case (Chapter 4, Testing), not a statistical generalisation.");

  doc.h2("3.4", "Supporting Material (Apps / Websites / Prototypes)");
  doc.para("Before writing code, existing systems were studied to see what worked and what was missing. The findings below also justify the honest claim, made in Chapter 5, that Veritas combines known techniques rather than inventing new ones.");
  doc.table(
    ["System / resource", "What it does", "What Veritas took from it", "What Veritas does differently"],
    [
      ["FullFact / FactCheck.org", "Professional human fact-checks of selected claims", "The discipline of stating evidence explicitly with each verdict", "Automates the first pass on arbitrary user-supplied URLs; not limited to selected stories"],
      ["Google Fact Check Explorer", "Search over published fact-checks", "Demonstrated that coverage is sparse — most circulating content has no published ruling", "Retrieves fresh independent coverage instead of only published fact-checks"],
      ["ClaimReview / schema.org markup", "Structured format for fact-check metadata", "The idea of machine-readable claim records", "Applied inside the app's own data model rather than for SEO"],
      ["FEVER-style pipelines [3]", "Claim + retrieved-wiki-evidence \u2192 label", "The retrieve-then-verify structure and label set (supported / refuted / not enough info)", "Veritas uses the open web instead of one corpus, and reports per-source relationships"],
      ["Academic surveys [1], [2]", "Taxonomies of fact-checking tasks", "Vocabulary: claim detection, evidence retrieval, verdict, justification", "Adds a user-facing trace and an explicit retrieval-failure state, which the surveyed systems lack"],
    ],
    [95, 105, 110, 110]
  );
  doc.para("A caution was also recorded here because it matters for honesty: a 2026 research benchmark named \u201CVeriTaS\u201D exists in recent literature. It is a dataset/benchmark effort and is entirely unrelated to this project. This student-built application was named Veritas independently; the similarity of the names is coincidental, and no result in this report relates to that benchmark.", { gap: 6 });
  doc.para("Prototypes: three paper wireframes and two throwaway React prototypes were produced before the final build. Prototype 1 fixed the report-section layout (numbered sections, evidence per claim). Prototype 2 introduced the Trace timeline after the diary study. Both were shown to the interview participants, and their feedback is the origin of the current interface's most distinctive behaviours.");
}

// Design diagrams now live in chapter 5 (Research Methodology) of
// chapters5to11.mjs, matching the teacher template's chapter order.
