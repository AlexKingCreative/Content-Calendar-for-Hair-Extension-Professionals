import { pgTable, serial, text, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";

export const contentTypes = ["Photo", "Video", "Reel", "Carousel", "Story", "Live"] as const;
export type ContentType = typeof contentTypes[number];

export const serviceCategories = [
  "Cutting Services",
  "Coloring Services", 
  "Extension Services",
  "Topper Services",
  "Wig Services"
] as const;
export type ServiceCategory = typeof serviceCategories[number];

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

export const experienceLevels = ["new", "growing", "established", "expert"] as const;
export type ExperienceLevel = typeof experienceLevels[number];

export const experienceLevelDescriptions: Record<ExperienceLevel, { label: string; description: string }> = {
  new: { label: "Just Starting Out", description: "Less than 1 year" },
  growing: { label: "Building My Business", description: "1-3 years" },
  established: { label: "Established Pro", description: "3-5 years" },
  expert: { label: "Industry Expert", description: "5+ years" },
};

export const contentGoalOptions = [
  { id: "clients", label: "Attract More Clients" },
  { id: "premium", label: "Book Premium Services" },
  { id: "consistent", label: "Post Consistently" },
  { id: "brand", label: "Build My Brand" },
  { id: "education", label: "Educate My Audience" },
  { id: "engagement", label: "Increase Engagement" },
] as const;
export type ContentGoal = typeof contentGoalOptions[number]["id"];

export const voiceOptions = ["solo_stylist", "salon"] as const;
export type VoiceOption = typeof voiceOptions[number];

export const toneOptions = ["professional", "neutral", "informal"] as const;
export type ToneOption = typeof toneOptions[number];

export const postingGoals = ["daily", "casual", "occasional"] as const;
export type PostingGoal = typeof postingGoals[number];

export const postingGoalDescriptions: Record<PostingGoal, { label: string; description: string; daysPerWeek: number }> = {
  daily: { label: "Daily", description: "Post every day", daysPerWeek: 7 },
  casual: { label: "Casual", description: "Post 3-4 times per week", daysPerWeek: 4 },
  occasional: { label: "Occasional", description: "Post 1-2 times per week", daysPerWeek: 2 },
};

export const streakMilestones = [
  { days: 3, badge: "Getting Started", icon: "flame" },
  { days: 7, badge: "One Week Wonder", icon: "star" },
  { days: 14, badge: "Consistent Creator", icon: "trophy" },
  { days: 30, badge: "Monthly Maven", icon: "crown" },
  { days: 60, badge: "Two Month Pro", icon: "gem" },
  { days: 90, badge: "Quarter Champion", icon: "medal" },
  { days: 180, badge: "Half Year Hero", icon: "rocket" },
  { days: 365, badge: "Annual All-Star", icon: "sparkles" },
] as const;

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
  serviceCategory: text("service_category").default("Extension Services"),
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

export const accountTypes = ["solo", "salon"] as const;
export type AccountType = typeof accountTypes[number];

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  city: text("city"),
  instagram: text("instagram"),
  experience: text("experience"),
  accountType: text("account_type").default("solo"),
  isSalonOwner: boolean("is_salon_owner").default(false),
  contentGoals: text("content_goals").array().default(sql`'{}'::text[]`),
  certifiedBrands: text("certified_brands").array().default(sql`'{}'::text[]`),
  customBrand: text("custom_brand"),
  extensionMethods: text("extension_methods").array().default(sql`'{}'::text[]`),
  offeredServices: text("offered_services").array().default(sql`'{}'::text[]`),
  postingServices: text("posting_services").array().default(sql`'{}'::text[]`),
  voice: text("voice").default("solo_stylist"),
  tone: text("tone").default("neutral"),
  postingGoal: text("posting_goal").default("casual"),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalPosts: integer("total_posts").default(0),
  isAdmin: boolean("is_admin").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  showStreaks: boolean("show_streaks").default(true),
  pushNotificationsEnabled: boolean("push_notifications_enabled").default(false),
  emailReminders: boolean("email_reminders").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("free"),
  freeAccessEndsAt: timestamp("free_access_ends_at"),
  firstStreakRewardClaimed: boolean("first_streak_reward_claimed").default(false),
  firstStreakRewardCoupon: text("first_streak_reward_coupon"),
  salonId: integer("salon_id"),
  salonRole: text("salon_role"),
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

export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  onboardingData: text("onboarding_data"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  city: text("city"),
  instagram: text("instagram"),
  experience: text("experience"),
  accountType: text("account_type").default("solo"),
  isSalonOwner: boolean("is_salon_owner").default(false),
  contentGoals: text("content_goals").array().default(sql`'{}'::text[]`),
  offeredServices: text("offered_services").array().default(sql`'{}'::text[]`),
  postingServices: text("posting_services").array().default(sql`'{}'::text[]`),
  certifiedBrands: text("certified_brands").array().default(sql`'{}'::text[]`),
  customBrand: text("custom_brand"),
  extensionMethods: text("extension_methods").array().default(sql`'{}'::text[]`),
  onboardingComplete: boolean("onboarding_complete").default(false),
  convertedToUser: boolean("converted_to_user").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reminderSentAt: true,
  convertedToUser: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

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

export const methods = pgTable("methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertMethodSchema = createInsertSchema(methods).omit({
  id: true,
  createdAt: true,
});

export type Method = typeof methods.$inferSelect;
export type InsertMethod = z.infer<typeof insertMethodSchema>;

export const postingLogs = pgTable("posting_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  postId: integer("post_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPostingLogSchema = createInsertSchema(postingLogs).omit({
  id: true,
  createdAt: true,
});

export type PostingLog = typeof postingLogs.$inferSelect;
export type InsertPostingLog = z.infer<typeof insertPostingLogSchema>;

// Post Submissions - for users to submit their Instagram posts to be featured
export const submissionStatuses = ["pending", "approved", "rejected"] as const;
export type SubmissionStatus = typeof submissionStatuses[number];

export const postSubmissions = pgTable("post_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id").notNull(),
  instagramUrl: text("instagram_url").notNull(),
  status: text("status").default("pending").notNull(),
  reviewNote: text("review_note"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPostSubmissionSchema = createInsertSchema(postSubmissions).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export type PostSubmission = typeof postSubmissions.$inferSelect;
export type InsertPostSubmission = z.infer<typeof insertPostSubmissionSchema>;

// Salons - for salon owner multi-seat licensing
export const salonSeatTiers = ["5-seats", "10-plus-seats"] as const;
export type SalonSeatTier = typeof salonSeatTiers[number];

export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  ownerUserId: varchar("owner_user_id").notNull().unique(),
  name: text("name").notNull(),
  instagramHandle: text("instagram_handle"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  seatTier: text("seat_tier").default("5-seats"),
  seatLimit: integer("seat_limit").default(5),
  billingStatus: text("billing_status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSalonSchema = createInsertSchema(salons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Salon = typeof salons.$inferSelect;
export type InsertSalon = z.infer<typeof insertSalonSchema>;

// Salon Members - stylists invited to a salon
export const invitationStatuses = ["pending", "accepted", "revoked"] as const;
export type InvitationStatus = typeof invitationStatuses[number];

export const salonMembers = pgTable("salon_members", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull(),
  email: text("email").notNull(),
  stylistUserId: varchar("stylist_user_id"),
  invitationToken: text("invitation_token").notNull().unique(),
  invitationStatus: text("invitation_status").default("pending").notNull(),
  invitedAt: timestamp("invited_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  acceptedAt: timestamp("accepted_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSalonMemberSchema = createInsertSchema(salonMembers).omit({
  id: true,
  createdAt: true,
  invitedAt: true,
  acceptedAt: true,
  revokedAt: true,
});

export type SalonMember = typeof salonMembers.$inferSelect;
export type InsertSalonMember = z.infer<typeof insertSalonMemberSchema>;

// Challenges - self-directed posting challenges
export const challengeTypes = ["daily", "weekly", "custom"] as const;
export type ChallengeType = typeof challengeTypes[number];

export const challengeStatuses = ["active", "completed", "abandoned"] as const;
export type ChallengeStatus = typeof challengeStatuses[number];

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("target"),
  durationDays: integer("duration_days").notNull(),
  challengeType: text("challenge_type").notNull().default("daily"),
  postsRequired: integer("posts_required"),
  rules: text("rules").array().default(sql`'{}'::text[]`),
  tips: text("tips").array().default(sql`'{}'::text[]`),
  badgeName: text("badge_name"),
  badgeIcon: text("badge_icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

// User Challenges - tracks user participation and progress
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
  abandonedAt: timestamp("abandoned_at"),
  postsCompleted: integer("posts_completed").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastPostDate: text("last_post_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  abandonedAt: true,
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

// Trend Alerts - admin-created trend notifications for users
export const trendAlerts = pgTable("trend_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url"),
  instagramUrl: text("instagram_url"),
  isActive: boolean("is_active").default(true),
  createdById: varchar("created_by_id"),
  publishedAt: timestamp("published_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertTrendAlertSchema = createInsertSchema(trendAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TrendAlert = typeof trendAlerts.$inferSelect;
export type InsertTrendAlert = z.infer<typeof insertTrendAlertSchema>;

// Salon Challenges - owner-created challenges for stylists
export const salonChallengeStatuses = ["active", "paused", "completed"] as const;
export type SalonChallengeStatus = typeof salonChallengeStatuses[number];

export const salonChallenges = pgTable("salon_challenges", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  rewardText: text("reward_text").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSalonChallengeSchema = createInsertSchema(salonChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SalonChallenge = typeof salonChallenges.$inferSelect;
export type InsertSalonChallenge = z.infer<typeof insertSalonChallengeSchema>;

// Stylist Challenge Assignments - tracks stylist progress on salon challenges
export const stylistChallengeStatuses = ["active", "completed", "expired", "abandoned"] as const;
export type StylistChallengeStatus = typeof stylistChallengeStatuses[number];

export const stylistChallenges = pgTable("stylist_challenges", {
  id: serial("id").primaryKey(),
  salonChallengeId: integer("salon_challenge_id").notNull(),
  stylistUserId: varchar("stylist_user_id").notNull(),
  salonId: integer("salon_id").notNull(),
  startDate: timestamp("start_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  targetDays: integer("target_days").notNull(),
  completedDays: integer("completed_days").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastPostDate: text("last_post_date"),
  status: text("status").default("active").notNull(),
  completedAt: timestamp("completed_at"),
  ownerNotifiedAt: timestamp("owner_notified_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertStylistChallengeSchema = createInsertSchema(stylistChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  ownerNotifiedAt: true,
});

export type StylistChallenge = typeof stylistChallenges.$inferSelect;
export type InsertStylistChallenge = z.infer<typeof insertStylistChallengeSchema>;

// Instagram Integration - Connected Accounts
export const instagramAccounts = pgTable("instagram_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  instagramUserId: varchar("instagram_user_id").notNull(),
  instagramUsername: text("instagram_username").notNull(),
  accessToken: text("access_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  pageId: varchar("page_id"),
  pageName: text("page_name"),
  profilePictureUrl: text("profile_picture_url"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  mediaCount: integer("media_count").default(0),
  lastSyncAt: timestamp("last_sync_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertInstagramAccountSchema = createInsertSchema(instagramAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InstagramAccount = typeof instagramAccounts.$inferSelect;
export type InsertInstagramAccount = z.infer<typeof insertInstagramAccountSchema>;

// Instagram Media - Synced posts from Instagram
export const instagramMedia = pgTable("instagram_media", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  instagramMediaId: varchar("instagram_media_id").notNull().unique(),
  mediaType: text("media_type").notNull(),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  permalink: text("permalink"),
  caption: text("caption"),
  timestamp: timestamp("timestamp").notNull(),
  likeCount: integer("like_count").default(0),
  commentsCount: integer("comments_count").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  saved: integer("saved").default(0),
  shares: integer("shares").default(0),
  engagement: integer("engagement").default(0),
  postDate: text("post_date").notNull(),
  syncedAt: timestamp("synced_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertInstagramMediaSchema = createInsertSchema(instagramMedia).omit({
  id: true,
  syncedAt: true,
  createdAt: true,
});

export type InstagramMedia = typeof instagramMedia.$inferSelect;
export type InsertInstagramMedia = z.infer<typeof insertInstagramMediaSchema>;

// Instagram Daily Insights - Aggregated daily analytics
export const instagramDailyInsights = pgTable("instagram_daily_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  profileViews: integer("profile_views").default(0),
  websiteClicks: integer("website_clicks").default(0),
  followersGained: integer("followers_gained").default(0),
  followersLost: integer("followers_lost").default(0),
  postsPublished: integer("posts_published").default(0),
  storiesPublished: integer("stories_published").default(0),
  reelsPublished: integer("reels_published").default(0),
  totalEngagement: integer("total_engagement").default(0),
  syncedAt: timestamp("synced_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertInstagramDailyInsightsSchema = createInsertSchema(instagramDailyInsights).omit({
  id: true,
  syncedAt: true,
  createdAt: true,
});

export type InstagramDailyInsights = typeof instagramDailyInsights.$inferSelect;
export type InsertInstagramDailyInsights = z.infer<typeof insertInstagramDailyInsightsSchema>;

// Pending Guest Checkouts - Stores checkout tokens for mobile guest checkout flow
export const pendingGuestCheckouts = pgTable("pending_guest_checkouts", {
  id: serial("id").primaryKey(),
  checkoutToken: varchar("checkout_token", { length: 64 }).notNull().unique(),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).notNull(),
  city: text("city"),
  certifiedBrands: text("certified_brands").array(),
  extensionMethods: text("extension_methods").array(),
  businessType: varchar("business_type", { length: 20 }).default("solo"),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPendingGuestCheckoutSchema = createInsertSchema(pendingGuestCheckouts).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export type PendingGuestCheckout = typeof pendingGuestCheckouts.$inferSelect;
export type InsertPendingGuestCheckout = z.infer<typeof insertPendingGuestCheckoutSchema>;
