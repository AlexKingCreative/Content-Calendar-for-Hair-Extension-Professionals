import type { Express } from "express";
import { authStorage } from "./storage";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user - supports both Replit OAuth and email/password sessions
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check for Replit OAuth user first
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        return res.json(user);
      }
      
      // Check for email/password session
      if (req.session?.userId) {
        const { db } = await import("../../db");
        const { users } = await import("@shared/models/auth");
        const { userProfiles } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        
        const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
        if (user) {
          // Also fetch profile to get isAdmin status
          const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
          return res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: null,
            isAdmin: profile?.isAdmin || false,
          });
        }
      }
      
      // No valid authentication
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
