import { getUncachableStripeClient } from './server/stripeClient';

async function fetchPrices() {
  const stripe = await getUncachableStripeClient();
  
  const products = await stripe.products.list({ limit: 20 });
  
  console.log('=== Products and Prices ===\n');
  
  for (const product of products.data) {
    console.log(`Product: ${product.name}`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Active: ${product.active}`);
    
    const prices = await stripe.prices.list({ product: product.id, limit: 10 });
    for (const price of prices.data) {
      console.log(`  Price ID: ${price.id}`);
      console.log(`    Amount: ${price.unit_amount} ${price.currency}`);
      console.log(`    Interval: ${price.recurring?.interval} (count: ${price.recurring?.interval_count || 1})`);
      console.log(`    Active: ${price.active}`);
    }
    console.log('');
  }
}

fetchPrices().catch(console.error);
