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
      createdAt: v.number(),
    }).index("by_user", ["userId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
