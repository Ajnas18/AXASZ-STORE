import { createClient } from '@sanity/client';
import { PRODUCTS } from './src/data/products.js';

// Initialize the Sanity client
// You MUST add SANITY_AUTH_TOKEN to your .env.local file first!
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN, // Add this token in .env.local
});

async function migrate() {
  if (!process.env.SANITY_AUTH_TOKEN) {
    console.error('❌ Error: SANITY_AUTH_TOKEN is missing in .env.local!');
    console.error('Please generate an API token with "Editor" permissions in your Sanity project settings.');
    process.exit(1);
  }

  console.log('Starting migration to Sanity...');
  
  for (const product of PRODUCTS) {
    const sanityProduct = {
      _type: 'product',
      _id: `product-${product.id}`,
      productCode: product.productCode,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge,
      sizes: product.sizes,
      colors: product.colors,
      // Note: Images need to be uploaded as assets separately. 
      // For now, we store the local path as a string if you don't upload them.
    };

    try {
      const result = await client.createOrReplace(sanityProduct);
      console.log(`✅ Migrated: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.name}:`, error.message);
    }
  }

  console.log('🎉 Migration completed!');
}

migrate();
