import { db } from "./db";
import { posts, userProfiles, pushSubscriptions, brands, methods, postingLogs, postSubmissions, salons, salonMembers, challenges, userChallenges, trendAlerts, salonChallenges, stylistChallenges, instagramAccounts, instagramMedia, instagramDailyInsights, ashleys_advice, type Post, type InsertPost, type UserProfile, type InsertUserProfile, type PushSubscription, type InsertPushSubscription, type Brand, type InsertBrand, type Method, type InsertMethod, type PostingLog, type InsertPostingLog, type PostSubmission, type InsertPostSubmission, type Salon, type InsertSalon, type SalonMember, type InsertSalonMember, type Challenge, type InsertChallenge, type UserChallenge, type InsertUserChallenge, type TrendAlert, type InsertTrendAlert, type SalonChallenge, type InsertSalonChallenge, type StylistChallenge, type InsertStylistChallenge, type InstagramAccount, type InsertInstagramAccount, type InstagramMedia, type InsertInstagramMedia, type InstagramDailyInsights, type InsertInstagramDailyInsights, type AshleysAdvice, type InsertAshleysAdvice } from "@shared/schema";
import { eq, and, sql, desc, asc, gte, lte } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<Post[]>;
  getPostsByMonth(month: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostForToday(): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  getAllUserProfiles(): Promise<UserProfile[]>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
  updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; subscriptionStatus?: string }): Promise<UserProfile>;
  claimStreakReward(userId: string, couponId: string): Promise<UserProfile>;
  
  createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
  
  getAllBrands(): Promise<Brand[]>;
  getActiveBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<boolean>;
  
  getAllMethods(): Promise<Method[]>;
  getActiveMethods(): Promise<Method[]>;
  createMethod(method: InsertMethod): Promise<Method>;
  updateMethod(id: number, method: Partial<InsertMethod>): Promise<Method | undefined>;
  deleteMethod(id: number): Promise<boolean>;
  
  logPost(userId: string, date: string, postId?: number): Promise<PostingLog>;
  getPostingLogs(userId: string, limit?: number): Promise<PostingLog[]>;
  hasPostedToday(userId: string, date: string): Promise<boolean>;
  updateStreak(userId: string): Promise<UserProfile>;
  
  // Post Submissions
  createPostSubmission(submission: InsertPostSubmission): Promise<PostSubmission>;
  getPostSubmissions(status?: string): Promise<PostSubmission[]>;
  getPostSubmissionsByUser(userId: string): Promise<PostSubmission[]>;
  updatePostSubmissionStatus(id: number, status: string, reviewedBy: string, reviewNote?: string): Promise<PostSubmission | undefined>;
  getPendingSubmissionForPost(userId: string, postId: number): Promise<PostSubmission | undefined>;
  
  // Salons
  createSalon(salon: InsertSalon): Promise<Salon>;
  getSalon(id: number): Promise<Salon | undefined>;
  getSalonByOwner(ownerUserId: string): Promise<Salon | undefined>;
  updateSalon(id: number, data: Partial<InsertSalon>): Promise<Salon | undefined>;
  
  // Salon Members
  createSalonMember(member: InsertSalonMember): Promise<SalonMember>;
  getSalonMembers(salonId: number): Promise<SalonMember[]>;
  getSalonMemberByToken(token: string): Promise<SalonMember | undefined>;
  getSalonMemberByEmail(salonId: number, email: string): Promise<SalonMember | undefined>;
  updateSalonMember(id: number, data: Partial<SalonMember>): Promise<SalonMember | undefined>;
  revokeSalonMember(id: number): Promise<boolean>;
  acceptSalonInvitation(token: string, stylistUserId: string): Promise<SalonMember | undefined>;
  
  // Challenges
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallengeBySlug(slug: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;
  
  // User Challenges
  getUserChallenges(userId: string): Promise<UserChallenge[]>;
  getActiveUserChallenges(userId: string): Promise<UserChallenge[]>;
  getUserChallengeById(id: number): Promise<UserChallenge | undefined>;
  startChallenge(userId: string, challengeId: number): Promise<UserChallenge>;
  updateUserChallengeProgress(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined>;
  abandonChallenge(id: number): Promise<UserChallenge | undefined>;
  completeChallenge(id: number): Promise<UserChallenge | undefined>;
  getActiveUserChallengeForChallenge(userId: string, challengeId: number): Promise<UserChallenge | undefined>;
  
  // Trend Alerts
  getAllTrendAlerts(): Promise<TrendAlert[]>;
  getActiveTrendAlerts(): Promise<TrendAlert[]>;
  getTrendAlertById(id: number): Promise<TrendAlert | undefined>;
  createTrendAlert(alert: InsertTrendAlert): Promise<TrendAlert>;
  updateTrendAlert(id: number, data: Partial<InsertTrendAlert>): Promise<TrendAlert | undefined>;
  deleteTrendAlert(id: number): Promise<boolean>;
  
  // Salon Challenges
  createSalonChallenge(challenge: InsertSalonChallenge): Promise<SalonChallenge>;
  getSalonChallenges(salonId: number): Promise<SalonChallenge[]>;
  getSalonChallengeById(id: number): Promise<SalonChallenge | undefined>;
  updateSalonChallenge(id: number, data: Partial<InsertSalonChallenge>): Promise<SalonChallenge | undefined>;
  deleteSalonChallenge(id: number): Promise<boolean>;
  
  // Stylist Challenges
  createStylistChallenge(challenge: InsertStylistChallenge): Promise<StylistChallenge>;
  getStylistChallenges(stylistUserId: string): Promise<StylistChallenge[]>;
  getStylistChallengesBySalon(salonId: number): Promise<StylistChallenge[]>;
  getStylistChallengeById(id: number): Promise<StylistChallenge | undefined>;
  getActiveStylistChallenge(stylistUserId: string, salonChallengeId: number): Promise<StylistChallenge | undefined>;
  updateStylistChallenge(id: number, data: Partial<StylistChallenge>): Promise<StylistChallenge | undefined>;
  incrementStylistChallengeProgress(id: number): Promise<StylistChallenge | undefined>;
  markStylistChallengeCompleted(id: number): Promise<StylistChallenge | undefined>;
  markOwnerNotified(id: number): Promise<StylistChallenge | undefined>;
  
  // Instagram Integration
  getInstagramAccount(userId: string): Promise<InstagramAccount | undefined>;
  getAllInstagramAccounts(): Promise<InstagramAccount[]>;
  createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount>;
  updateInstagramAccount(userId: string, data: Partial<InsertInstagramAccount>): Promise<InstagramAccount | undefined>;
  deleteInstagramAccount(userId: string): Promise<boolean>;
  
  // Instagram Media
  getInstagramMedia(userId: string, limit?: number): Promise<InstagramMedia[]>;
  getInstagramMediaByDate(userId: string, date: string): Promise<InstagramMedia[]>;
  hasInstagramPostOnDate(userId: string, date: string): Promise<boolean>;
  upsertInstagramMedia(media: InsertInstagramMedia): Promise<InstagramMedia>;
  
  // Instagram Insights
  getInstagramDailyInsights(userId: string, startDate: string, endDate: string): Promise<InstagramDailyInsights[]>;
  upsertInstagramDailyInsights(insights: InsertInstagramDailyInsights): Promise<InstagramDailyInsights>;
  
  // Ashley's Advice
  getAllAshleysAdvice(): Promise<AshleysAdvice[]>;
  getActiveAshleysAdvice(): Promise<AshleysAdvice[]>;
  getRandomAshleysAdvice(): Promise<AshleysAdvice | undefined>;
  getAshleysAdviceById(id: number): Promise<AshleysAdvice | undefined>;
  createAshleysAdvice(advice: InsertAshleysAdvice): Promise<AshleysAdvice>;
  updateAshleysAdvice(id: number, data: Partial<InsertAshleysAdvice>): Promise<AshleysAdvice | undefined>;
  deleteAshleysAdvice(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(posts.month, posts.day);
  }

  async getPostsByMonth(month: number): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.month, month)).orderBy(posts.day);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    const [updated] = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    return db.select().from(userProfiles).orderBy(desc(userProfiles.createdAt));
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, profile.userId));
    
    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(userProfiles.userId, profile.userId))
        .returning();
      return updated;
    } else {
      const freeAccessEndsAt = new Date();
      freeAccessEndsAt.setDate(freeAccessEndsAt.getDate() + 3);
      
      const [created] = await db.insert(userProfiles).values({
        ...profile,
        freeAccessEndsAt,
        subscriptionStatus: "free",
      }).returning();
      return created;
    }
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(userProfiles).set({ isAdmin, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; subscriptionStatus?: string }): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...info, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async claimStreakReward(userId: string, couponId: string): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ 
        firstStreakRewardClaimed: true, 
        firstStreakRewardCoupon: couponId,
        updatedAt: new Date() 
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getPostForToday(): Promise<Post | undefined> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const [post] = await db.select().from(posts).where(and(eq(posts.month, month), eq(posts.day, day))).limit(1);
    return post;
  }

  async createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription> {
    const [existing] = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
    
    if (existing) {
      const [updated] = await db
        .update(pushSubscriptions)
        .set({ ...sub, updatedAt: new Date() })
        .where(eq(pushSubscriptions.endpoint, sub.endpoint))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(pushSubscriptions).values(sub).returning();
      return created;
    }
  }

  async getPushSubscription(endpoint: string): Promise<PushSubscription | undefined> {
    const [sub] = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return sub;
  }

  async getAllActivePushSubscriptions(): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.isActive, true));
  }

  async deletePushSubscription(endpoint: string): Promise<boolean> {
    const result = await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).returning();
    return result.length > 0;
  }

  async getAllBrands(): Promise<Brand[]> {
    return db.select().from(brands).orderBy(asc(brands.displayOrder), asc(brands.name));
  }

  async getActiveBrands(): Promise<Brand[]> {
    return db.select().from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.displayOrder), asc(brands.name));
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(brand).returning();
    return created;
  }

  async updateBrand(id: number, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [updated] = await db
      .update(brands)
      .set(brandData)
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async deleteBrand(id: number): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning();
    return result.length > 0;
  }

  async getAllMethods(): Promise<Method[]> {
    return db.select().from(methods).orderBy(asc(methods.displayOrder), asc(methods.name));
  }

  async getActiveMethods(): Promise<Method[]> {
    return db.select().from(methods).where(eq(methods.isActive, true)).orderBy(asc(methods.displayOrder), asc(methods.name));
  }

  async createMethod(method: InsertMethod): Promise<Method> {
    const [created] = await db.insert(methods).values(method).returning();
    return created;
  }

  async updateMethod(id: number, methodData: Partial<InsertMethod>): Promise<Method | undefined> {
    const [updated] = await db
      .update(methods)
      .set(methodData)
      .where(eq(methods.id, id))
      .returning();
    return updated;
  }

  async deleteMethod(id: number): Promise<boolean> {
    const result = await db.delete(methods).where(eq(methods.id, id)).returning();
    return result.length > 0;
  }

  async logPost(userId: string, date: string, postId?: number): Promise<PostingLog> {
    const [log] = await db.insert(postingLogs).values({ userId, date, postId }).returning();
    return log;
  }

  async getPostingLogs(userId: string, limit: number = 30): Promise<PostingLog[]> {
    return db.select().from(postingLogs).where(eq(postingLogs.userId, userId)).orderBy(desc(postingLogs.date)).limit(limit);
  }

  async hasPostedToday(userId: string, date: string): Promise<boolean> {
    const [log] = await db.select().from(postingLogs).where(and(eq(postingLogs.userId, userId), eq(postingLogs.date, date)));
    return !!log;
  }

  async updateStreak(userId: string): Promise<UserProfile> {
    const logs = await this.getPostingLogs(userId, 365);
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error("Profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    const logDates = new Set(logs.map(l => l.date));
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (logDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    const longestStreak = Math.max(profile.longestStreak || 0, currentStreak);
    const totalPosts = logs.length;
    
    const [updated] = await db
      .update(userProfiles)
      .set({ currentStreak, longestStreak, totalPosts, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    return updated;
  }

  // Post Submissions
  async createPostSubmission(submission: InsertPostSubmission): Promise<PostSubmission> {
    const [created] = await db.insert(postSubmissions).values(submission).returning();
    return created;
  }

  async getPostSubmissions(status?: string): Promise<PostSubmission[]> {
    if (status) {
      return db.select().from(postSubmissions).where(eq(postSubmissions.status, status)).orderBy(desc(postSubmissions.createdAt));
    }
    return db.select().from(postSubmissions).orderBy(desc(postSubmissions.createdAt));
  }

  async getPostSubmissionsByUser(userId: string): Promise<PostSubmission[]> {
    return db.select().from(postSubmissions).where(eq(postSubmissions.userId, userId)).orderBy(desc(postSubmissions.createdAt));
  }

  async updatePostSubmissionStatus(id: number, status: string, reviewedBy: string, reviewNote?: string): Promise<PostSubmission | undefined> {
    const [updated] = await db
      .update(postSubmissions)
      .set({ status, reviewedBy, reviewNote, reviewedAt: new Date() })
      .where(eq(postSubmissions.id, id))
      .returning();
    return updated;
  }

  async getPendingSubmissionForPost(userId: string, postId: number): Promise<PostSubmission | undefined> {
    const [submission] = await db.select().from(postSubmissions)
      .where(and(
        eq(postSubmissions.userId, userId),
        eq(postSubmissions.postId, postId),
        eq(postSubmissions.status, "pending")
      ));
    return submission;
  }

  // Salons
  async createSalon(salon: InsertSalon): Promise<Salon> {
    const [created] = await db.insert(salons).values(salon).returning();
    return created;
  }

  async getSalon(id: number): Promise<Salon | undefined> {
    const [salon] = await db.select().from(salons).where(eq(salons.id, id));
    return salon;
  }

  async getSalonByOwner(ownerUserId: string): Promise<Salon | undefined> {
    const [salon] = await db.select().from(salons).where(eq(salons.ownerUserId, ownerUserId));
    return salon;
  }

  async updateSalon(id: number, data: Partial<InsertSalon>): Promise<Salon | undefined> {
    const [updated] = await db
      .update(salons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(salons.id, id))
      .returning();
    return updated;
  }

  // Salon Members
  async createSalonMember(member: InsertSalonMember): Promise<SalonMember> {
    const [created] = await db.insert(salonMembers).values(member).returning();
    return created;
  }

  async getSalonMembers(salonId: number): Promise<SalonMember[]> {
    return db.select().from(salonMembers).where(eq(salonMembers.salonId, salonId)).orderBy(desc(salonMembers.createdAt));
  }

  async getSalonMemberByToken(token: string): Promise<SalonMember | undefined> {
    const [member] = await db.select().from(salonMembers).where(eq(salonMembers.invitationToken, token));
    return member;
  }

  async getSalonMemberByEmail(salonId: number, email: string): Promise<SalonMember | undefined> {
    const [member] = await db.select().from(salonMembers)
      .where(and(eq(salonMembers.salonId, salonId), eq(salonMembers.email, email)));
    return member;
  }

  async updateSalonMember(id: number, data: Partial<SalonMember>): Promise<SalonMember | undefined> {
    const [updated] = await db
      .update(salonMembers)
      .set(data)
      .where(eq(salonMembers.id, id))
      .returning();
    return updated;
  }

  async revokeSalonMember(id: number): Promise<boolean> {
    const [updated] = await db
      .update(salonMembers)
      .set({ invitationStatus: "revoked", revokedAt: new Date() })
      .where(eq(salonMembers.id, id))
      .returning();
    return !!updated;
  }

  async acceptSalonInvitation(token: string, stylistUserId: string): Promise<SalonMember | undefined> {
    const member = await this.getSalonMemberByToken(token);
    if (!member || member.invitationStatus !== "pending") return undefined;
    
    const salon = await this.getSalon(member.salonId);
    if (!salon) return undefined;
    
    const [updated] = await db
      .update(salonMembers)
      .set({ stylistUserId, invitationStatus: "accepted", acceptedAt: new Date() })
      .where(eq(salonMembers.id, member.id))
      .returning();
    
    if (updated) {
      await db.update(userProfiles)
        .set({ salonId: salon.id, salonRole: "stylist", subscriptionStatus: "salon_member", updatedAt: new Date() })
        .where(eq(userProfiles.userId, stylistUserId));
    }
    
    return updated;
  }

  // Challenges
  async getAllChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).orderBy(asc(challenges.sortOrder), asc(challenges.name));
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).where(eq(challenges.isActive, true)).orderBy(asc(challenges.sortOrder), asc(challenges.name));
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengeBySlug(slug: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.slug, slug));
    return challenge;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [created] = await db.insert(challenges).values(challenge).returning();
    return created;
  }

  async updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const [updated] = await db
      .update(challenges)
      .set(data)
      .where(eq(challenges.id, id))
      .returning();
    return updated;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    const result = await db.delete(challenges).where(eq(challenges.id, id)).returning();
    return result.length > 0;
  }

  // User Challenges
  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    return db.select().from(userChallenges).where(eq(userChallenges.userId, userId)).orderBy(desc(userChallenges.createdAt));
  }

  async getActiveUserChallenges(userId: string): Promise<UserChallenge[]> {
    return db.select().from(userChallenges)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.status, "active")))
      .orderBy(desc(userChallenges.createdAt));
  }

  async getUserChallengeById(id: number): Promise<UserChallenge | undefined> {
    const [uc] = await db.select().from(userChallenges).where(eq(userChallenges.id, id));
    return uc;
  }

  async startChallenge(userId: string, challengeId: number): Promise<UserChallenge> {
    const [created] = await db.insert(userChallenges).values({
      userId,
      challengeId,
      status: "active",
    }).returning();
    return created;
  }

  async updateUserChallengeProgress(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const [updated] = await db
      .update(userChallenges)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userChallenges.id, id))
      .returning();
    return updated;
  }

  async abandonChallenge(id: number): Promise<UserChallenge | undefined> {
    const [updated] = await db
      .update(userChallenges)
      .set({ status: "abandoned", abandonedAt: new Date(), updatedAt: new Date() })
      .where(eq(userChallenges.id, id))
      .returning();
    return updated;
  }

  async completeChallenge(id: number): Promise<UserChallenge | undefined> {
    const [updated] = await db
      .update(userChallenges)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(userChallenges.id, id))
      .returning();
    return updated;
  }

  async getActiveUserChallengeForChallenge(userId: string, challengeId: number): Promise<UserChallenge | undefined> {
    const [uc] = await db.select().from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId),
        eq(userChallenges.status, "active")
      ));
    return uc;
  }

  // Trend Alerts
  async getAllTrendAlerts(): Promise<TrendAlert[]> {
    return db.select().from(trendAlerts).orderBy(desc(trendAlerts.publishedAt));
  }

  async getActiveTrendAlerts(): Promise<TrendAlert[]> {
    return db.select().from(trendAlerts)
      .where(eq(trendAlerts.isActive, true))
      .orderBy(desc(trendAlerts.publishedAt));
  }

  async getTrendAlertById(id: number): Promise<TrendAlert | undefined> {
    const [alert] = await db.select().from(trendAlerts).where(eq(trendAlerts.id, id));
    return alert;
  }

  async createTrendAlert(alert: InsertTrendAlert): Promise<TrendAlert> {
    const [created] = await db.insert(trendAlerts).values(alert).returning();
    return created;
  }

  async updateTrendAlert(id: number, data: Partial<InsertTrendAlert>): Promise<TrendAlert | undefined> {
    const [updated] = await db
      .update(trendAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trendAlerts.id, id))
      .returning();
    return updated;
  }

  async deleteTrendAlert(id: number): Promise<boolean> {
    const result = await db.delete(trendAlerts).where(eq(trendAlerts.id, id)).returning();
    return result.length > 0;
  }
  
  async createSalonChallenge(challenge: InsertSalonChallenge): Promise<SalonChallenge> {
    const [created] = await db.insert(salonChallenges).values(challenge).returning();
    return created;
  }
  
  async getSalonChallenges(salonId: number): Promise<SalonChallenge[]> {
    return db.select().from(salonChallenges).where(eq(salonChallenges.salonId, salonId)).orderBy(desc(salonChallenges.createdAt));
  }
  
  async getSalonChallengeById(id: number): Promise<SalonChallenge | undefined> {
    const [challenge] = await db.select().from(salonChallenges).where(eq(salonChallenges.id, id));
    return challenge;
  }
  
  async updateSalonChallenge(id: number, data: Partial<InsertSalonChallenge>): Promise<SalonChallenge | undefined> {
    const [updated] = await db.update(salonChallenges).set({ ...data, updatedAt: new Date() }).where(eq(salonChallenges.id, id)).returning();
    return updated;
  }
  
  async deleteSalonChallenge(id: number): Promise<boolean> {
    const result = await db.delete(salonChallenges).where(eq(salonChallenges.id, id)).returning();
    return result.length > 0;
  }
  
  async createStylistChallenge(challenge: InsertStylistChallenge): Promise<StylistChallenge> {
    const [created] = await db.insert(stylistChallenges).values(challenge).returning();
    return created;
  }
  
  async getStylistChallenges(stylistUserId: string): Promise<StylistChallenge[]> {
    return db.select().from(stylistChallenges).where(eq(stylistChallenges.stylistUserId, stylistUserId)).orderBy(desc(stylistChallenges.createdAt));
  }
  
  async getStylistChallengesBySalon(salonId: number): Promise<StylistChallenge[]> {
    return db.select().from(stylistChallenges).where(eq(stylistChallenges.salonId, salonId)).orderBy(desc(stylistChallenges.createdAt));
  }
  
  async getStylistChallengeById(id: number): Promise<StylistChallenge | undefined> {
    const [challenge] = await db.select().from(stylistChallenges).where(eq(stylistChallenges.id, id));
    return challenge;
  }
  
  async getActiveStylistChallenge(stylistUserId: string, salonChallengeId: number): Promise<StylistChallenge | undefined> {
    const [challenge] = await db.select().from(stylistChallenges)
      .where(and(
        eq(stylistChallenges.stylistUserId, stylistUserId),
        eq(stylistChallenges.salonChallengeId, salonChallengeId),
        eq(stylistChallenges.status, "active")
      ));
    return challenge;
  }
  
  async updateStylistChallenge(id: number, data: Partial<StylistChallenge>): Promise<StylistChallenge | undefined> {
    const [updated] = await db.update(stylistChallenges).set({ ...data, updatedAt: new Date() }).where(eq(stylistChallenges.id, id)).returning();
    return updated;
  }
  
  async incrementStylistChallengeProgress(id: number): Promise<StylistChallenge | undefined> {
    const challenge = await this.getStylistChallengeById(id);
    if (!challenge) return undefined;
    
    const today = new Date().toISOString().split('T')[0];
    const newCompletedDays = (challenge.completedDays || 0) + 1;
    const newStreak = challenge.lastPostDate === today ? challenge.currentStreak : (challenge.currentStreak || 0) + 1;
    
    const isCompleted = newCompletedDays >= challenge.targetDays;
    
    const [updated] = await db.update(stylistChallenges).set({
      completedDays: newCompletedDays,
      currentStreak: newStreak,
      lastPostDate: today,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? new Date() : null,
      updatedAt: new Date()
    }).where(eq(stylistChallenges.id, id)).returning();
    
    return updated;
  }
  
  async markStylistChallengeCompleted(id: number): Promise<StylistChallenge | undefined> {
    const [updated] = await db.update(stylistChallenges).set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(stylistChallenges.id, id)).returning();
    return updated;
  }
  
  async markOwnerNotified(id: number): Promise<StylistChallenge | undefined> {
    const [updated] = await db.update(stylistChallenges).set({
      ownerNotifiedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(stylistChallenges.id, id)).returning();
    return updated;
  }
  
  // Instagram Integration
  async getInstagramAccount(userId: string): Promise<InstagramAccount | undefined> {
    const [account] = await db.select().from(instagramAccounts).where(eq(instagramAccounts.userId, userId));
    return account;
  }
  
  async getAllInstagramAccounts(): Promise<InstagramAccount[]> {
    return db.select().from(instagramAccounts).where(eq(instagramAccounts.isActive, true));
  }
  
  async createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount> {
    const [created] = await db.insert(instagramAccounts).values(account).returning();
    return created;
  }
  
  async updateInstagramAccount(userId: string, data: Partial<InsertInstagramAccount>): Promise<InstagramAccount | undefined> {
    const [updated] = await db.update(instagramAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(instagramAccounts.userId, userId))
      .returning();
    return updated;
  }
  
  async deleteInstagramAccount(userId: string): Promise<boolean> {
    const result = await db.delete(instagramAccounts).where(eq(instagramAccounts.userId, userId));
    return true;
  }
  
  // Instagram Media
  async getInstagramMedia(userId: string, limit: number = 50): Promise<InstagramMedia[]> {
    return db.select().from(instagramMedia)
      .where(eq(instagramMedia.userId, userId))
      .orderBy(desc(instagramMedia.timestamp))
      .limit(limit);
  }
  
  async getInstagramMediaByDate(userId: string, date: string): Promise<InstagramMedia[]> {
    return db.select().from(instagramMedia)
      .where(and(
        eq(instagramMedia.userId, userId),
        eq(instagramMedia.postDate, date)
      ));
  }
  
  async hasInstagramPostOnDate(userId: string, date: string): Promise<boolean> {
    const media = await this.getInstagramMediaByDate(userId, date);
    return media.length > 0;
  }
  
  async upsertInstagramMedia(media: InsertInstagramMedia): Promise<InstagramMedia> {
    const existing = await db.select().from(instagramMedia)
      .where(eq(instagramMedia.instagramMediaId, media.instagramMediaId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(instagramMedia)
        .set({ ...media, syncedAt: new Date() })
        .where(eq(instagramMedia.instagramMediaId, media.instagramMediaId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(instagramMedia).values(media).returning();
    return created;
  }
  
  // Instagram Insights
  async getInstagramDailyInsights(userId: string, startDate: string, endDate: string): Promise<InstagramDailyInsights[]> {
    return db.select().from(instagramDailyInsights)
      .where(and(
        eq(instagramDailyInsights.userId, userId),
        gte(instagramDailyInsights.date, startDate),
        lte(instagramDailyInsights.date, endDate)
      ))
      .orderBy(desc(instagramDailyInsights.date));
  }
  
  async upsertInstagramDailyInsights(insights: InsertInstagramDailyInsights): Promise<InstagramDailyInsights> {
    const existing = await db.select().from(instagramDailyInsights)
      .where(and(
        eq(instagramDailyInsights.userId, insights.userId),
        eq(instagramDailyInsights.date, insights.date)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(instagramDailyInsights)
        .set({ ...insights, syncedAt: new Date() })
        .where(and(
          eq(instagramDailyInsights.userId, insights.userId),
          eq(instagramDailyInsights.date, insights.date)
        ))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(instagramDailyInsights).values(insights).returning();
    return created;
  }
  
  // Ashley's Advice
  async getAllAshleysAdvice(): Promise<AshleysAdvice[]> {
    return db.select().from(ashleys_advice).orderBy(desc(ashleys_advice.createdAt));
  }
  
  async getActiveAshleysAdvice(): Promise<AshleysAdvice[]> {
    return db.select().from(ashleys_advice)
      .where(eq(ashleys_advice.isActive, true))
      .orderBy(desc(ashleys_advice.createdAt));
  }
  
  async getRandomAshleysAdvice(): Promise<AshleysAdvice | undefined> {
    const activeAdvice = await this.getActiveAshleysAdvice();
    if (activeAdvice.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * activeAdvice.length);
    return activeAdvice[randomIndex];
  }
  
  async getAshleysAdviceById(id: number): Promise<AshleysAdvice | undefined> {
    const [advice] = await db.select().from(ashleys_advice).where(eq(ashleys_advice.id, id));
    return advice;
  }
  
  async createAshleysAdvice(advice: InsertAshleysAdvice): Promise<AshleysAdvice> {
    const [created] = await db.insert(ashleys_advice).values(advice).returning();
    return created;
  }
  
  async updateAshleysAdvice(id: number, data: Partial<InsertAshleysAdvice>): Promise<AshleysAdvice | undefined> {
    const [updated] = await db.update(ashleys_advice)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ashleys_advice.id, id))
      .returning();
    return updated;
  }
  
  async deleteAshleysAdvice(id: number): Promise<boolean> {
    const result = await db.delete(ashleys_advice).where(eq(ashleys_advice.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
