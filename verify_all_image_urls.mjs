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

// 2. Setup Sanity Client
const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

function getImageUrl(image) {
  if (!image || !image.asset || !image.asset._ref) return null;
  const ref = image.asset._ref;
  const parts = ref.split('-');
  if (parts.length < 4) return null;
  const assetId = parts[1];
  const dimensions = parts[2];
  const extension = parts[3];
  
  let url = `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${assetId}-${dimensions}.${extension}`;
  
  if (image.crop) {
    const [width, height] = dimensions.split('x').map(Number);
    const left = Math.round(image.crop.left * width);
    const top = Math.round(image.crop.top * height);
    const right = Math.round(image.crop.right * width);
    const bottom = Math.round(image.crop.bottom * height);
    const w = width - left - right;
    const h = height - top - bottom;
    url += `?rect=${left},${top},${w},${h}&fm=jpg&ext=.jpg`;
  } else {
    url += `?fm=jpg&ext=.jpg`;
  }
  return url;
}

async function verifyUrls() {
  console.log("Fetching all products...");
  const products = await client.fetch(`*[_type == "product"]{ _id, name, brand, price, productCode, image }`);
  
  console.log(`Found ${products.length} products. Checking their URLs:\n`);
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const url = getImageUrl(p.image);
    
    if (!url) {
      console.log(`❌ [${i+1}/${products.length}] "${p.name}" has NO IMAGE or INVALID REF`);
      continue;
    }
    
    try {
      const res = await fetch(url);
      console.log(`[${i+1}/${products.length}] "${p.name}":`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${res.status} ${res.statusText}`);
      console.log(`   Content-Type: ${res.headers.get('content-type')}\n`);
    } catch (err) {
      console.log(`❌ [${i+1}/${products.length}] "${p.name}" Fetch error: ${err.message}\n`);
    }
  }
}

verifyUrls();
