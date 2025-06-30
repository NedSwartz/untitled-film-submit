import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSubmission = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    genre: v.string(),
    budget: v.optional(v.string()),
    fundingGoal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate video URL format
    const isValidUrl = args.videoUrl.includes('youtube.com') || 
                      args.videoUrl.includes('youtu.be') || 
                      args.videoUrl.includes('vimeo.com');
    
    if (!isValidUrl) {
      throw new Error("Please provide a valid YouTube or Vimeo URL");
    }

    const submissionId = await ctx.db.insert("filmSubmissions", {
      ...args,
      status: "submitted",
    });

    return { success: true, submissionId };
  },
});

export const getUserSubmissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("filmSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getAllSubmissions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("filmSubmissions")
      .order("desc")
      .collect();
  },
});

export const getSubmissionsByStatus = query({
  args: { status: v.union(v.literal("submitted"), v.literal("under_review"), v.literal("approved"), v.literal("featured")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("filmSubmissions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("filmSubmissions"),
    status: v.union(v.literal("submitted"), v.literal("under_review"), v.literal("approved"), v.literal("featured")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: args.status,
    });
    return { success: true };
  },
});