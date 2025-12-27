import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedPosts } from "./seed";
import { insertPostSchema, categories, contentTypes, certifiedBrands, extensionMethods } from "@shared/schema";
import OpenAI from "openai";
import { z } from "zod";

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

  app.get("/api/options", (req, res) => {
    res.json({
      categories,
      contentTypes,
      certifiedBrands,
      extensionMethods,
    });
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
      const { city, certifiedBrands, extensionMethods } = req.body;
      
      const profile = await storage.upsertUserProfile({
        userId,
        city: city || null,
        certifiedBrands: certifiedBrands || [],
        extensionMethods: extensionMethods || [],
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
      
      if (profile.city) {
        const cityTag = profile.city.replace(/\s+/g, "");
        hashtags.push(`#${cityTag}Hair`, `#${cityTag}Extensions`, `#${cityTag}Stylist`);
      }
      
      if (profile.certifiedBrands && profile.certifiedBrands.length > 0) {
        profile.certifiedBrands.forEach((brand: string) => {
          const brandTag = brand.replace(/\s+/g, "");
          hashtags.push(`#${brandTag}Certified`, `#${brandTag}Extensions`);
        });
      }
      
      if (profile.extensionMethods && profile.extensionMethods.length > 0) {
        profile.extensionMethods.forEach((method: string) => {
          const methodTag = method.replace(/[^a-zA-Z]/g, "");
          hashtags.push(`#${methodTag}Extensions`, `#${methodTag}Specialist`);
        });
      }
      
      res.json({ hashtags: Array.from(new Set(hashtags)) });
    } catch (error) {
      console.error("Error generating hashtags:", error);
      res.status(500).json({ error: "Failed to generate hashtags" });
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

  return httpServer;
}
