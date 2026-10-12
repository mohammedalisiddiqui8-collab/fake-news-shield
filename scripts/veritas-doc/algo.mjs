// Algorithms / pseudocode for claim verification, evidence matching, coverage.
export function retrieveAlgorithmPseudo(doc) {
  doc.code([
    "function verifyClaim(claim):",
    "  candidates <- search(claim.text, { limit: 8 })",
    "  if no candidates received:",
    "     record sentinel SOURCE_SEARCH_UNAVAILABLE   // notice, not a source",
    "     claim.status <- needs_verification; return",
    "  for each page in candidates:",
    "     rel <- classifyRelationship(page, claim)",
    "     // needs the proposition addressed, not just the topic:",
    "     if rel in {supports, contradicts, partial} and page.url is not null: keep",
    "  claims who assert a study: candidates <- followUpSearch(claim)  // corrections",
    "  weights <- sourceAuthority(kept)                            // wire > aggregator",
    "  s contradictions from low-authority only -> kept as notices, no flip",
    "  if supportsWithWeight > contradictsWithWeight:  claim.status <- supported",
    "  else if contradictsWithWeight dominating:       claim.status <- contradicted",
    "  else if partial dominates:                      claim.status <- uncertain",
    "  else:                                           claim.status <- needs_verification",
  ]);
}

export function coverageAlgorithmPseudo(doc) {
  doc.code([
    "function sourceCoverage(investigation):",
    "  unique  <- set of all retrieved URLs across claims   // duplicates collapse",
    "  refs    <- pairs (claim, url-based source)            // may exceed unique",
    "  covered <- count of claims having >=1 relevant source with url",
    "             (supporting OR contradicting both count as covered)",
    "  notices <- sentinel entries without url              // never counted",
    "  coverage <- covered / claimsCount (dash if claimsCount = 0)",
    "  return { uniqueSources: |unique|, refs, coverage }",
  ]);
}

export function verdictAlgorithmPseudo(doc) {
  doc.code([
    "function finalVerdict(claims, langSignals):",
    "  verified  <- claims.where(status = supported)",
    "  unverified<- claims.where(status = needs_verification)",
    "  contradicted <- claims.where(status = contradicted)",
    "  if verified.length >= 2 and contradicted.length = 0:",
    "       verdict <- LIKELY_CREDIBLE; cap confidence at 69%",
    "  else if contradicted.length > 0 and verified.length = 0:",
    "       verdict <- LIKELY_MISLEADING",
    "  else:",
    "       verdict <- UNCERTAIN; cap confidence at 55% if unverified majority",
    "  // Hard rules:",
    "  R1 any contradicted claim forbids LIKELY_CREDIBLE",
    "  R2 langSignals contribute zero weight to verdict arithmetic",
    "  return verdict, confidence, writtenReasoning(claims, langSignals)",
  ]);
}
