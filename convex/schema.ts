
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    affiliation: v.optional(v.string()),
    socialLinks: v.array(v.string()),
    accountType: v.literal("filmmaker"),
    bio: v.optional(v.string()),
    profilePhotoUrl: v.optional(v.string()),
    isApproved: v.boolean(),
    isLMU: v.optional(v.boolean()), // Made optional to handle existing data
  }).index("by_email", ["email"])
    .index("by_username", ["username"]),

  filmSubmissions: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    genre: v.string(),
    budget: v.optional(v.string()),
    fundingGoal: v.optional(v.string()),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("featured")
    ),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  waitlist: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    affiliation: v.optional(v.string()),
    accountType: v.literal("filmmaker"),
    isLMU: v.boolean(),
  }).index("by_email", ["email"]),
});