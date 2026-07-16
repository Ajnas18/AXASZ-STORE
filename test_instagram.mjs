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

const secret = envVars.SANITY_REVALIDATE_SECRET;
const port = 3000;
const targetUrl = `http://localhost:${port}/api/instagram?secret=${secret}`;

// 2. Setup Sanity Client
const client = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

async function runTest() {
  console.log("Starting Webhook Mock Test...");
  console.log(`Target URL: http://localhost:${port}/api/instagram?secret=***`);

  let testPayload = null;

  try {
    // Attempt to fetch a real product from Sanity
    const query = `*[_type == "product"][0]{ _id, name, brand, price, productCode, image }`;
    const product = await client.fetch(query);
    
    if (product) {
      console.log(`Found real product in Sanity: "${product.name}"`);
      testPayload = product;
    } else {
      console.log("No products found in Sanity. Using fallback mock payload.");
    }
  } catch (err) {
    console.warn("Could not query Sanity CMS. Using fallback mock payload. Error:", err.message);
  }

  // Fallback mock payload if query failed or returned empty
  if (!testPayload) {
    testPayload = {
      _id: "test-product-123",
      name: "Air Jordan 1 Retro High",
      brand: "Nike",
      price: 15999,
      productCode: "AJ1-RETRO-01",
      image: {
        _type: "image",
        asset: {
          _ref: "image-mockref1234567890-1000x1000-jpg",
          _type: "reference"
        }
      }
    };
  }

  // Send request
  console.log("Sending payload:", JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const status = response.status;
    const data = await response.json();

    console.log("\n--- TEST RESPONSE ---");
    console.log(`Status Code: ${status}`);
    console.log("Response Body:", JSON.stringify(data, null, 2));
    
    if (status === 200 && data.success) {
      console.log("\n✅ SUCCESS: The API endpoint works beautifully!");
      if (data.mocked) {
        console.log("ℹ️ Note: Zapier URL is not configured yet, so the payload was generated and printed in mock mode.");
      }
    } else {
      console.log("\n❌ FAILED: The API endpoint returned an error.");
    }

  } catch (err) {
    console.error("\n❌ CONNECTION ERROR: Could not connect to Next.js server.");
    console.error("Please make sure your Next.js development server is running on localhost:3000");
    console.error("You can start it with: npm run dev");
  }
}

runTest();
