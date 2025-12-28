import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedPosts } from "./seed";
import { insertPostSchema, categories, contentTypes, certifiedBrands, extensionMethods } from "@shared/schema";
import OpenAI from "openai";
import webpush from "web-push";
import { z } from "zod";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@hairextensioncalendar.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const requireAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const profile = await storage.getUserProfile(userId);
    if (!profile?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.userProfile = profile;
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);
  
  await seedPosts();

  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/month/:month", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid month" });
      }
      const posts = await storage.getPostsByMonth(month);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.get("/api/options", async (req, res) => {
    try {
      const dbBrands = await storage.getActiveBrands();
      const brandNames = dbBrands.length > 0 
        ? dbBrands.map(b => b.name) 
        : [...certifiedBrands];
      
      res.json({
        categories,
        contentTypes,
        certifiedBrands: brandNames,
        extensionMethods,
      });
    } catch (error) {
      res.json({
        categories,
        contentTypes,
        certifiedBrands,
        extensionMethods,
      });
    }
  });

  app.get("/api/brands", async (req, res) => {
    try {
      const allBrands = await storage.getAllBrands();
      res.json(allBrands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.post("/api/brands", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, isActive = true } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Brand name is required" });
      }
      const brand = await storage.createBrand({ name: name.trim(), isActive });
      res.json(brand);
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Brand already exists" });
      }
      res.status(500).json({ error: "Failed to create brand" });
    }
  });

  app.put("/api/brands/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid brand ID" });
      }
      const { name, isActive } = req.body;
      const brand = await storage.updateBrand(id, { 
        ...(name && { name: name.trim() }),
        ...(typeof isActive === "boolean" && { isActive }),
      });
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ error: "Failed to update brand" });
    }
  });

  app.delete("/api/brands/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid brand ID" });
      }
      const deleted = await storage.deleteBrand(id);
      if (!deleted) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete brand" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        profile = await storage.upsertUserProfile({
          userId,
          city: null,
          certifiedBrands: [],
          extensionMethods: [],
          isAdmin: false,
          onboardingComplete: false,
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { city, certifiedBrands, extensionMethods, voice, tone, postingGoal } = req.body;
      
      const profile = await storage.upsertUserProfile({
        userId,
        city: city || null,
        certifiedBrands: certifiedBrands || [],
        extensionMethods: extensionMethods || [],
        ...(voice && { voice }),
        ...(tone && { tone }),
        ...(postingGoal && { postingGoal }),
        onboardingComplete: true,
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/profile/hashtags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile || !profile.onboardingComplete) {
        return res.json({ hashtags: [] });
      }
      
      const hashtags: string[] = [];
      
      // Always add city + hairextensions first (priority)
      if (profile.city) {
        const cityTag = profile.city.replace(/\s+/g, "");
        hashtags.push(`#${cityTag}HairExtensions`);
      }
      
      // Add brand + hairextensions for each brand (priority)
      if (profile.certifiedBrands && profile.certifiedBrands.length > 0) {
        profile.certifiedBrands.forEach((brand: string) => {
          const brandTag = brand.replace(/\s+/g, "");
          hashtags.push(`#${brandTag}HairExtensions`);
        });
      }
      
      // Add a general extension method hashtag if we have room
      if (profile.extensionMethods && profile.extensionMethods.length > 0) {
        const method = profile.extensionMethods[0];
        const methodTag = method.replace(/[^a-zA-Z]/g, "");
        hashtags.push(`#${methodTag}Extensions`);
      }
      
      // Limit to 5 unique hashtags
      const uniqueHashtags = Array.from(new Set(hashtags)).slice(0, 5);
      
      res.json({ hashtags: uniqueHashtags });
    } catch (error) {
      console.error("Error generating hashtags:", error);
      res.status(500).json({ error: "Failed to generate hashtags" });
    }
  });

  app.put("/api/profile/posting-goal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postingGoal } = req.body;
      
      if (!["daily", "casual", "occasional"].includes(postingGoal)) {
        return res.status(400).json({ error: "Invalid posting goal" });
      }
      
      const profile = await storage.upsertUserProfile({
        userId,
        postingGoal,
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating posting goal:", error);
      res.status(500).json({ error: "Failed to update posting goal" });
    }
  });

  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      const today = new Date().toISOString().split('T')[0];
      const hasPostedToday = await storage.hasPostedToday(userId, today);
      const logs = await storage.getPostingLogs(userId, 30);
      
      res.json({
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
        totalPosts: profile?.totalPosts || 0,
        postingGoal: profile?.postingGoal || "casual",
        hasPostedToday,
        recentLogs: logs.map(l => l.date),
      });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ error: "Failed to fetch streak data" });
    }
  });

  app.post("/api/streak/log", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const { postId } = req.body;
      
      const hasPosted = await storage.hasPostedToday(userId, today);
      if (hasPosted) {
        return res.status(400).json({ error: "Already logged a post today" });
      }
      
      await storage.logPost(userId, today, postId);
      const profile = await storage.updateStreak(userId);
      
      res.json({
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        totalPosts: profile.totalPosts,
        hasPostedToday: true,
      });
    } catch (error) {
      console.error("Error logging post:", error);
      res.status(500).json({ error: "Failed to log post" });
    }
  });

  // Generate caption for a post using AI
  app.post("/api/posts/:id/generate-caption", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const prompt = `You are an expert social media copywriter for hair extension professionals. Generate an engaging Instagram caption for the following post idea.

Post Title: ${post.title}
Category: ${post.category}
Content Type: ${post.contentType}
Description: ${post.description}

Guidelines:
- Write in a friendly, professional tone that connects with clients
- Include a call-to-action (book now, DM for details, comment below, etc.)
- Keep it concise but engaging (2-4 short paragraphs max)
- Use line breaks for readability
- Do NOT include hashtags (those are added separately)
- Make it feel authentic and personal, not salesy
- Include 1-2 relevant emojis naturally placed

Return only the caption text, nothing else.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.8,
      });

      const caption = completion.choices[0]?.message?.content?.trim() || "";
      
      res.json({ caption });
    } catch (error) {
      console.error("Error generating caption:", error);
      res.status(500).json({ error: "Failed to generate caption" });
    }
  });

  app.get("/api/admin/posts", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/admin/posts", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.patch("/api/admin/posts/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const post = await storage.updatePost(id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(400).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/admin/posts/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const deleted = await storage.deletePost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  const generatePostSchema = z.object({
    month: z.number().min(1).max(12),
    day: z.number().min(1).max(31),
    theme: z.string().optional(),
    tone: z.enum(["professional", "casual", "fun", "educational"]).optional(),
  });

  app.post("/api/admin/posts/generate", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { month, day, theme, tone } = generatePostSchema.parse(req.body);
      
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      
      const prompt = `You are a social media content expert for hair extension professionals. Generate a social media post idea for ${monthNames[month - 1]} ${day}.

${theme ? `Theme/Topic: ${theme}` : ""}
${tone ? `Tone: ${tone}` : ""}

The post should be relevant to hair extension stylists and their clients. Consider seasonal events, holidays, and industry trends.

Respond in JSON format with these fields:
{
  "title": "Short catchy title (under 60 characters)",
  "description": "Detailed description of what to post (100-200 words)",
  "category": "One of: Educational, Before & After, Behind the Scenes, Client Spotlight, Product Showcase, Promotional, Engagement, Inspiration, Tips & Tricks, Trending",
  "contentType": "One of: Photo, Video, Reel, Carousel, Story, Live",
  "hashtags": ["Array of 5-10 relevant hashtags with # symbol"],
  "instagramExampleUrl": null
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "Failed to generate content" });
      }

      const generated = JSON.parse(content);
      
      const date = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const post = await storage.createPost({
        date,
        month,
        day,
        title: generated.title,
        description: generated.description,
        category: generated.category,
        contentType: generated.contentType,
        hashtags: generated.hashtags,
        instagramExampleUrl: generated.instagramExampleUrl,
        isAiGenerated: true,
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error generating post:", error);
      res.status(500).json({ error: "Failed to generate post" });
    }
  });

  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
  });

  app.post("/api/push/subscribe", async (req: any, res) => {
    try {
      const { subscription, preferredTime, timezone } = req.body;
      
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }

      const userId = req.user?.claims?.sub || null;
      
      await storage.createPushSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        preferredTime: preferredTime || "09:00",
        timezone: timezone || "America/New_York",
        isActive: true,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ error: "Failed to save subscription" });
    }
  });

  app.delete("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint required" });
      }

      await storage.deletePushSubscription(endpoint);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing subscription:", error);
      res.status(500).json({ error: "Failed to remove subscription" });
    }
  });

  app.post("/api/push/test", isAuthenticated, async (req: any, res) => {
    try {
      const post = await storage.getPostForToday();
      
      if (!post) {
        return res.status(404).json({ error: "No post for today" });
      }

      const subscriptions = await storage.getAllActivePushSubscriptions();
      
      const payload = JSON.stringify({
        title: "Today's Content Idea",
        body: post.title,
        url: "/",
        postId: post.id,
      });

      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          )
        )
      );

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      res.json({ sent: successCount, total: subscriptions.length });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  app.post("/api/admin/push/send-daily", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const post = await storage.getPostForToday();
      
      if (!post) {
        return res.status(404).json({ error: "No post for today" });
      }

      const subscriptions = await storage.getAllActivePushSubscriptions();
      
      const payload = JSON.stringify({
        title: "Daily Content Reminder",
        body: post.title,
        url: "/",
        postId: post.id,
      });

      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          ).catch(async (err) => {
            if (err.statusCode === 404 || err.statusCode === 410) {
              await storage.deletePushSubscription(sub.endpoint);
            }
            throw err;
          })
        )
      );

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      res.json({ sent: successCount, total: subscriptions.length, post: post.title });
    } catch (error) {
      console.error("Error sending daily notifications:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  return httpServer;
}
