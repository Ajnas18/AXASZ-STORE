import { createClient } from '@sanity/client';
import { PRODUCTS } from './src/data/products.js';
import fs from 'fs';

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    acc[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
  return acc;
}, {});

const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: envVars.SANITY_AUTH_TOKEN,
});

async function migrate() {
  if (!envVars.SANITY_AUTH_TOKEN) {
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
