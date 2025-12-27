import { db } from "./db";
import { posts, userProfiles, pushSubscriptions, type Post, type InsertPost, type UserProfile, type InsertUserProfile, type PushSubscription, type InsertPushSubscription } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<Post[]>;
  getPostsByMonth(month: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostForToday(): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
  
  createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
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
      const [created] = await db.insert(userProfiles).values(profile).returning();
      return created;
    }
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(userProfiles).set({ isAdmin, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
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
}

export const storage = new DatabaseStorage();
