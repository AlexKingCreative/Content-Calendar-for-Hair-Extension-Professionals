import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from '@shared/models/auth';
import { userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
    const { postingGoal, certifiedBrands, extensionMethods, city, postingServices } = req.body;
    
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

router.post('/stripe/checkout', authenticateMobile, async (req: any, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-11-17.clover' });
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://content-calendar-hair-pro.replit.app';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_pro_monthly',
        quantity: 1,
      }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      client_reference_id: req.mobileUserId,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: error.message || 'Failed to create checkout session' });
  }
});

export default router;
