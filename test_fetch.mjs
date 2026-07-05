import { createClient } from 'next-sanity';
import fs from 'fs';

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
  token: envVars.SANITY_API_TOKEN,
  useCdn: false,
});

async function testFetch() {
  const email = "test@example.com"; // we will just fetch all customers to see
  const customers = await client.fetch(`*[_type == "customer"]{ _id, email, password }`);
  console.log("Customers:", customers);
}

testFetch();
