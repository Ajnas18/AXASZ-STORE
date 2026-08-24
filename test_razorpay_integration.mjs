import crypto from 'crypto';
import { verifyPaymentSignature, verifyWebhookSignature } from './src/lib/razorpay.js';

console.log('--- TESTING RAZORPAY INTEGRATION & SECURITY LOGIC ---');

// Mock test secrets
process.env.RAZORPAY_KEY_SECRET = 'test_secret_key_12345';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_67890';

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, testName) {
  testsTotal++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// TEST 1: Valid payment signature verification
const testRazorpayOrderId = 'order_DAv123456789';
const testRazorpayPaymentId = 'pay_9876543210AB';
const validSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${testRazorpayOrderId}|${testRazorpayPaymentId}`)
  .digest('hex');

const isSigValid = verifyPaymentSignature({
  razorpayOrderId: testRazorpayOrderId,
  razorpayPaymentId: testRazorpayPaymentId,
  razorpaySignature: validSignature,
});
assert(isSigValid === true, '1. Valid payment signature successfully verifies');

// TEST 2: Tampered signature rejection
const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + 'ff';
const isTamperedSigValid = verifyPaymentSignature({
  razorpayOrderId: testRazorpayOrderId,
  razorpayPaymentId: testRazorpayPaymentId,
  razorpaySignature: tamperedSignature,
});
assert(isTamperedSigValid === false, '2. Tampered payment signature is rejected');

// TEST 3: Altered Payment ID or Order ID rejection
const isAlteredOrderValid = verifyPaymentSignature({
  razorpayOrderId: 'order_DIFFERENT_123',
  razorpayPaymentId: testRazorpayPaymentId,
  razorpaySignature: validSignature,
});
assert(isAlteredOrderValid === false, '3. Payment signature with altered order ID is rejected');

// TEST 4: Valid Webhook signature verification
const mockWebhookPayload = JSON.stringify({
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_ABC123',
        order_id: 'order_XYZ987',
        amount: 499900,
        status: 'captured',
      },
    },
  },
});

const validWebhookSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(mockWebhookPayload)
  .digest('hex');

const isWebhookSigValid = verifyWebhookSignature(
  mockWebhookPayload,
  validWebhookSignature,
  process.env.RAZORPAY_WEBHOOK_SECRET
);
assert(isWebhookSigValid === true, '4. Valid webhook payload & signature successfully verifies');

// TEST 5: Tampered Webhook payload rejection
const tamperedWebhookPayload = mockWebhookPayload.replace('499900', '10000');
const isTamperedWebhookValid = verifyWebhookSignature(
  tamperedWebhookPayload,
  validWebhookSignature,
  process.env.RAZORPAY_WEBHOOK_SECRET
);
assert(isTamperedWebhookValid === false, '5. Tampered webhook payload is rejected');

// TEST 6: Missing / Empty parameters handle safely
const isMissingParamsSafe = verifyPaymentSignature({
  razorpayOrderId: '',
  razorpayPaymentId: '',
  razorpaySignature: '',
});
assert(isMissingParamsSafe === false, '6. Empty signature parameters return false safely');

console.log(`\nResults: ${testsPassed}/${testsTotal} tests passed.`);

if (testsPassed !== testsTotal) {
  process.exit(1);
}
