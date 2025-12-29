import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

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

  async getSubscriptionPriceByInterval(interval: 'month' | 'year') {
    const result = await db.execute(
      sql`SELECT p.*, pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring
          FROM stripe.products p
          JOIN stripe.prices pr ON pr.product = p.id
          WHERE p.active = true AND pr.active = true
          AND p.metadata->>'type' = 'subscription'
          AND pr.recurring->>'interval' = ${interval}
          ORDER BY pr.unit_amount ASC
          LIMIT 1`
    );
    return result.rows[0] || null;
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
