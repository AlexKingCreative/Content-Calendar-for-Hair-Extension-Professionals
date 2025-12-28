import { getUncachableStripeClient } from './stripeClient';

async function createSubscriptionProduct() {
  const stripe = await getUncachableStripeClient();

  const existingProducts = await stripe.products.search({ 
    query: "name:'Hair Pro Content Calendar Pro'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Subscription product already exists:', existingProducts.data[0].id);
    const existingPrices = await stripe.prices.list({ 
      product: existingProducts.data[0].id,
      active: true 
    });
    if (existingPrices.data.length > 0) {
      console.log('Price already exists:', existingPrices.data[0].id);
      return;
    }
  }

  const product = await stripe.products.create({
    name: 'Hair Pro Content Calendar Pro',
    description: 'Full access to 365 days of professional hair content ideas, AI caption generation, personalized hashtags, and special day reminders',
    metadata: {
      type: 'subscription',
      features: 'full_calendar,ai_captions,hashtags,notifications,streaks',
    }
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1000,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      display_name: 'Monthly Pro',
    }
  });

  console.log('Created price:', price.id, '- $10/month');
  console.log('Done! Webhooks will sync these to the database.');
}

createSubscriptionProduct().catch(console.error);
