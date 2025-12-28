import { db } from "./db";
import { posts, userProfiles, pushSubscriptions, brands, postingLogs, type Post, type InsertPost, type UserProfile, type InsertUserProfile, type PushSubscription, type InsertPushSubscription, type Brand, type InsertBrand, type PostingLog, type InsertPostingLog } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

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
  
  createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
  
  getAllBrands(): Promise<Brand[]>;
  getActiveBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<boolean>;
  
  logPost(userId: string, date: string, postId?: number): Promise<PostingLog>;
  getPostingLogs(userId: string, limit?: number): Promise<PostingLog[]>;
  hasPostedToday(userId: string, date: string): Promise<boolean>;
  updateStreak(userId: string): Promise<UserProfile>;
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
    return db.select().from(brands).orderBy(brands.name);
  }

  async getActiveBrands(): Promise<Brand[]> {
    return db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.name);
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
}

export const storage = new DatabaseStorage();
