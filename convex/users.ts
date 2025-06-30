import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    affiliation: v.optional(v.string()),
    socialLinks: v.array(v.string()),
    accountType: v.literal("filmmaker"),
    bio: v.optional(v.string()),
    isLMU: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check if username is taken
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    if (existingUsername) {
      throw new Error("Username is already taken");
    }

    // LMU users get priority - check email domain for LMU users
    if (args.isLMU) {
      const isValidLMUEmail = args.email.endsWith('@lmu.edu') || args.email.endsWith('@lion.lmu.edu');
      
      if (!isValidLMUEmail) {
        throw new Error("Please use your LMU email address for LMU affiliation");
      }

      // Create approved user for LMU emails
      const userId = await ctx.db.insert("users", {
        ...args,
        isApproved: true,
      });

      return { success: true, userId, message: "Account created successfully" };
    } else {
      // Non-LMU users go to waitlist
      await ctx.db.insert("waitlist", {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        affiliation: args.affiliation,
        accountType: args.accountType,
        isLMU: args.isLMU,
      });
      return { success: false, message: "Added to waitlist" };
    }
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getWaitlist = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("waitlist").collect();
  },
});

export const getLMUUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").filter((q) => q.eq(q.field("isLMU"), true)).collect();
  },
});

export const getNonLMUUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").filter((q) => q.eq(q.field("isLMU"), false)).collect();
  },
});

// Migration function to update existing users
export const updateExistingUsersWithLMUStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      if (user.isLMU === undefined) {
        // Check if email is LMU based
        const isLMUEmail = user.email.endsWith('@lmu.edu') || user.email.endsWith('@lion.lmu.edu');
        
        await ctx.db.patch(user._id, {
          isLMU: isLMUEmail,
        });
      }
    }
    
    return { updated: users.length };
  },
});