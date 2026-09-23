import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
    return analyses;
  },
});

export const get = query({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const analysis = await ctx.db.get(args.id);
    if (!analysis || analysis.userId !== identity.subject) return null;
    return analysis;
  },
});

export const create = mutation({
  args: {
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
        v.literal("contradiction"), v.literal("assessment"),
      ),
      title: v.string(),
      detail: v.string(),
      source: v.optional(v.string()),
      timestamp: v.optional(v.string()),
    }))),
    fingerprint: v.optional(v.object({
      claims: v.number(), sources: v.number(), verified: v.number(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db.insert("analyses", {
      userId: identity.subject,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const analysis = await ctx.db.get(args.id);
    if (!analysis || analysis.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    await ctx.db.delete(args.id);
  },
});
