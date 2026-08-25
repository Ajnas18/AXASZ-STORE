import { GET } from './src/app/api/admin/analytics/route.js';

console.log('==================================================');
console.log('🧪 TESTING ADMIN ANALYTICS AUTHENTICATION PROTECTION');
console.log('==================================================');

// 1. Simulate unauthenticated request
const unauthReq = new Request('http://localhost:3000/api/admin/analytics?range=30d', {
  method: 'GET',
});

const unauthRes = await GET(unauthReq);
console.log(`Unauthenticated Request Status: ${unauthRes.status} (Expected: 401)`);
const unauthJson = await unauthRes.json();
console.log('Response body:', unauthJson);

if (unauthRes.status !== 401) {
  throw new Error(`Failed: Unauthenticated request returned ${unauthRes.status}, expected 401!`);
}
console.log('✅ PASS: Unauthorized requests are strictly blocked with 401 Unauthorized!');

// 2. Simulate authorized request with secret
process.env.SANITY_REVALIDATE_SECRET = 'test_admin_secret_123';
const authReq = new Request('http://localhost:3000/api/admin/analytics?range=30d', {
  method: 'GET',
  headers: {
    'x-admin-secret': 'test_admin_secret_123'
  }
});

const authRes = await GET(authReq);
console.log(`\nAuthorized Request Status: ${authRes.status} (Expected: 200)`);
if (authRes.status !== 200) {
  throw new Error(`Failed: Authorized request returned ${authRes.status}, expected 200!`);
}
console.log('✅ PASS: Authorized request successfully authenticated and processed!');

console.log('\n==================================================');
console.log('🎉 ALL ANALYTICS AUTHENTICATION TESTS PASSED!');
console.log('==================================================\n');
