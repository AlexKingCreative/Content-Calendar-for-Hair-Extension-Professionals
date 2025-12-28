import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedPosts } from "./seed";
import { insertPostSchema, categories, contentTypes, certifiedBrands, extensionMethods, serviceCategories } from "@shared/schema";
import OpenAI from "openai";
import webpush from "web-push";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

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
      const dbMethods = await storage.getActiveMethods();
      const brandNames = dbBrands.length > 0 
        ? dbBrands.map(b => b.name) 
        : [...certifiedBrands];
      const methodNames = dbMethods.length > 0 
        ? dbMethods.map(m => m.name) 
        : [...extensionMethods];
      
      res.json({
        categories,
        contentTypes,
        certifiedBrands: brandNames,
        extensionMethods: methodNames,
        serviceCategories: [...serviceCategories],
      });
    } catch (error) {
      res.json({
        categories,
        contentTypes,
        certifiedBrands,
        extensionMethods,
        serviceCategories: [...serviceCategories],
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

  app.get("/api/methods", async (req, res) => {
    try {
      const allMethods = await storage.getAllMethods();
      res.json(allMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch methods" });
    }
  });

  app.post("/api/methods", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, isActive = true } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Method name is required" });
      }
      const method = await storage.createMethod({ name: name.trim(), isActive });
      res.json(method);
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Method already exists" });
      }
      res.status(500).json({ error: "Failed to create method" });
    }
  });

  app.put("/api/methods/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid method ID" });
      }
      const { name, isActive } = req.body;
      const method = await storage.updateMethod(id, { 
        ...(name && { name: name.trim() }),
        ...(typeof isActive === "boolean" && { isActive }),
      });
      if (!method) {
        return res.status(404).json({ error: "Method not found" });
      }
      res.json(method);
    } catch (error) {
      res.status(500).json({ error: "Failed to update method" });
    }
  });

  app.delete("/api/methods/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid method ID" });
      }
      const deleted = await storage.deleteMethod(id);
      if (!deleted) {
        return res.status(404).json({ error: "Method not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete method" });
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
      const { 
        city, 
        certifiedBrands, 
        extensionMethods,
        offeredServices,
        postingServices,
        voice, 
        tone, 
        postingGoal,
        showStreaks,
        pushNotificationsEnabled,
        emailReminders
      } = req.body;
      
      const updateData: any = {
        userId,
        onboardingComplete: true,
      };

      if (city !== undefined) updateData.city = city || null;
      if (certifiedBrands !== undefined) updateData.certifiedBrands = certifiedBrands || [];
      if (extensionMethods !== undefined) updateData.extensionMethods = extensionMethods || [];
      if (offeredServices !== undefined) updateData.offeredServices = offeredServices || [];
      if (postingServices !== undefined) updateData.postingServices = postingServices || [];
      if (voice !== undefined) updateData.voice = voice;
      if (tone !== undefined) updateData.tone = tone;
      if (postingGoal !== undefined) updateData.postingGoal = postingGoal;
      if (typeof showStreaks === "boolean") updateData.showStreaks = showStreaks;
      if (typeof pushNotificationsEnabled === "boolean") updateData.pushNotificationsEnabled = pushNotificationsEnabled;
      if (typeof emailReminders === "boolean") updateData.emailReminders = emailReminders;
      
      const profile = await storage.upsertUserProfile(updateData);
      
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

      const prompt = `You are an expert social media copywriter for hair professionals. Generate an engaging Instagram caption for the following post idea.

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

  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const allProfiles = await storage.getAllUserProfiles();
      
      const totalUsers = allProfiles.length;
      const activeSubscribers = allProfiles.filter(p => p.subscriptionStatus === "active").length;
      const trialingUsers = allProfiles.filter(p => p.subscriptionStatus === "trialing").length;
      const freeUsers = allProfiles.filter(p => !p.subscriptionStatus || p.subscriptionStatus === "free").length;
      
      const mrr = activeSubscribers * 1000;
      
      const recentSignups = allProfiles
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(p => ({
          userId: p.userId,
          createdAt: p.createdAt,
          subscriptionStatus: p.subscriptionStatus || "free",
        }));
      
      // Count brand popularity
      const brandCounts: Record<string, number> = {};
      allProfiles.forEach(p => {
        (p.certifiedBrands || []).forEach((brand: string) => {
          brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        });
      });
      const popularBrands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Count method popularity
      const methodCounts: Record<string, number> = {};
      allProfiles.forEach(p => {
        (p.extensionMethods || []).forEach((method: string) => {
          methodCounts[method] = (methodCounts[method] || 0) + 1;
        });
      });
      const popularMethods = Object.entries(methodCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      res.json({
        totalUsers,
        activeSubscribers,
        trialingUsers,
        freeUsers,
        mrr,
        recentSignups,
        popularBrands,
        popularMethods,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
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
      
      const prompt = `You are a social media content expert for hair professionals. Generate a social media post idea for ${monthNames[month - 1]} ${day}.

${theme ? `Theme/Topic: ${theme}` : ""}
${tone ? `Tone: ${tone}` : ""}

The post should be relevant to hair stylists and their clients. Consider seasonal events, holidays, and industry trends.

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

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe key:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });

  app.get("/api/billing/subscription-price", async (req, res) => {
    try {
      const priceInfo = await stripeService.getActiveSubscriptionPrice();
      res.json(priceInfo);
    } catch (error) {
      console.error("Error getting subscription price:", error);
      res.status(500).json({ error: "Failed to get subscription price" });
    }
  });

  app.get("/api/billing/access-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.json({ hasAccess: false, reason: "no_profile" });
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

      if (profile.subscriptionStatus === "active" || profile.subscriptionStatus === "trialing") {
        return res.json({ 
          hasAccess: true, 
          accessibleMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          subscriptionStatus: profile.subscriptionStatus 
        });
      }

      if (profile.freeAccessEndsAt && new Date(profile.freeAccessEndsAt) > now) {
        return res.json({ 
          hasAccess: true, 
          accessibleMonths: [currentMonth, nextMonth],
          freeAccessEndsAt: profile.freeAccessEndsAt,
          subscriptionStatus: "free" 
        });
      }

      return res.json({ 
        hasAccess: false, 
        accessibleMonths: [],
        subscriptionStatus: profile.subscriptionStatus || "expired",
        reason: "subscription_required" 
      });
    } catch (error) {
      console.error("Error checking access status:", error);
      res.status(500).json({ error: "Failed to check access status" });
    }
  });

  app.post("/api/billing/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userEmail = req.user?.claims?.email || `${userId}@user.replit.app`;
      const { withTrial } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(400).json({ error: "Profile not found" });
      }

      let customerId = profile.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(userEmail, userId);
        await storage.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const priceInfo = await stripeService.getActiveSubscriptionPrice();
      if (!priceInfo?.price_id) {
        return res.status(500).json({ error: "No subscription product available" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const priceId = priceInfo.price_id as string;
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/account?success=true`,
        `${baseUrl}/subscribe?canceled=true`,
        withTrial === true
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile?.stripeCustomerId) {
        return res.status(400).json({ error: "No billing account found" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session = await stripeService.createCustomerPortalSession(
        profile.stripeCustomerId,
        `${baseUrl}/account`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // ==================== POST SUBMISSIONS ====================
  
  // Submit an Instagram post to be featured
  app.post("/api/posts/:id/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      const { instagramUrl } = req.body;
      if (!instagramUrl || typeof instagramUrl !== "string") {
        return res.status(400).json({ error: "Instagram URL is required" });
      }
      
      // Validate Instagram URL format
      const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\/?/;
      if (!instagramRegex.test(instagramUrl)) {
        return res.status(400).json({ error: "Invalid Instagram URL format" });
      }
      
      // Check if user already has a pending submission for this post
      const existingSubmission = await storage.getPendingSubmissionForPost(userId, postId);
      if (existingSubmission) {
        return res.status(400).json({ error: "You already have a pending submission for this post" });
      }
      
      const submission = await storage.createPostSubmission({
        userId,
        postId,
        instagramUrl,
        status: "pending",
      });
      
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ error: "Failed to create submission" });
    }
  });

  // Get all submissions (admin only)
  app.get("/api/submissions", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const submissions = await storage.getPostSubmissions(status);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // Approve or reject a submission (admin only)
  app.patch("/api/submissions/:id/status", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid submission ID" });
      }
      
      const { status, reviewNote } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      
      const submission = await storage.updatePostSubmissionStatus(id, status, userId, reviewNote);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      // If approved, update the post's Instagram example URL
      if (status === "approved") {
        await storage.updatePost(submission.postId, {
          instagramExampleUrl: submission.instagramUrl,
        });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ error: "Failed to update submission" });
    }
  });

  // Get user's own submissions
  app.get("/api/users/me/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const submissions = await storage.getPostSubmissionsByUser(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // ==================== SALONS ====================
  
  // Create a salon (during owner onboarding)
  app.post("/api/salons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user already owns a salon
      const existingSalon = await storage.getSalonByOwner(userId);
      if (existingSalon) {
        return res.status(400).json({ error: "You already own a salon" });
      }
      
      const { name, instagramHandle, seatTier } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Salon name is required" });
      }
      
      // Determine seat limit based on tier
      const seatLimit = seatTier === "10-plus-seats" ? 10 : 5;
      
      const salon = await storage.createSalon({
        ownerUserId: userId,
        name: name.trim(),
        instagramHandle: instagramHandle?.trim() || null,
        seatTier: seatTier || "5-seats",
        seatLimit,
      });
      
      // Update user profile to be salon owner
      await storage.upsertUserProfile({
        userId,
        salonId: salon.id,
        salonRole: "owner",
      });
      
      res.json(salon);
    } catch (error) {
      console.error("Error creating salon:", error);
      res.status(500).json({ error: "Failed to create salon" });
    }
  });

  // Get current user's salon
  app.get("/api/salons/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const salon = await storage.getSalonByOwner(userId);
      if (!salon) {
        return res.status(404).json({ error: "No salon found" });
      }
      
      // Get members for this salon
      const members = await storage.getSalonMembers(salon.id);
      const acceptedMembers = members.filter(m => m.invitationStatus === "accepted");
      
      // Get streak info for each accepted member
      const membersWithStreaks = await Promise.all(
        acceptedMembers.map(async (member) => {
          if (member.stylistUserId) {
            const profile = await storage.getUserProfile(member.stylistUserId);
            return {
              ...member,
              currentStreak: profile?.currentStreak || 0,
              totalPosts: profile?.totalPosts || 0,
            };
          }
          return { ...member, currentStreak: 0, totalPosts: 0 };
        })
      );
      
      res.json({
        ...salon,
        members,
        membersWithStreaks,
        seatCount: acceptedMembers.length,
      });
    } catch (error) {
      console.error("Error fetching salon:", error);
      res.status(500).json({ error: "Failed to fetch salon" });
    }
  });

  // Update salon
  app.put("/api/salons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid salon ID" });
      }
      
      const salon = await storage.getSalon(id);
      if (!salon || salon.ownerUserId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { name, instagramHandle } = req.body;
      const updated = await storage.updateSalon(id, {
        name: name?.trim() || salon.name,
        instagramHandle: instagramHandle?.trim() || salon.instagramHandle,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating salon:", error);
      res.status(500).json({ error: "Failed to update salon" });
    }
  });

  // Invite a stylist to the salon
  app.post("/api/salons/:id/invitations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const salonId = parseInt(req.params.id);
      if (isNaN(salonId)) {
        return res.status(400).json({ error: "Invalid salon ID" });
      }
      
      const salon = await storage.getSalon(salonId);
      if (!salon || salon.ownerUserId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { email } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email is required" });
      }
      
      // Check seat limit
      const members = await storage.getSalonMembers(salonId);
      const activeMembers = members.filter(m => m.invitationStatus !== "revoked");
      if (activeMembers.length >= (salon.seatLimit || 5)) {
        return res.status(400).json({ error: "Seat limit reached. Please upgrade your plan." });
      }
      
      // Check for existing invitation
      const existingMember = await storage.getSalonMemberByEmail(salonId, email.toLowerCase());
      if (existingMember) {
        return res.status(400).json({ error: "This email has already been invited" });
      }
      
      // Generate invitation token
      const invitationToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const member = await storage.createSalonMember({
        salonId,
        email: email.toLowerCase(),
        invitationToken,
        invitationStatus: "pending",
      });
      
      res.json(member);
    } catch (error) {
      console.error("Error inviting stylist:", error);
      res.status(500).json({ error: "Failed to invite stylist" });
    }
  });

  // Accept a salon invitation
  app.patch("/api/salon-invitations/:token", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { token } = req.params;
      const member = await storage.acceptSalonInvitation(token, userId);
      if (!member) {
        return res.status(404).json({ error: "Invalid or expired invitation" });
      }
      
      res.json(member);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  // Get invitation details (for preview before accepting)
  app.get("/api/salon-invitations/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const member = await storage.getSalonMemberByToken(token);
      if (!member || member.invitationStatus !== "pending") {
        return res.status(404).json({ error: "Invalid or expired invitation" });
      }
      
      const salon = await storage.getSalon(member.salonId);
      res.json({
        salonName: salon?.name,
        salonInstagram: salon?.instagramHandle,
        email: member.email,
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ error: "Failed to fetch invitation" });
    }
  });

  // Revoke a salon member
  app.delete("/api/salons/:salonId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const salonId = parseInt(req.params.salonId);
      const memberId = parseInt(req.params.memberId);
      
      if (isNaN(salonId) || isNaN(memberId)) {
        return res.status(400).json({ error: "Invalid IDs" });
      }
      
      const salon = await storage.getSalon(salonId);
      if (!salon || salon.ownerUserId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const success = await storage.revokeSalonMember(memberId);
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking member:", error);
      res.status(500).json({ error: "Failed to revoke member" });
    }
  });

  // Get user's salon info (for stylists to know their salon)
  app.get("/api/users/me/salon", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const profile = await storage.getUserProfile(userId);
      if (!profile?.salonId) {
        return res.status(404).json({ error: "Not a salon member" });
      }
      
      const salon = await storage.getSalon(profile.salonId);
      res.json(salon);
    } catch (error) {
      console.error("Error fetching user salon:", error);
      res.status(500).json({ error: "Failed to fetch salon" });
    }
  });

  return httpServer;
}
