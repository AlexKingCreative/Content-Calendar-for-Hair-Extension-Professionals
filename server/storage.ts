import { db } from "./db";
import { posts, userProfiles, type Post, type InsertPost, type UserProfile, type InsertUserProfile } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<Post[]>;
  getPostsByMonth(month: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
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
}

export const storage = new DatabaseStorage();
