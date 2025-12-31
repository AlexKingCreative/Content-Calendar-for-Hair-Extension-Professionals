import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedPosts, seedChallenges, seedBrandsAndMethods } from "./seed";
import { insertPostSchema, categories, contentTypes, certifiedBrands, extensionMethods, serviceCategories, leads, users, salonMembers } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";
import webpush from "web-push";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import mobileAuthRoutes from "./mobileAuth";
import magicLinkAuthRoutes from "./magicLinkAuth";
import { sendEmail } from "./emailService";
import { instagramService } from "./instagramService";

async function getUserEmail(userId: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user?.email || null;
}

async function getUserName(userId: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.firstName) {
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  }
  return user?.email || "A stylist";
}

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

// Helper to get userId from either Replit OAuth or session-based auth
function getUserId(req: any): string | null {
  if (req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  if (req.session?.userId) {
    return req.session.userId;
  }
  return null;
}

const requireAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = getUserId(req);
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
  
  app.use('/api/mobile', mobileAuthRoutes);
  app.use('/api/auth', magicLinkAuthRoutes);
  
  // Admin setup endpoint - sets specific emails as admin (protected by SESSION_SECRET)
  app.get("/api/setup-admin/:secretKey", async (req: any, res) => {
    const { secretKey } = req.params;
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || secretKey !== sessionSecret) {
      return res.status(403).json({ error: "Invalid key" });
    }
    
    try {
      const { db } = await import("./db");
      const { userProfiles } = await import("@shared/schema");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      
      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, 'alex@alexkingcreative.com'));
      if (!user) {
        return res.json({ error: "User not found" });
      }
      
      // Update profile to admin
      await db.update(userProfiles)
        .set({ isAdmin: true })
        .where(eq(userProfiles.userId, String(user.id)));
      
      res.json({ success: true, message: "Admin access granted to alex@alexkingcreative.com" });
    } catch (error: any) {
      console.error("Setup admin error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Test email endpoint (admin only in production)
  app.post("/api/test-email", async (req: any, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      const success = await sendEmail(
        email,
        "Test Email - Content Calendar for Hair Pros",
        `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #D4A574;">Email Test Successful!</h1>
          <p>This confirms your Resend email integration is working correctly.</p>
          <p style="color: #8B7355; font-size: 14px;">Sent at: ${new Date().toISOString()}</p>
        </div>
        `
      );
      if (success) {
        res.json({ success: true, message: "Test email sent" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ error: error.message || "Failed to send test email" });
    }
  });
  
  // Web email/password authentication routes
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      const bcrypt = await import("bcryptjs");
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const passwordHash = await bcrypt.default.hash(password, 10);
      const nameParts = name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || null;
      
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        firstName,
        lastName,
      }).returning();
      
      await storage.upsertUserProfile({
        userId: newUser.id,
        onboardingComplete: false,
      });
      
      req.session.userId = newUser.id;
      req.session.userEmail = newUser.email;
      req.session.userName = `${firstName}${lastName ? " " + lastName : ""}`;
      
      res.json({ 
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: req.session.userName,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const bcrypt = await import("bcryptjs");
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.default.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const userName = `${user.firstName}${user.lastName ? " " + user.lastName : ""}`;
      
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = userName;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Onboarding endpoint - creates account with auto-generated password and logs in
  app.post("/api/auth/onboard", async (req: any, res) => {
    try {
      const { email, city, instagram, experience, contentGoals, offeredServices, postingServices, certifiedBrands: userBrands, extensionMethods: userMethods } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const bcrypt = await import("bcryptjs");
      const crypto = await import("crypto");
      const { sendWelcomeEmail } = await import("./emailService");
      const { users } = await import("@shared/models/auth");

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      
      let user;
      let generatedPassword: string | null = null;
      
      if (existingUser) {
        // User already exists - don't auto-login for security, they need to use login page
        return res.status(409).json({ 
          message: "An account with this email already exists. Please sign in using the login page.",
          existingUser: true
        });
      } else {
        // Generate a random 12-character password
        generatedPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, 'x').slice(0, 12);
        const passwordHash = await bcrypt.default.hash(generatedPassword, 10);
        
        // Create new user
        const [newUser] = await db.insert(users).values({
          email,
          passwordHash,
          firstName: null,
          lastName: null,
        }).returning();
        
        user = newUser;
        
        // Send welcome email with credentials
        console.log("Sending welcome email to:", email);
        sendWelcomeEmail(email, generatedPassword)
          .then(success => {
            if (success) {
              console.log("Welcome email sent successfully to:", email);
            } else {
              console.error("Welcome email failed to send to:", email);
            }
          })
          .catch(err => {
            console.error("Failed to send welcome email:", err);
          });
      }

      // Create or update user profile with onboarding data
      await storage.upsertUserProfile({
        userId: user.id,
        city: city || null,
        instagram: instagram || null,
        experience: experience || null,
        contentGoals: contentGoals || [],
        offeredServices: offeredServices || [],
        postingServices: postingServices || [],
        certifiedBrands: userBrands || [],
        extensionMethods: userMethods || [],
        onboardingComplete: true,
      });

      // Also update the leads table if the lead exists
      const existingLead = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
      if (existingLead.length > 0) {
        await db.update(leads)
          .set({
            city: city || null,
            instagram: instagram || null,
            experience: experience || null,
            contentGoals: contentGoals || [],
            offeredServices: offeredServices || [],
            postingServices: postingServices || [],
            certifiedBrands: userBrands || [],
            extensionMethods: userMethods || [],
            onboardingComplete: true,
            convertedToUser: true,
            updatedAt: new Date(),
          })
          .where(eq(leads.email, email));
      } else {
        // Create a lead entry for tracking
        await db.insert(leads).values({
          email,
          city: city || null,
          instagram: instagram || null,
          experience: experience || null,
          contentGoals: contentGoals || [],
          offeredServices: offeredServices || [],
          postingServices: postingServices || [],
          certifiedBrands: userBrands || [],
          extensionMethods: userMethods || [],
          onboardingComplete: true,
          convertedToUser: true,
        });
      }

      // Create session (auto-login)
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : email.split("@")[0];

      res.json({
        success: true,
        isNewUser: !existingUser,
        user: {
          id: user.id,
          email: user.email,
          name: req.session.userName,
        }
      });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
  
  await seedPosts();
  await seedChallenges();
  await seedBrandsAndMethods();

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

  app.get("/api/posts/today", async (req, res) => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const posts = await storage.getPostsByMonth(month);
      const todayPost = posts.find((p: any) => p.day === day);
      res.json(todayPost ? [todayPost] : []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's post" });
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
      
      res.json({
        categories,
        contentTypes,
        certifiedBrands: dbBrands.map(b => b.name),
        extensionMethods: dbMethods.map(m => m.name),
        serviceCategories: [...serviceCategories],
      });
    } catch (error) {
      console.error("Error fetching options:", error);
      res.json({
        categories,
        contentTypes,
        certifiedBrands: [],
        extensionMethods: [],
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
      const { name, isActive = true, displayOrder = 0 } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Brand name is required" });
      }
      const brand = await storage.createBrand({ name: name.trim(), isActive, displayOrder });
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
      const { name, isActive, displayOrder } = req.body;
      const brand = await storage.updateBrand(id, { 
        ...(name && { name: name.trim() }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(typeof displayOrder === "number" && { displayOrder }),
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
      const { name, isActive = true, displayOrder = 0 } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Method name is required" });
      }
      const method = await storage.createMethod({ name: name.trim(), isActive, displayOrder });
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
      const { name, isActive, displayOrder } = req.body;
      const method = await storage.updateMethod(id, { 
        ...(name && { name: name.trim() }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(typeof displayOrder === "number" && { displayOrder }),
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

  // Lead capture for onboarding (unauthenticated users)
  app.post("/api/leads", async (req, res) => {
    try {
      const { email, city, instagram, experience, contentGoals, offeredServices, postingServices, certifiedBrands, extensionMethods } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if lead already exists
      const existingLead = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
      
      if (existingLead.length > 0) {
        // Update existing lead
        const [updatedLead] = await db.update(leads)
          .set({
            city: city || null,
            instagram: instagram || null,
            experience: experience || null,
            contentGoals: contentGoals || [],
            offeredServices: offeredServices || [],
            postingServices: postingServices || [],
            certifiedBrands: certifiedBrands || [],
            extensionMethods: extensionMethods || [],
            onboardingComplete: true,
            updatedAt: new Date(),
          })
          .where(eq(leads.email, email))
          .returning();
        return res.json({ success: true, lead: updatedLead });
      }

      // Create new lead
      const [newLead] = await db.insert(leads)
        .values({
          email,
          city: city || null,
          instagram: instagram || null,
          experience: experience || null,
          contentGoals: contentGoals || [],
          offeredServices: offeredServices || [],
          postingServices: postingServices || [],
          certifiedBrands: certifiedBrands || [],
          extensionMethods: extensionMethods || [],
          onboardingComplete: true,
        })
        .returning();

      res.json({ success: true, lead: newLead });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
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
      
      console.log('[Profile API] Returning profile for user', userId, '- isAdmin:', profile.isAdmin);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { 
        city, 
        instagram,
        experience,
        contentGoals,
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
      if (instagram !== undefined) updateData.instagram = instagram || null;
      if (experience !== undefined) updateData.experience = experience || null;
      if (contentGoals !== undefined) updateData.contentGoals = contentGoals || [];
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
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
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
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
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
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const profile = await storage.getUserProfile(userId);
      const today = new Date().toISOString().split('T')[0];
      const hasPostedToday = await storage.hasPostedToday(userId, today);
      const logs = await storage.getPostingLogs(userId, 30);
      
      // Check for Instagram post today
      let hasInstagramPostToday = false;
      let instagramConnected = false;
      try {
        const igAccount = await storage.getInstagramAccount(userId);
        if (igAccount && igAccount.isActive) {
          instagramConnected = true;
          hasInstagramPostToday = await storage.hasInstagramPostOnDate(userId, today);
        }
      } catch (e) {
        // Instagram not connected or error
      }
      
      res.json({
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
        totalPosts: profile?.totalPosts || 0,
        postingGoal: profile?.postingGoal || "casual",
        hasPostedToday: hasPostedToday || hasInstagramPostToday,
        hasManualPostToday: hasPostedToday,
        hasInstagramPostToday,
        instagramConnected,
        recentLogs: logs.map(l => l.date),
      });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ error: "Failed to fetch streak data" });
    }
  });

  app.post("/api/streak/log", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const today = new Date().toISOString().split('T')[0];
      const { postId } = req.body;
      
      const hasPosted = await storage.hasPostedToday(userId, today);
      if (hasPosted) {
        return res.status(400).json({ error: "Already logged a post today" });
      }
      
      await storage.logPost(userId, today, postId);
      const profile = await storage.updateStreak(userId);

      const activeChallenges = await storage.getStylistChallenges(userId);
      for (const challenge of activeChallenges) {
        if (challenge.status === "active") {
          const updatedChallenge = await storage.incrementStylistChallengeProgress(challenge.id);
          if (updatedChallenge && updatedChallenge.status === "completed" && !updatedChallenge.ownerNotifiedAt) {
            const salonChallenge = await storage.getSalonChallengeById(challenge.salonChallengeId);
            if (salonChallenge) {
              const salon = await storage.getSalon(salonChallenge.salonId);
              if (salon) {
                const ownerEmail = await getUserEmail(salon.ownerUserId);
                if (ownerEmail) {
                  const stylistName = await getUserName(userId);
                  try {
                    await sendEmail(
                      ownerEmail,
                      `Challenge Completed: ${salonChallenge.title}`,
                      `
                        <h2>Congratulations!</h2>
                        <p><strong>${stylistName}</strong> has completed the challenge: <strong>${salonChallenge.title}</strong></p>
                        <p>They've earned the reward: <strong>${salonChallenge.rewardText}</strong></p>
                        <p>Check your salon dashboard to see all progress.</p>
                      `
                    );
                    await storage.markOwnerNotified(challenge.id);
                  } catch (emailErr) {
                    console.error("Failed to send challenge completion email:", emailErr);
                  }
                }
              }
            }
          }
        }
      }
      
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
  app.post("/api/posts/:id/generate-caption", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Get user's account type for personalized voice
      // Support both session-based auth (web) and JWT auth (mobile)
      let accountType = "solo";
      let userId = req.session?.userId;
      
      // Check for mobile JWT auth if no session
      if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const { verifyToken } = await import('./mobileAuth');
          const payload = verifyToken(token);
          if (payload?.userId) {
            userId = payload.userId;
          }
        }
      }
      
      let salonInstagramHandle = "";
      if (userId) {
        const profile = await storage.getUserProfile(userId);
        if (profile?.accountType) {
          accountType = profile.accountType;
        }
        // If user is a salon member (stylist), get their salon's Instagram handle
        if (profile?.salonId) {
          const salon = await storage.getSalon(profile.salonId);
          if (salon?.instagramHandle) {
            salonInstagramHandle = salon.instagramHandle.replace(/^@/, ""); // Remove @ if present
          }
        }
      }

      const voiceGuideline = accountType === "salon" 
        ? `- Write in first person PLURAL ("we", "us", "our team") since this is a salon/team account
- Example: "We specialize in..." "Our team loves..." "Book with us..."`
        : `- Write in first person SINGULAR ("I", "me", "my") since this is a solo stylist account
- Example: "I specialize in..." "I love creating..." "Book with me..."`;

      // Add salon mention instruction for stylists under a salon
      const salonMentionGuideline = salonInstagramHandle 
        ? `- IMPORTANT: Organically include a mention of the salon "@${salonInstagramHandle}" in the caption
- Example phrases: "stop in and see me at @${salonInstagramHandle}", "book with me at @${salonInstagramHandle}", "find me at @${salonInstagramHandle}"
- Make the mention feel natural, not forced`
        : "";

      const prompt = `You are an expert social media copywriter for hair professionals. Generate an engaging Instagram caption for the following post idea.

Post Title: ${post.title}
Category: ${post.category}
Content Type: ${post.contentType}
Description: ${post.description}

Guidelines:
${voiceGuideline}
${salonMentionGuideline}
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

      const userId = getUserId(req);
      
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

  app.get("/api/billing/subscription-prices", async (req, res) => {
    try {
      const prices = await stripeService.getAllSubscriptionPrices();
      const formattedPrices = prices.map((p: any) => ({
        price_id: p.price_id,
        unit_amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval || 'month',
      }));
      res.json(formattedPrices);
    } catch (error) {
      console.error("Error getting subscription prices:", error);
      res.status(500).json({ error: "Failed to get subscription prices" });
    }
  });

  app.get("/api/billing/access-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
      const { withTrial, interval = 'month' } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Get user email from database
      const userEmail = await getUserEmail(userId) || `${userId}@user.app`;

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

      // Get price based on interval (month, quarter, or year)
      const validInterval = interval === 'year' ? 'year' : interval === 'quarter' ? 'quarter' : 'month';
      const priceInfo = stripeService.getSubscriptionPriceByInterval(validInterval);
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
      const userId = getUserId(req);
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

  // Claim streak reward - unlocks 50% off coupon for completing first 7-day streak
  app.post("/api/billing/claim-streak-reward", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(400).json({ error: "Profile not found" });
      }

      // Check if already claimed
      if (profile.firstStreakRewardClaimed) {
        return res.status(400).json({ 
          error: "Reward already claimed", 
          couponId: profile.firstStreakRewardCoupon 
        });
      }

      // Verify user has achieved 7+ day streak (current or longest)
      const hasEligibleStreak = (profile.currentStreak ?? 0) >= 7 || (profile.longestStreak ?? 0) >= 7;
      if (!hasEligibleStreak) {
        return res.status(400).json({ 
          error: "Complete a 7-day posting streak to unlock this reward",
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak
        });
      }

      // Create the coupon in Stripe
      const coupon = await stripeService.createStreakRewardCoupon(userId);
      
      // Save to user profile
      await storage.claimStreakReward(userId, coupon.id);

      res.json({ 
        success: true, 
        couponId: coupon.id,
        discount: "50% off your first month"
      });
    } catch (error) {
      console.error("Error claiming streak reward:", error);
      res.status(500).json({ error: "Failed to claim streak reward" });
    }
  });

  // Checkout with streak reward coupon
  app.post("/api/billing/checkout-with-reward", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(400).json({ error: "Profile not found" });
      }

      // Check if user has a streak reward coupon
      if (!profile.firstStreakRewardCoupon) {
        return res.status(400).json({ error: "No streak reward coupon available" });
      }

      const userEmail = await getUserEmail(userId) || `${userId}@user.app`;

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
      
      const session = await stripeService.createCheckoutSessionWithCoupon(
        customerId,
        priceId,
        profile.firstStreakRewardCoupon,
        `${baseUrl}/account?success=true`,
        `${baseUrl}/subscribe?canceled=true`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout with reward:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // ==================== POST SUBMISSIONS ====================
  
  // Submit an Instagram post to be featured
  app.post("/api/posts/:id/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
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

  // Get user's own profile (for streak data, etc.)
  app.get("/api/users/me/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json({
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        totalPosts: profile.totalPosts,
        firstStreakRewardClaimed: profile.firstStreakRewardClaimed,
        firstStreakRewardCoupon: profile.firstStreakRewardCoupon,
        subscriptionStatus: profile.subscriptionStatus,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get user's own submissions
  app.get("/api/users/me/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
      
      // Calculate seat usage for billing display
      // Only count ACCEPTED members for billing (pending invites don't consume seats until accepted)
      const pendingMembersList = members.filter(m => m.invitationStatus === "pending");
      const includedSeats = salon.seatLimit || 5;
      const acceptedCount = acceptedMembers.length;
      const additionalSeatsUsed = Math.max(0, acceptedCount - includedSeats);
      // How many pending invites will become additional (billable) seats when accepted?
      // Billable if their slot number exceeds included seats
      const remainingFreeSlots = Math.max(0, includedSeats - acceptedCount);
      const pendingWillBeAdditional = Math.max(0, pendingMembersList.length - remainingFreeSlots);
      
      // Annotate each pending member with whether they will be billed when accepted
      const membersWithBillingInfo = members.map((m, _idx) => {
        if (m.invitationStatus !== "pending") {
          return m;
        }
        // Find this member's position in pending list to calculate if they'll be billed
        // Slot = acceptedCount + pendingIndex + 1 (for 0-indexed pending list)
        // Billable if slot exceeds included seats
        const pendingIndex = pendingMembersList.findIndex(p => p.id === m.id);
        const slotNumber = acceptedCount + pendingIndex + 1;
        const willBeBilledWhenAccepted = slotNumber > includedSeats;
        return { ...m, willBeBilledWhenAccepted };
      });
      
      res.json({
        ...salon,
        members: membersWithBillingInfo,
        membersWithStreaks,
        seatUsage: {
          included: includedSeats,
          acceptedCount,
          pendingCount: pendingMembersList.length,
          additionalUsed: additionalSeatsUsed,
          pendingWillBecomeAdditional: pendingWillBeAdditional,
          isOverLimit: acceptedCount > includedSeats,
        },
      });
    } catch (error) {
      console.error("Error fetching salon:", error);
      res.status(500).json({ error: "Failed to fetch salon" });
    }
  });

  // Update salon
  app.put("/api/salons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
      
      // Check seat count - always allow invites, but track additional seat usage for billing
      // Only count ACCEPTED members for billing (pending invites don't consume seats until accepted)
      const members = await storage.getSalonMembers(salonId);
      const acceptedMembers = members.filter(m => m.invitationStatus === "accepted");
      const includedSeats = salon.seatLimit || 5;
      // When this new invite is accepted, will it be an additional seat?
      const willBeAdditionalSeat = acceptedMembers.length >= includedSeats;
      
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
      
      // Return member with additional seat billing info
      // Note: billing only applies when invite is accepted
      res.json({
        ...member,
        willBeAdditionalSeat,
        currentAcceptedMembers: acceptedMembers.length,
        includedSeats,
        additionalSeatsUsed: Math.max(0, acceptedMembers.length - includedSeats),
      });
    } catch (error) {
      console.error("Error inviting stylist:", error);
      res.status(500).json({ error: "Failed to invite stylist" });
    }
  });

  // Accept a salon invitation
  app.patch("/api/salon-invitations/:token", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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

  // ============ CHALLENGES ============

  // Get all active challenges
  app.get("/api/challenges", async (req, res) => {
    try {
      const allChallenges = await storage.getActiveChallenges();
      res.json(allChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  // Get challenge by slug
  app.get("/api/challenges/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const challenge = await storage.getChallengeBySlug(slug);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  // Get user's challenges (active and completed)
  app.get("/api/user/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userChallenges = await storage.getUserChallenges(userId);
      
      // Fetch challenge details for each user challenge
      const challengesWithDetails = await Promise.all(
        userChallenges.map(async (uc) => {
          const challenge = await storage.getChallengeById(uc.challengeId);
          return {
            ...uc,
            challenge,
          };
        })
      );
      
      res.json(challengesWithDetails);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ error: "Failed to fetch user challenges" });
    }
  });

  // Get user's active challenges
  app.get("/api/user/challenges/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const activeChallenges = await storage.getActiveUserChallenges(userId);
      
      const challengesWithDetails = await Promise.all(
        activeChallenges.map(async (uc) => {
          const challenge = await storage.getChallengeById(uc.challengeId);
          return {
            ...uc,
            challenge,
          };
        })
      );
      
      res.json(challengesWithDetails);
    } catch (error) {
      console.error("Error fetching active challenges:", error);
      res.status(500).json({ error: "Failed to fetch active challenges" });
    }
  });

  // Start a challenge
  app.post("/api/challenges/:challengeId/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const challengeId = parseInt(req.params.challengeId);
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      // Check if challenge exists
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      // Check if user already has this challenge active
      const existing = await storage.getActiveUserChallengeForChallenge(userId, challengeId);
      if (existing) {
        return res.status(400).json({ error: "You already have this challenge active" });
      }
      
      const userChallenge = await storage.startChallenge(userId, challengeId);
      res.json({ ...userChallenge, challenge });
    } catch (error) {
      console.error("Error starting challenge:", error);
      res.status(500).json({ error: "Failed to start challenge" });
    }
  });

  // Log progress on a challenge
  app.post("/api/user/challenges/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user challenge ID" });
      }
      
      const userChallenge = await storage.getUserChallengeById(id);
      if (!userChallenge || userChallenge.userId !== userId) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      if (userChallenge.status !== "active") {
        return res.status(400).json({ error: "Challenge is not active" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      // Don't allow logging twice on same day
      if (userChallenge.lastPostDate === today) {
        return res.status(400).json({ error: "Already logged progress today" });
      }
      
      // Calculate new streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      if (userChallenge.lastPostDate === yesterdayStr) {
        newStreak = (userChallenge.currentStreak || 0) + 1;
      }
      
      const updatedChallenge = await storage.updateUserChallengeProgress(id, {
        postsCompleted: (userChallenge.postsCompleted || 0) + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userChallenge.longestStreak || 0),
        lastPostDate: today,
      });
      
      // Check if challenge is complete
      const challenge = await storage.getChallengeById(userChallenge.challengeId);
      if (challenge) {
        const startDate = new Date(userChallenge.startedAt);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const postsNeeded = challenge.postsRequired || challenge.durationDays;
        if ((updatedChallenge?.postsCompleted || 0) >= postsNeeded || daysPassed >= challenge.durationDays) {
          await storage.completeChallenge(id);
        }
      }
      
      res.json(updatedChallenge);
    } catch (error) {
      console.error("Error logging challenge progress:", error);
      res.status(500).json({ error: "Failed to log progress" });
    }
  });

  // Abandon a challenge
  app.post("/api/user/challenges/:id/abandon", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user challenge ID" });
      }
      
      const userChallenge = await storage.getUserChallengeById(id);
      if (!userChallenge || userChallenge.userId !== userId) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const abandoned = await storage.abandonChallenge(id);
      res.json(abandoned);
    } catch (error) {
      console.error("Error abandoning challenge:", error);
      res.status(500).json({ error: "Failed to abandon challenge" });
    }
  });

  // Admin: Get all challenges (including inactive)
  app.get("/api/admin/challenges", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const allChallenges = await storage.getAllChallenges();
      res.json(allChallenges);
    } catch (error) {
      console.error("Error fetching all challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  // Admin: Create challenge
  app.post("/api/admin/challenges", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const challenge = await storage.createChallenge(req.body);
      res.json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });

  // Admin: Update challenge
  app.patch("/api/admin/challenges/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const updated = await storage.updateChallenge(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating challenge:", error);
      res.status(500).json({ error: "Failed to update challenge" });
    }
  });

  // Admin: Delete challenge
  app.delete("/api/admin/challenges/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const success = await storage.deleteChallenge(id);
      if (!success) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting challenge:", error);
      res.status(500).json({ error: "Failed to delete challenge" });
    }
  });

  // ============ TREND ALERTS ============
  
  // Public: Get active trend alerts for users
  app.get("/api/trends", async (req, res) => {
    try {
      const includeExpired = req.query.includeExpired === "true";
      const allTrends = await storage.getAllTrendAlerts();
      const now = new Date();
      
      const trendsWithStatus = allTrends
        .filter(t => t.isActive === true)
        .map(trend => {
          const publishedAt = new Date(trend.publishedAt);
          const expiresAt = new Date(publishedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          const isExpired = now > expiresAt;
          const daysRemaining = isExpired ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          const daysSinceExpired = isExpired ? Math.floor((now.getTime() - expiresAt.getTime()) / (24 * 60 * 60 * 1000)) : 0;
          
          return {
            ...trend,
            expiresAt: expiresAt.toISOString(),
            isExpired,
            daysRemaining,
            daysSinceExpired,
          };
        });
      
      if (includeExpired) {
        res.json(trendsWithStatus);
      } else {
        res.json(trendsWithStatus.filter(t => !t.isExpired));
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // Admin: Get all trend alerts
  app.get("/api/admin/trends", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const trends = await storage.getAllTrendAlerts();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // Admin: Create trend alert
  app.post("/api/admin/trends", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { title, description, videoUrl, instagramUrl, isActive } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }
      
      const trend = await storage.createTrendAlert({
        title,
        description,
        videoUrl: videoUrl || null,
        instagramUrl: instagramUrl || null,
        isActive: isActive !== false,
        createdById: req.user?.id || null,
        publishedAt: new Date(),
      });
      res.status(201).json(trend);
    } catch (error) {
      console.error("Error creating trend:", error);
      res.status(500).json({ error: "Failed to create trend" });
    }
  });

  // Admin: Update trend alert
  app.patch("/api/admin/trends/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trend ID" });
      }
      
      const updated = await storage.updateTrendAlert(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Trend not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating trend:", error);
      res.status(500).json({ error: "Failed to update trend" });
    }
  });

  // Admin: Delete trend alert
  app.delete("/api/admin/trends/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trend ID" });
      }
      
      const success = await storage.deleteTrendAlert(id);
      if (!success) {
        return res.status(404).json({ error: "Trend not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting trend:", error);
      res.status(500).json({ error: "Failed to delete trend" });
    }
  });

  // ============ SALON CHALLENGES ============

  // Get salon challenges for owner's salon
  app.get("/api/salon/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const salon = await storage.getSalonByOwner(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: "Salon not found" });
      }
      
      const challenges = await storage.getSalonChallenges(salon.id);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching salon challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  // Create salon challenge
  app.post("/api/salon/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const salon = await storage.getSalonByOwner(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: "Salon not found" });
      }
      
      const { title, description, durationDays, rewardText } = req.body;
      
      if (!title || !durationDays || !rewardText) {
        return res.status(400).json({ error: "Title, duration, and reward are required" });
      }
      
      const challenge = await storage.createSalonChallenge({
        salonId: salon.id,
        title,
        description: description || null,
        durationDays,
        rewardText,
        status: "active"
      });
      
      // Auto-assign to all accepted salon members
      const members = await storage.getSalonMembers(salon.id);
      const acceptedMembers = members.filter(m => m.invitationStatus === "accepted" && m.stylistUserId);
      
      for (const member of acceptedMembers) {
        await storage.createStylistChallenge({
          salonChallengeId: challenge.id,
          stylistUserId: member.stylistUserId!,
          salonId: salon.id,
          targetDays: durationDays,
          status: "active"
        });
      }
      
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating salon challenge:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });

  // Update salon challenge
  app.patch("/api/salon/challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const salon = await storage.getSalonByOwner(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: "Salon not found" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getSalonChallengeById(id);
      if (!challenge || challenge.salonId !== salon.id) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const updated = await storage.updateSalonChallenge(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating salon challenge:", error);
      res.status(500).json({ error: "Failed to update challenge" });
    }
  });

  // Delete salon challenge
  app.delete("/api/salon/challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const salon = await storage.getSalonByOwner(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: "Salon not found" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getSalonChallengeById(id);
      if (!challenge || challenge.salonId !== salon.id) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      await storage.deleteSalonChallenge(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting salon challenge:", error);
      res.status(500).json({ error: "Failed to delete challenge" });
    }
  });

  // Get stylist challenge progress for salon owner view
  app.get("/api/salon/challenges/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const salon = await storage.getSalonByOwner(req.user.id);
      if (!salon) {
        return res.status(404).json({ error: "Salon not found" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getSalonChallengeById(id);
      if (!challenge || challenge.salonId !== salon.id) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const stylistChallenges = await storage.getStylistChallengesBySalon(salon.id);
      const progressData = stylistChallenges.filter(sc => sc.salonChallengeId === id);
      
      // Get member details for each progress entry
      const members = await storage.getSalonMembers(salon.id);
      const profiles = await storage.getAllUserProfiles();
      
      const progressWithDetails = await Promise.all(progressData.map(async (p) => {
        const member = members.find(m => m.stylistUserId === p.stylistUserId);
        const stylistName = p.stylistUserId ? await getUserName(p.stylistUserId) : "Unknown";
        return {
          ...p,
          stylistName,
          email: member?.email || ""
        };
      }));
      
      res.json(progressWithDetails);
    } catch (error) {
      console.error("Error fetching challenge progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // ============ STYLIST CHALLENGES (for stylists to see their challenges) ============

  // Get challenges assigned to current user as a stylist
  app.get("/api/stylist/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const challenges = await storage.getStylistChallenges(req.user.id);
      
      // Get salon challenge details for each
      const challengesWithDetails = await Promise.all(challenges.map(async (sc) => {
        const salonChallenge = await storage.getSalonChallengeById(sc.salonChallengeId);
        const salon = await storage.getSalon(sc.salonId);
        return {
          ...sc,
          challenge: salonChallenge,
          salonName: salon?.name || "Unknown Salon"
        };
      }));
      
      res.json(challengesWithDetails);
    } catch (error) {
      console.error("Error fetching stylist challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  // Log progress for a stylist challenge (called when posting)
  app.post("/api/stylist/challenges/:id/log", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getStylistChallengeById(id);
      if (!challenge || challenge.stylistUserId !== req.user.id) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      if (challenge.status !== "active") {
        return res.status(400).json({ error: "Challenge is not active" });
      }
      
      // Check if already posted today
      const today = new Date().toISOString().split('T')[0];
      if (challenge.lastPostDate === today) {
        return res.status(400).json({ error: "Already logged today" });
      }
      
      const updated = await storage.incrementStylistChallengeProgress(id);
      
      // Check if completed and notify owner
      if (updated && updated.status === "completed" && !updated.ownerNotifiedAt) {
        await storage.markOwnerNotified(id);
        
        const salonChallenge = await storage.getSalonChallengeById(updated.salonChallengeId);
        const salon = await storage.getSalon(updated.salonId);
        const stylistName = await getUserName(req.user.id);
        
        if (salon && salonChallenge) {
          const ownerEmail = await getUserEmail(salon.ownerUserId);
          if (ownerEmail) {
            try {
              await sendEmail(
                ownerEmail,
                `Challenge Completed: ${stylistName} finished "${salonChallenge.title}"`,
                `
                  <h2>Challenge Completed!</h2>
                  <p><strong>${stylistName}</strong> has completed the "${salonChallenge.title}" challenge!</p>
                  <p><strong>Reward earned:</strong> ${salonChallenge.rewardText}</p>
                  <p>Log in to your salon dashboard to see full details.</p>
                `
              );
            } catch (emailError) {
              console.error("Failed to send completion notification:", emailError);
            }
          }
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error logging challenge progress:", error);
      res.status(500).json({ error: "Failed to log progress" });
    }
  });

  // ============ INSTAGRAM INTEGRATION ============

  // Get Instagram connection status
  app.get("/api/instagram/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const account = await storage.getInstagramAccount(userId);
      if (!account) {
        return res.json({ connected: false });
      }
      
      res.json({
        connected: true,
        username: account.instagramUsername,
        profilePictureUrl: account.profilePictureUrl,
        followersCount: account.followersCount,
        mediaCount: account.mediaCount,
        lastSyncAt: account.lastSyncAt,
        isActive: account.isActive
      });
    } catch (error) {
      console.error("Error checking Instagram status:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  // Get Instagram OAuth URL
  app.get("/api/instagram/auth-url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Generate a random state token for CSRF protection
      const crypto = await import('crypto');
      const stateToken = crypto.randomBytes(32).toString('hex');
      const stateData = Buffer.from(JSON.stringify({ userId, token: stateToken, timestamp: Date.now() })).toString('base64');
      
      // Store state token in session for validation on callback
      req.session.instagramOAuthState = stateToken;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const authUrl = instagramService.getAuthUrl(stateData);
      
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  // Instagram OAuth callback
  app.get("/api/instagram/callback", async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.redirect("/?instagram_error=missing_params");
      }
      
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      } catch {
        return res.redirect("/?instagram_error=invalid_state");
      }
      
      const userId = stateData.userId;
      const stateToken = stateData.token;
      
      if (!userId || !stateToken) {
        return res.redirect("/?instagram_error=invalid_user");
      }
      
      // Validate state token against session (CSRF protection)
      const sessionState = req.session?.instagramOAuthState;
      if (!sessionState || sessionState !== stateToken) {
        console.error("Instagram OAuth state mismatch - possible CSRF attempt");
        return res.redirect("/?instagram_error=state_mismatch");
      }
      
      // Clear the state token from session
      delete req.session.instagramOAuthState;
      
      // Exchange code for token
      const tokenData = await instagramService.exchangeCodeForToken(code as string);
      
      // Get long-lived token
      const longLivedToken = await instagramService.getLongLivedToken(tokenData.access_token);
      
      // Get Instagram Business Account from Pages
      const businessAccount = await instagramService.getInstagramBusinessAccountFromPages(longLivedToken.access_token);
      
      if (!businessAccount) {
        return res.redirect("/?instagram_error=no_business_account");
      }
      
      // Get user data
      const userData = await instagramService.getInstagramUserData(businessAccount.instagramAccountId, longLivedToken.access_token);
      
      const tokenExpiresAt = new Date(Date.now() + longLivedToken.expires_in * 1000);
      
      // Check if account already exists
      const existing = await storage.getInstagramAccount(userId);
      
      if (existing) {
        await storage.updateInstagramAccount(userId, {
          instagramUserId: businessAccount.instagramAccountId,
          instagramUsername: userData.username,
          accessToken: longLivedToken.access_token,
          tokenExpiresAt,
          pageId: businessAccount.pageId,
          pageName: businessAccount.pageName,
          profilePictureUrl: userData.profile_picture_url,
          followersCount: userData.followers_count || 0,
          followingCount: userData.follows_count || 0,
          mediaCount: userData.media_count || 0,
          isActive: true,
        });
      } else {
        await storage.createInstagramAccount({
          userId,
          instagramUserId: businessAccount.instagramAccountId,
          instagramUsername: userData.username,
          accessToken: longLivedToken.access_token,
          tokenExpiresAt,
          pageId: businessAccount.pageId,
          pageName: businessAccount.pageName,
          profilePictureUrl: userData.profile_picture_url,
          followersCount: userData.followers_count || 0,
          followingCount: userData.follows_count || 0,
          mediaCount: userData.media_count || 0,
          isActive: true,
        });
      }
      
      // Initial sync
      try {
        await instagramService.syncUserMedia(userId);
      } catch (syncError) {
        console.error("Initial sync failed:", syncError);
      }
      
      res.redirect("/account?instagram_connected=true");
    } catch (error) {
      console.error("Instagram callback error:", error);
      res.redirect("/?instagram_error=connection_failed");
    }
  });

  // Disconnect Instagram
  app.post("/api/instagram/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      await storage.deleteInstagramAccount(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      res.status(500).json({ error: "Failed to disconnect" });
    }
  });

  // Sync Instagram media
  app.post("/api/instagram/sync", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check and refresh token if needed
      const tokenValid = await instagramService.checkAndRefreshToken(userId);
      if (!tokenValid) {
        return res.status(400).json({ error: "Instagram token expired, please reconnect" });
      }
      
      const result = await instagramService.syncUserMedia(userId);
      await instagramService.syncAccountStats(userId);
      
      res.json(result);
    } catch (error) {
      console.error("Error syncing Instagram:", error);
      res.status(500).json({ error: "Failed to sync" });
    }
  });

  // Get Instagram media
  app.get("/api/instagram/media", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const media = await storage.getInstagramMedia(userId, limit);
      
      res.json(media);
    } catch (error) {
      console.error("Error fetching Instagram media:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Get Instagram analytics
  app.get("/api/instagram/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const account = await storage.getInstagramAccount(userId);
      if (!account) {
        return res.status(404).json({ error: "Instagram not connected" });
      }
      
      // Get recent media for analytics
      const media = await storage.getInstagramMedia(userId, 30);
      
      // Calculate aggregate stats
      const totalLikes = media.reduce((sum, m) => sum + (m.likeCount || 0), 0);
      const totalComments = media.reduce((sum, m) => sum + (m.commentsCount || 0), 0);
      const totalReach = media.reduce((sum, m) => sum + (m.reach || 0), 0);
      const totalImpressions = media.reduce((sum, m) => sum + (m.impressions || 0), 0);
      const avgEngagement = media.length > 0 ? (totalLikes + totalComments) / media.length : 0;
      
      // Group by date for daily stats
      const dailyStats: Record<string, { posts: number; likes: number; comments: number }> = {};
      for (const m of media) {
        if (!dailyStats[m.postDate]) {
          dailyStats[m.postDate] = { posts: 0, likes: 0, comments: 0 };
        }
        dailyStats[m.postDate].posts++;
        dailyStats[m.postDate].likes += m.likeCount || 0;
        dailyStats[m.postDate].comments += m.commentsCount || 0;
      }
      
      res.json({
        account: {
          username: account.instagramUsername,
          followersCount: account.followersCount,
          followingCount: account.followingCount,
          mediaCount: account.mediaCount,
          profilePictureUrl: account.profilePictureUrl,
          lastSyncAt: account.lastSyncAt
        },
        stats: {
          totalPosts: media.length,
          totalLikes,
          totalComments,
          totalReach,
          totalImpressions,
          avgEngagement: Math.round(avgEngagement * 10) / 10
        },
        dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => b.date.localeCompare(a.date)),
        recentMedia: media.slice(0, 12)
      });
    } catch (error) {
      console.error("Error fetching Instagram analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Check if user posted on Instagram today (for streak integration)
  app.get("/api/instagram/posted-today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const account = await storage.getInstagramAccount(userId);
      if (!account || !account.isActive) {
        return res.json({ hasPosted: false, connected: false });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const hasPosted = await storage.hasInstagramPostOnDate(userId, today);
      
      res.json({ hasPosted, connected: true });
    } catch (error) {
      console.error("Error checking Instagram post:", error);
      res.status(500).json({ error: "Failed to check" });
    }
  });

  // Ashley's Advice - Public endpoint for random advice
  app.get("/api/ashleys-advice/random", async (req, res) => {
    try {
      const advice = await storage.getRandomAshleysAdvice();
      res.json(advice || null);
    } catch (error) {
      console.error("Error fetching random advice:", error);
      res.status(500).json({ error: "Failed to fetch advice" });
    }
  });

  // Ashley's Advice - Admin endpoints
  app.get("/api/admin/ashleys-advice", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const advice = await storage.getAllAshleysAdvice();
      res.json(advice);
    } catch (error) {
      console.error("Error fetching advice:", error);
      res.status(500).json({ error: "Failed to fetch advice" });
    }
  });

  app.post("/api/admin/ashleys-advice", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { advice, isActive = true } = req.body;
      if (!advice) {
        return res.status(400).json({ error: "Advice text is required" });
      }
      const created = await storage.createAshleysAdvice({ advice, isActive });
      res.json(created);
    } catch (error) {
      console.error("Error creating advice:", error);
      res.status(500).json({ error: "Failed to create advice" });
    }
  });

  app.patch("/api/admin/ashleys-advice/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { advice, isActive } = req.body;
      const updated = await storage.updateAshleysAdvice(id, { advice, isActive });
      if (!updated) {
        return res.status(404).json({ error: "Advice not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating advice:", error);
      res.status(500).json({ error: "Failed to update advice" });
    }
  });

  app.delete("/api/admin/ashleys-advice/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAshleysAdvice(id);
      if (!deleted) {
        return res.status(404).json({ error: "Advice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting advice:", error);
      res.status(500).json({ error: "Failed to delete advice" });
    }
  });

  return httpServer;
}
