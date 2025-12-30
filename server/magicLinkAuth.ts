import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '@shared/models/auth';
import { userProfiles, magicLinkTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendMagicLinkEmail } from './emailService';

const router = Router();

function generateMagicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/request-magic-link', async (req, res) => {
  try {
    const { email, onboardingData } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(magicLinkTokens).values({
      email: normalizedEmail,
      token,
      expiresAt,
      onboardingData: onboardingData ? JSON.stringify(onboardingData) : null,
    });

    const baseUrl = process.env.REPLIT_DEPLOYMENT === '1'
      ? 'https://contentcalendarforhairpros.com'
      : (process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'https://contentcalendarforhairpros.com');
    
    const magicLinkUrl = `${baseUrl}/api/auth/verify-magic-link?token=${token}`;
    
    const emailSent = await sendMagicLinkEmail(normalizedEmail, magicLinkUrl);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

    res.json({ success: true, message: 'Magic link sent! Check your email.' });
  } catch (error) {
    console.error('Magic link request error:', error);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
});

router.get('/verify-magic-link', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.redirect('/login?error=invalid_token');
    }

    const [magicLink] = await db.select()
      .from(magicLinkTokens)
      .where(and(
        eq(magicLinkTokens.token, token),
        eq(magicLinkTokens.used, false),
        gt(magicLinkTokens.expiresAt, new Date())
      ));

    if (!magicLink) {
      return res.redirect('/login?error=expired_token');
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

      const onboardingData = magicLink.onboardingData 
        ? JSON.parse(magicLink.onboardingData) 
        : {};

      await db.insert(userProfiles).values({
        userId: existingUser.id,
        city: onboardingData.city || null,
        offeredServices: onboardingData.offeredServices || [],
        postingServices: onboardingData.postingServices || [],
        certifiedBrands: onboardingData.certifiedBrands || [],
        extensionMethods: onboardingData.extensionMethods || [],
        onboardingComplete: !!onboardingData.city,
      });
    } else {
      if (magicLink.onboardingData) {
        const onboardingData = JSON.parse(magicLink.onboardingData);
        
        await db.update(userProfiles)
          .set({
            city: onboardingData.city || undefined,
            offeredServices: onboardingData.offeredServices || undefined,
            postingServices: onboardingData.postingServices || undefined,
            certifiedBrands: onboardingData.certifiedBrands || undefined,
            extensionMethods: onboardingData.extensionMethods || undefined,
            onboardingComplete: !!onboardingData.city,
          })
          .where(eq(userProfiles.userId, existingUser.id));
      }
    }

    if (req.session) {
      (req.session as any).userId = existingUser.id;
      (req.session as any).user = {
        claims: {
          sub: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.firstName,
          last_name: existingUser.lastName,
        }
      };
    }

    req.login({ 
      claims: { 
        sub: existingUser.id, 
        email: existingUser.email,
        first_name: existingUser.firstName,
        last_name: existingUser.lastName
      } 
    }, (err) => {
      if (err) {
        console.error('Login error after magic link:', err);
      }
      res.redirect('/calendar');
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.redirect('/login?error=verification_failed');
  }
});

export default router;
