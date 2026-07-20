import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
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

const builder = createImageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

async function testUrlFor() {
  const products = await client.fetch(`*[_type == "product"]{ _id, name, image }`);
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.image) continue;
    
    try {
      const generatedUrl = urlFor(p.image).url();
      console.log(`[${i+1}/${products.length}] "${p.name}":`);
      console.log(`   Generated: ${generatedUrl}`);
      
      const res = await fetch(generatedUrl);
      console.log(`   Status: ${res.status} ${res.statusText}\n`);
    } catch (err) {
      console.log(`❌ Error for "${p.name}": ${err.message}\n`);
    }
  }
}

testUrlFor();
