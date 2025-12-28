import { pgTable, serial, text, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";

export const contentTypes = ["Photo", "Video", "Reel", "Carousel", "Story", "Live"] as const;
export type ContentType = typeof contentTypes[number];

export const categories = [
  "Educational",
  "Before & After",
  "Behind the Scenes",
  "Client Spotlight",
  "Product Showcase",
  "Promotional",
  "Engagement",
  "Inspiration",
  "Tips & Tricks",
  "Trending"
] as const;
export type Category = typeof categories[number];

export const certifiedBrands = [
  "Great Lengths",
  "Bellami",
  "Hairdreams",
  "Hotheads",
  "IBE",
  "Natural Beaded Rows",
  "Habit Hand Tied",
  "Invisible Bead Extensions",
  "DreamCatchers",
  "Donna Bella",
  "Bohyme",
  "Babe Hair",
  "Halocouture",
  "Locks & Bonds"
] as const;
export type CertifiedBrand = typeof certifiedBrands[number];

export const extensionMethods = [
  "Tape-In",
  "Hand-Tied Weft",
  "Machine Weft",
  "Keratin/Fusion",
  "I-Tip/Micro Links",
  "Sew-In",
  "Clip-In",
  "Halo",
  "Ponytail",
  "K-Tip"
] as const;
export type ExtensionMethod = typeof extensionMethods[number];

export const voiceOptions = ["solo_stylist", "salon"] as const;
export type VoiceOption = typeof voiceOptions[number];

export const toneOptions = ["professional", "neutral", "informal"] as const;
export type ToneOption = typeof toneOptions[number];

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  contentType: text("content_type").notNull(),
  hashtags: text("hashtags").array().notNull().default(sql`'{}'::text[]`),
  instagramExampleUrl: text("instagram_example_url"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  city: text("city"),
  certifiedBrands: text("certified_brands").array().default(sql`'{}'::text[]`),
  extensionMethods: text("extension_methods").array().default(sql`'{}'::text[]`),
  voice: text("voice").default("solo_stylist"),
  tone: text("tone").default("neutral"),
  isAdmin: boolean("is_admin").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  preferredTime: text("preferred_time").default("09:00"),
  timezone: text("timezone").default("America/New_York"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
