import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Analysis history table
    analyses: defineTable({
      userId: v.string(),
      inputText: v.string(),
      inputType: v.union(v.literal("text"), v.literal("url")),
      verdict: v.union(
        v.literal("likely_real"),
        v.literal("likely_fake"),
        v.literal("uncertain"),
      ),
      confidence: v.number(),
      summary: v.string(),
      redFlags: v.array(v.string()),
      greenFlags: v.array(v.string()),
      reasoning: v.string(),
      triggeredKeywords: v.optional(v.array(v.string())),
      categoryBreakdown: v.optional(v.array(v.object({
        category: v.string(),
        type: v.union(v.literal("red"), v.literal("green")),
        score: v.number(),
        maxScore: v.number(),
        findings: v.array(v.string()),
      }))),
      wordCount: v.optional(v.number()),
      extractedText: v.optional(v.string()),
      claims: v.optional(v.array(v.object({
        id: v.number(),
        text: v.string(),
        status: v.union(
          v.literal("supported"), v.literal("uncertain"),
          v.literal("contradicted"), v.literal("needs_verification"),
        ),
        confidence: v.number(),
        evidence: v.string(),
        sources: v.array(v.string()),
        contradictingSources: v.array(v.string()),
        explanation: v.string(),
      }))),
      sourceProfile: v.optional(v.object({
        source: v.string(),
        domain: v.string(),
        author: v.string(),
        publishedDate: v.string(),
        updatedDate: v.string(),
        sourceType: v.string(),
        availableEvidence: v.array(v.string()),
        signals: v.array(v.object({ label: v.string(), available: v.boolean() })),
      })),
      evidenceTimeline: v.optional(v.array(v.object({
        id: v.number(),
        type: v.union(
          v.literal("claim_identified"), v.literal("source_found"),
          v.literal("source_searched"), v.literal("corroboration"),
          v.literal("contradiction"), v.literal("linguistic_analysis"),
          v.literal("assessment"),
        ),
        title: v.string(),
        detail: v.string(),
        source: v.optional(v.string()),
        timestamp: v.optional(v.string()),
      }))),
      fingerprint: v.optional(v.object({
        claims: v.number(), sources: v.number(),
        sourceRefs: v.optional(v.number()), // claim–source references
        verified: v.number(),
        uncertain: v.number(), contradicted: v.number(), unverified: v.number(),
        sourceCoverage: v.number(), evidenceFound: v.number(),
      })),
      crossCheck: v.optional(v.array(v.object({
        claimId: v.number(),
        claimText: v.string(),
        sources: v.array(v.object({
          name: v.string(), headline: v.string(), date: v.string(), excerpt: v.string(),
          relationship: v.union(
            v.literal("supports"), v.literal("contradicts"),
            v.literal("partial"), v.literal("insufficient"),
          ),
          url: v.optional(v.string()),
        })),
      }))),
      framingSignals: v.optional(v.array(v.object({
        type: v.string(),
        description: v.string(),
        severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      }))),
      freshness: v.optional(v.array(v.object({
        claimId: v.number(),
        claimText: v.string(),
        status: v.union(
          v.literal("current"), v.literal("recent"), v.literal("outdated"),
          v.literal("historical"), v.literal("unknown"),
        ),
        sourceDate: v.string(),
        ageDays: v.number(),
        newerAvailable: v.boolean(),
      }))),
      createdAt: v.number(),
    }).index("by_user", ["userId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
