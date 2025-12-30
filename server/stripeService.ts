import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

// Live mode Stripe price IDs
export const STRIPE_PRICES = {
  // Individual plans
  PRO_MONTHLY: 'price_1SjghaEwHywpBlpyibBPVyKa',    // $10/month
  PRO_QUARTERLY: 'price_1SjqZXEwHywpBlpyFqlLz09T',  // $25/3 months
  PRO_YEARLY: 'price_1SjqanEwHywpBlpyCZfBdp5v',     // $50/year
  // Salon plans
  SALON_START: 'price_1Sjqe5EwHywpBlpyio1zf6eq',    // $49/month (5 seats)
  SALON_GROW: 'price_1SjqexEwHywpBlpykPBAgahl',     // $79/month (10 seats)
  EXTRA_SEAT: 'price_1SjqhOEwHywpBlpyfoNrtB2i',     // $8/month per extra seat
} as const;

export class StripeService {
  async createCustomer(email: string, userId: string, name?: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string,
    withTrial: boolean = false
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: withTrial ? { trial_period_days: 7 } : undefined,
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async getActiveSubscriptionPrice() {
    const result = await db.execute(
      sql`SELECT p.*, pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring
          FROM stripe.products p
          JOIN stripe.prices pr ON pr.product = p.id
          WHERE p.active = true AND pr.active = true
          AND p.metadata->>'type' = 'subscription'
          ORDER BY pr.unit_amount ASC
          LIMIT 1`
    );
    return result.rows[0] || null;
  }

  async getAllSubscriptionPrices() {
    const result = await db.execute(
      sql`SELECT p.*, pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring
          FROM stripe.products p
          JOIN stripe.prices pr ON pr.product = p.id
          WHERE p.active = true AND pr.active = true
          AND p.metadata->>'type' = 'subscription'
          ORDER BY pr.unit_amount ASC`
    );
    return result.rows || [];
  }

  getSubscriptionPriceByInterval(interval: 'month' | 'quarter' | 'year') {
    // Use hardcoded Live mode price IDs
    const priceMap = {
      month: { price_id: STRIPE_PRICES.PRO_MONTHLY, unit_amount: 1000, currency: 'usd', interval: 'month' },
      quarter: { price_id: STRIPE_PRICES.PRO_QUARTERLY, unit_amount: 2500, currency: 'usd', interval: 'month', interval_count: 3 },
      year: { price_id: STRIPE_PRICES.PRO_YEARLY, unit_amount: 5000, currency: 'usd', interval: 'year' },
    };
    return priceMap[interval] || null;
  }
  
  getSalonPriceByTier(tier: 'start' | 'grow') {
    const priceMap = {
      start: { price_id: STRIPE_PRICES.SALON_START, unit_amount: 4900, currency: 'usd', seats: 5 },
      grow: { price_id: STRIPE_PRICES.SALON_GROW, unit_amount: 7900, currency: 'usd', seats: 10 },
    };
    return priceMap[tier] || null;
  }
  
  getExtraSeatPrice() {
    return { price_id: STRIPE_PRICES.EXTRA_SEAT, unit_amount: 800, currency: 'usd' };
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async getSubscriptionByCustomerId(customerId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions 
          WHERE customer = ${customerId} 
          AND status IN ('active', 'trialing')
          ORDER BY created DESC
          LIMIT 1`
    );
    return result.rows[0] || null;
  }

  async createStreakRewardCoupon(userId: string) {
    const stripe = await getUncachableStripeClient();
    const coupon = await stripe.coupons.create({
      percent_off: 50,
      duration: 'once',
      max_redemptions: 1,
      metadata: { userId, type: 'streak_reward' },
      name: '7-Day Streak Reward - 50% Off First Month',
    });
    return coupon;
  }

  async createCheckoutSessionWithCoupon(
    customerId: string, 
    priceId: string, 
    couponId: string,
    successUrl: string, 
    cancelUrl: string
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      discounts: [{ coupon: couponId }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
}

export const stripeService = new StripeService();
