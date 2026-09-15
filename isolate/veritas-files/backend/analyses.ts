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
