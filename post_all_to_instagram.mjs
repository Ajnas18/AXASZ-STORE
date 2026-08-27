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

const instagramAccountId = envVars.INSTAGRAM_ACCOUNT_ID;
const instagramAccessToken = envVars.INSTAGRAM_ACCESS_TOKEN;
const zapierUrl = envVars.ZAPIER_WEBHOOK_URL;

if (!zapierUrl && (!instagramAccountId || !instagramAccessToken)) {
  console.error("❌ ERROR: Neither INSTAGRAM_ACCOUNT_ID/INSTAGRAM_ACCESS_TOKEN nor ZAPIER_WEBHOOK_URL is set in .env.local!");
  process.exit(1);
}

// 2. Setup Sanity Client
const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

// Simple helper to build image URLs directly
function getImageUrl(image) {
  if (!image || !image.asset || !image.asset._ref) return null;
  const ref = image.asset._ref;
  // Format: image-assetId-dimensions-extension
  const parts = ref.split('-');
  if (parts.length < 4) return null;
  const assetId = parts[1];
  const dimensions = parts[2];
  const extension = parts[3];
  
  let url = `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${assetId}-${dimensions}.${extension}`;
  
  // Apply crop if available, and ensure image is converted to JPEG, resized to 1000px, and ends with .jpg
  if (image.crop) {
    const [width, height] = dimensions.split('x').map(Number);
    const left = Math.round(image.crop.left * width);
    const top = Math.round(image.crop.top * height);
    const right = Math.round(image.crop.right * width);
    const bottom = Math.round(image.crop.bottom * height);
    const w = width - left - right;
    const h = height - top - bottom;
    url += `?rect=${left},${top},${w},${h}&fm=jpg&w=1000&ext=.jpg`;
  } else {
    url += `?fm=jpg&w=1000&ext=.jpg`;
  }
  return url;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Fetching all existing sneakers from Sanity...");
  
  try {
    const products = await client.fetch(`*[_type == "product"]{ _id, name, brand, price, productCode, image }`);
    
    if (products.length === 0) {
      console.log("No sneakers found in Sanity.");
      return;
    }
    
    console.log(`Found ${products.length} sneakers. Preparing to post them to Instagram...`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] Processing: "${product.name}"...`);
      
      // Force use of the public Vercel domain so that Instagram's crawler can always reach the proxy endpoint
      const appUrl = envVars.NEXT_PUBLIC_APP_URL && !envVars.NEXT_PUBLIC_APP_URL.includes('localhost')
        ? envVars.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
        : 'https://axaszstore.com';
        
      const imageUrl = `${appUrl}/api/instagram-image/${product._id}/sneaker.jpg`;
      const tryUrl = `${appUrl}/try/${product._id}`;
      
      const cleanBrandTag = product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sneakers';
      
      const caption = `🔥 NEW DROP: ${product.name}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Brand: ${product.brand || 'AXASZ'}\n` +
        `SKU: ${product.productCode || 'N/A'}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Check our website for price & details! 👟\n` +
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
      
      if (instagramAccountId && instagramAccessToken) {
        console.log(`Publishing directly via Meta Instagram Graph API...`);
        
        // Step 1: Create Container
        const containerUrl = new URL(`https://graph.facebook.com/v21.0/${instagramAccountId}/media`);
        containerUrl.searchParams.append('image_url', imageUrl);
        containerUrl.searchParams.append('caption', caption);
        containerUrl.searchParams.append('access_token', instagramAccessToken);

        const containerRes = await fetch(containerUrl.toString(), { method: 'POST' });
        const containerData = await containerRes.json();

        if (!containerRes.ok || !containerData.id) {
          console.error(`❌ Failed to create container for "${product.name}":`, containerData);
          continue;
        }

        // Wait 3 seconds for Meta image processing
        await delay(3000);

        // Step 2: Publish Container
        const publishUrl = new URL(`https://graph.facebook.com/v21.0/${instagramAccountId}/media_publish`);
        publishUrl.searchParams.append('creation_id', containerData.id);
        publishUrl.searchParams.append('access_token', instagramAccessToken);

        const publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
        const publishData = await publishRes.json();

        if (publishRes.ok && publishData.id) {
          console.log(`✅ Successfully published "${product.name}" to Instagram! (Post ID: ${publishData.id})`);
        } else {
          console.error(`❌ Failed to publish "${product.name}":`, publishData);
        }

      } else if (zapierUrl) {
        console.log(`Sending to Zapier Webhook...`);
        const response = await fetch(zapierUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          console.log(`✅ Successfully sent "${product.name}" to Zapier!`);
        } else {
          const errText = await response.text();
          console.error(`❌ Failed to post "${product.name}": Status ${response.status} - ${errText}`);
        }
      }
      
      // Wait 5 seconds before the next post to prevent spam triggers
      if (i < products.length - 1) {
        console.log(`Waiting 5 seconds before next post...`);
        await delay(5000);
      }
    }
    
    console.log("\n🎉 Done! All existing sneakers have been posted.");
    
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main();
