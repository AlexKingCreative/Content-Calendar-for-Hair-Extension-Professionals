import { storage } from "./storage";
import type { InsertInstagramMedia, InsertInstagramDailyInsights } from "@shared/schema";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface InstagramUserData {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
  profile_picture_url?: string;
}

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramMediaInsights {
  reach?: number;
  impressions?: number;
  saved?: number;
  shares?: number;
  engagement?: number;
}

export class InstagramService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor() {
    this.appId = process.env.INSTAGRAM_APP_ID || "";
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || "";
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.REPLIT_URL || "http://localhost:5000"}/api/instagram/callback`;
  }

  getAuthUrl(state: string): string {
    const scopes = [
      "instagram_basic",
      "instagram_manage_insights",
      "pages_show_list",
      "pages_read_engagement",
      "business_management"
    ].join(",");

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;
  }

  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&redirect_uri=${encodeURIComponent(this.redirectUri)}&code=${code}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  async getLongLivedToken(shortLivedToken: string): Promise<InstagramLongLivedTokenResponse> {
    const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${shortLivedToken}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get long-lived token: ${error}`);
    }

    return response.json();
  }

  async refreshLongLivedToken(token: string): Promise<InstagramLongLivedTokenResponse> {
    const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${token}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  async getInstagramBusinessAccountFromPages(accessToken: string): Promise<{ instagramAccountId: string; pageId: string; pageName: string } | null> {
    const pagesResponse = await fetch(`${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`);
    
    if (!pagesResponse.ok) {
      const error = await pagesResponse.text();
      throw new Error(`Failed to fetch pages: ${error}`);
    }

    const pagesData = await pagesResponse.json();
    
    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        return {
          instagramAccountId: page.instagram_business_account.id,
          pageId: page.id,
          pageName: page.name
        };
      }
    }
    
    return null;
  }

  async getInstagramUserData(instagramAccountId: string, accessToken: string): Promise<InstagramUserData> {
    const response = await fetch(`${GRAPH_API_BASE}/${instagramAccountId}?fields=id,username,account_type,media_count,followers_count,follows_count,profile_picture_url&access_token=${accessToken}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Instagram user data: ${error}`);
    }

    return response.json();
  }

  async getRecentMedia(instagramAccountId: string, accessToken: string, limit: number = 25): Promise<InstagramMediaItem[]> {
    const response = await fetch(`${GRAPH_API_BASE}/${instagramAccountId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch media: ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async getMediaInsights(mediaId: string, accessToken: string): Promise<InstagramMediaInsights> {
    try {
      const response = await fetch(`${GRAPH_API_BASE}/${mediaId}/insights?metric=reach,impressions,saved,shares,engagement&access_token=${accessToken}`);
      
      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      const insights: InstagramMediaInsights = {};
      
      for (const item of data.data || []) {
        if (item.name && item.values?.[0]?.value !== undefined) {
          (insights as any)[item.name] = item.values[0].value;
        }
      }
      
      return insights;
    } catch (error) {
      console.error("Failed to fetch media insights:", error);
      return {};
    }
  }

  async syncUserMedia(userId: string): Promise<{ synced: number; newPosts: number }> {
    const account = await storage.getInstagramAccount(userId);
    if (!account || !account.isActive) {
      throw new Error("No active Instagram account found");
    }

    const media = await this.getRecentMedia(account.instagramUserId, account.accessToken, 50);
    let synced = 0;
    let newPosts = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const item of media) {
      const postDate = new Date(item.timestamp).toISOString().split('T')[0];
      
      const existingMedia = await storage.getInstagramMediaByDate(userId, postDate);
      const isNew = !existingMedia.some(m => m.instagramMediaId === item.id);
      
      if (isNew) {
        newPosts++;
        
        // Auto-log post for streak if it's from today or recent
        // Only log if not already manually logged for that date
        try {
          const hasManualLog = await storage.hasPostedToday(userId, postDate);
          if (!hasManualLog) {
            await storage.logPost(userId, postDate, undefined);
            await storage.updateStreak(userId);
          }
        } catch (e) {
          // Streak logging failed, continue with media sync
          console.error("Failed to auto-log Instagram post for streak:", e);
        }
      }

      const insights = await this.getMediaInsights(item.id, account.accessToken);

      const mediaData: InsertInstagramMedia = {
        userId,
        instagramMediaId: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        permalink: item.permalink,
        caption: item.caption,
        timestamp: new Date(item.timestamp),
        likeCount: item.like_count || 0,
        commentsCount: item.comments_count || 0,
        reach: insights.reach || 0,
        impressions: insights.impressions || 0,
        saved: insights.saved || 0,
        shares: insights.shares || 0,
        engagement: insights.engagement || 0,
        postDate,
      };

      await storage.upsertInstagramMedia(mediaData);
      synced++;
    }

    await storage.updateInstagramAccount(userId, { lastSyncAt: new Date() });

    return { synced, newPosts };
  }

  async syncAccountStats(userId: string): Promise<void> {
    const account = await storage.getInstagramAccount(userId);
    if (!account || !account.isActive) {
      return;
    }

    try {
      const userData = await this.getInstagramUserData(account.instagramUserId, account.accessToken);
      
      await storage.updateInstagramAccount(userId, {
        followersCount: userData.followers_count || 0,
        followingCount: userData.follows_count || 0,
        mediaCount: userData.media_count || 0,
        profilePictureUrl: userData.profile_picture_url,
      });
    } catch (error) {
      console.error("Failed to sync account stats:", error);
    }
  }

  async hasPostedToday(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    return storage.hasInstagramPostOnDate(userId, today);
  }

  async checkAndRefreshToken(userId: string): Promise<boolean> {
    const account = await storage.getInstagramAccount(userId);
    if (!account || !account.isActive) {
      return false;
    }

    if (!account.tokenExpiresAt) {
      return true;
    }

    const expiresAt = new Date(account.tokenExpiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < 7) {
      try {
        const newToken = await this.refreshLongLivedToken(account.accessToken);
        const newExpiresAt = new Date(Date.now() + newToken.expires_in * 1000);
        
        await storage.updateInstagramAccount(userId, {
          accessToken: newToken.access_token,
          tokenExpiresAt: newExpiresAt,
        });
        
        return true;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return false;
      }
    }

    return true;
  }
}

export const instagramService = new InstagramService();
