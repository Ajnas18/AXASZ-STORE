import { createClient } from 'next-sanity';
import fs from 'fs';

// 1. Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    acc[key.trim()] = values.join('=').trim();
  }
  return acc;
}, {});

const webhookUrl = envVars.ZAPIER_WEBHOOK_URL;
if (!webhookUrl) {
  console.error("❌ ERROR: ZAPIER_WEBHOOK_URL is not set in .env.local!");
  process.exit(1);
}

// 2. Setup Sanity Client
const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

async function testSinglePost() {
  console.log("Fetching a sneaker from Sanity for live Instagram test...");
  
  try {
    const products = await client.fetch(`*[_type == "product"][0...1]{ _id, name, brand, price, productCode, image }`);
    
    if (!products || products.length === 0) {
      console.log("No sneakers found in Sanity.");
      return;
    }
    
    const product = products[0];
    console.log(`Found product: "${product.name}" (${product.brand})`);

    const appUrl = (envVars.NEXT_PUBLIC_APP_URL || 'https://axasz-store.vercel.app').replace(/\/+$/, '');
    const imageUrl = `${appUrl}/api/instagram-image/${product._id}/sneaker.jpg`;
    const tryUrl = `${appUrl}/try/${product._id}`;
    const cleanBrandTag = product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sneakers';
    
    const caption = `NEW DROP: ${product.name}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Brand: ${product.brand || 'AXASZ'}\n` +
      `SKU: ${product.productCode || 'N/A'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Check our website for price & details!\n` +
      `Virtual Try-on & Shop → ${tryUrl}\n\n` +
      `#sneakers #axaszstore #sneakerhead #kicks #${cleanBrandTag} #freshkicks`;

    const payload = {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      productCode: product.productCode,
      imageUrl,
      tryUrl,
      caption
    };

    console.log("Sending payload to Make.com Webhook:", payload);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Webhook response status:", res.status);
    const body = await res.text();
    console.log("Webhook response body:", body);

    if (res.ok) {
      console.log("\n🎉 Webhook triggered successfully! Check your Make scenario execution log and Instagram account!");
    } else {
      console.error("\n❌ Webhook returned an error:", body);
    }

  } catch (error) {
    console.error("Error during test:", error);
  }
}

testSinglePost();
