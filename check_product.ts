import { getUncachableStripeClient } from './server/stripeClient';

async function checkProduct() {
  const stripe = await getUncachableStripeClient();
  
  // Try to fetch the specific products the user mentioned
  const productIds = [
    'prod_Th4rbvqtqKDzps',  // pro monthly
    'prod_ThF3Z1YpO3Ny3u',  // pro quarterly
    'prod_ThF4RMME2X9Ar3',  // pro yearly
    'prod_ThF8kudL8NprI8',  // salon start
    'prod_ThF9uY6L0kAIwd',  // salon grow
    'prod_ThFBOMLL84Em1y',  // extra seat addon
  ];
  
  for (const id of productIds) {
    try {
      const product = await stripe.products.retrieve(id);
      console.log(`Found: ${product.name} (${product.id})`);
      
      const prices = await stripe.prices.list({ product: id });
      for (const price of prices.data) {
        console.log(`  Price: ${price.id} - ${price.unit_amount} ${price.currency}/${price.recurring?.interval}`);
      }
    } catch (e: any) {
      console.log(`NOT FOUND: ${id} - ${e.message}`);
    }
  }
}

checkProduct().catch(console.error);
