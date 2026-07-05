import { createClient } from 'next-sanity';
import fs from 'fs';

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    acc[key.trim()] = values.join('=').trim();
  }
  return acc;
}, {});

const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: envVars.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function deleteSneakers() {
  try {
    const products = await client.fetch('*[_type == "product"]');
    console.log(`Found ${products.length} products in total.`);

    if (products.length === 0) {
      console.log('No products found. Nothing to delete.');
      return;
    }

    // Delete all products
    const productsToDelete = products;
    console.log(`Deleting ${productsToDelete.length} products...`);

    for (const product of productsToDelete) {
      console.log(`Attempting to delete ${product._id} - ${product.name}`);
      try {
        await client.delete(product._id);
        console.log(`✅ Successfully deleted ${product.name}`);
      } catch (deleteErr) {
        console.error(`❌ Failed to delete ${product.name} (${product._id}):`);
        console.error(`   Reason: ${deleteErr.message}`);
      }
    }

    console.log('Successfully deleted all extra products.');
  } catch (err) {
    console.error('Error deleting products:', err);
  }
}

deleteSneakers();
