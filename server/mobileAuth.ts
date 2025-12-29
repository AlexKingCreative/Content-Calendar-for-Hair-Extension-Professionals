import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/models/auth';
import { userProfiles, magicLinkTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { storage } from './storage';
import { generateMonthPDF } from './pdfExport';
import { sendMagicLinkEmail } from './emailService';

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || 'hairpro-mobile-secret-key';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function authenticateMobile(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.mobileUserId = payload.userId;
  next();
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || null;

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      firstName,
      lastName,
    }).returning();

    await db.insert(userProfiles).values({
      userId: newUser.id,
      onboardingComplete: false,
    });

    const token = generateToken(newUser.id);

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName}${newUser.lastName ? ' ' + newUser.lastName : ''}`,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/request-magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(magicLinkTokens).values({
      email: normalizedEmail,
      token,
      expiresAt,
      onboardingData: JSON.stringify({ verificationCode }),
    });

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://content-calendar-hair-pro.replit.app';
    
    const magicLinkUrl = `${baseUrl}/api/auth/verify-magic-link?token=${token}`;
    
    const emailSent = await sendMagicLinkEmail(normalizedEmail, magicLinkUrl, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

    res.json({ 
      success: true, 
      message: 'Magic link sent! Check your email.',
      token
    });
  } catch (error) {
    console.error('Mobile magic link request error:', error);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
});

router.post('/verify-magic-link', async (req, res) => {
  try {
    const { token, code } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const [magicLink] = await db.select()
      .from(magicLinkTokens)
      .where(and(
        eq(magicLinkTokens.token, token),
        eq(magicLinkTokens.used, false),
        gt(magicLinkTokens.expiresAt, new Date())
      ));

    if (!magicLink) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }

    const storedData = magicLink.onboardingData ? JSON.parse(magicLink.onboardingData) : {};
    if (code && storedData.verificationCode && code !== storedData.verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await db.update(magicLinkTokens)
      .set({ used: true })
      .where(eq(magicLinkTokens.id, magicLink.id));

    let [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, magicLink.email));

    if (!existingUser) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      [existingUser] = await db.insert(users).values({
        email: magicLink.email,
        passwordHash,
        firstName: null,
        lastName: null,
      }).returning();

      await db.insert(userProfiles).values({
        userId: existingUser.id,
        onboardingComplete: false,
      });
    }

    const jwtToken = generateToken(existingUser.id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: `${existingUser.firstName || ''}${existingUser.lastName ? ' ' + existingUser.lastName : ''}`.trim() || null,
      },
    });
  } catch (error) {
    console.error('Mobile magic link verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

router.get('/user', authenticateMobile, async (req: any, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.mobileUserId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

router.get('/profile', authenticateMobile, async (req: any, res) => {
  try {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.mobileUserId));
    res.json(profile || { userId: req.mobileUserId, subscriptionTier: 'free' });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

router.put('/profile', authenticateMobile, async (req: any, res) => {
  try {
    const { postingGoal, certifiedBrands, extensionMethods, city, postingServices, showStreaks, pushNotificationsEnabled, instagramHandle, experience, voice, tone } = req.body;
    
    const updateData: Record<string, any> = {};
    
    if (postingGoal !== undefined) {
      if (!['daily', 'casual', 'occasional'].includes(postingGoal)) {
        return res.status(400).json({ message: 'Invalid posting goal' });
      }
      updateData.postingGoal = postingGoal;
    }
    if (certifiedBrands !== undefined) {
      if (!Array.isArray(certifiedBrands)) {
        return res.status(400).json({ message: 'certifiedBrands must be an array' });
      }
      updateData.certifiedBrands = certifiedBrands;
    }
    if (extensionMethods !== undefined) {
      if (!Array.isArray(extensionMethods)) {
        return res.status(400).json({ message: 'extensionMethods must be an array' });
      }
      updateData.extensionMethods = extensionMethods;
    }
    if (city !== undefined && typeof city === 'string') {
      updateData.city = city;
    }
    if (postingServices !== undefined) {
      if (!Array.isArray(postingServices)) {
        return res.status(400).json({ message: 'postingServices must be an array' });
      }
      updateData.postingServices = postingServices;
    }
    if (typeof showStreaks === 'boolean') {
      updateData.showStreaks = showStreaks;
    }
    if (typeof pushNotificationsEnabled === 'boolean') {
      updateData.pushNotificationsEnabled = pushNotificationsEnabled;
    }
    if (instagramHandle !== undefined && typeof instagramHandle === 'string') {
      updateData.instagramHandle = instagramHandle;
    }
    if (experience !== undefined && typeof experience === 'string') {
      updateData.experience = experience;
    }
    if (voice !== undefined && typeof voice === 'string') {
      updateData.voice = voice;
    }
    if (tone !== undefined && typeof tone === 'string') {
      updateData.tone = tone;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.mobileUserId));
    
    if (existing) {
      const [updated] = await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, req.mobileUserId))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(userProfiles)
        .values({ userId: req.mobileUserId, ...updateData })
        .returning();
      res.json(created);
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.get('/calendar/pdf/:month', async (req: any, res) => {
  try {
    const token = req.query.token || req.headers.authorization?.substring(7);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string } | null;
    if (!payload?.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const month = parseInt(req.params.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month' });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    const userEmail = user?.email || 'Unknown';
    
    const posts = await storage.getPostsByMonth(month);
    const pdfBuffer = generateMonthPDF(posts, month, userEmail);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=content-calendar-${month}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

router.get('/web-login-token', authenticateMobile, async (req: any, res) => {
  try {
    const token = jwt.sign({ userId: req.mobileUserId, type: 'web-login' }, JWT_SECRET, { expiresIn: '5m' });
    res.json({ token });
  } catch (error) {
    console.error('Web login token error:', error);
    res.status(500).json({ message: 'Failed to generate login token' });
  }
});

router.post('/streak/log', authenticateMobile, async (req: any, res) => {
  try {
    const userId = req.mobileUserId;
    const today = new Date().toISOString().split('T')[0];
    const { postId } = req.body;
    
    const hasPosted = await storage.hasPostedToday(userId, today);
    if (hasPosted) {
      return res.status(400).json({ error: "Already logged a post today" });
    }
    
    await storage.logPost(userId, today, postId);
    const profile = await storage.updateStreak(userId);
    
    res.json({ 
      success: true, 
      currentStreak: profile?.currentStreak || 0,
      longestStreak: profile?.longestStreak || 0
    });
  } catch (error) {
    console.error('Mobile streak log error:', error);
    res.status(500).json({ error: 'Failed to log post' });
  }
});

router.post('/challenges/:challengeId/start', authenticateMobile, async (req: any, res) => {
  try {
    const userId = req.mobileUserId;
    const challengeId = parseInt(req.params.challengeId);
    
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }
    
    const challenge = await storage.getChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    const existing = await storage.getActiveUserChallengeForChallenge(userId, challengeId);
    if (existing) {
      return res.status(400).json({ error: 'You already have this challenge active' });
    }
    
    const userChallenge = await storage.startChallenge(userId, challengeId);
    res.json({ ...userChallenge, challenge });
  } catch (error) {
    console.error('Mobile start challenge error:', error);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
});

router.post('/user/challenges/:id/progress', authenticateMobile, async (req: any, res) => {
  try {
    const userId = req.mobileUserId;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user challenge ID' });
    }
    
    const userChallenge = await storage.getUserChallengeById(id);
    if (!userChallenge || userChallenge.userId !== userId) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    if (userChallenge.status !== 'active') {
      return res.status(400).json({ error: 'Challenge is not active' });
    }
    
    const updated = await storage.logChallengeProgress(id);
    res.json(updated);
  } catch (error) {
    console.error('Mobile log challenge progress error:', error);
    res.status(500).json({ error: 'Failed to log progress' });
  }
});

router.post('/stripe/checkout', authenticateMobile, async (req: any, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }
    
    const { plan } = req.body;
    const priceId = plan === 'annual' ? 'price_pro_annual' : 'price_pro_monthly';
    const withTrial = plan === 'monthly';
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-11-17.clover' });
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://contentcalendarforhairpros.com';
    
    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      client_reference_id: req.mobileUserId,
    };
    
    if (withTrial) {
      sessionParams.subscription_data = {
        trial_period_days: 7,
      };
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: error.message || 'Failed to create checkout session' });
  }
});

export default router;
