import {
  normalizePhoneNumber,
  buildWhatsAppUrl,
  groupOrderItemsByDealer,
  generateDealerPaidMessage,
  generateAdminUnpaidMessage,
  generateAdminUnassignedDealerMessage,
  computeOrderRouting,
} from './src/lib/orderRouting.js';

console.log('=== TEST 1: Phone Normalization ===');
const testPhones = [
  { input: '+91 98765 43210', expected: '919876543210' },
  { input: '9876543210', expected: '919876543210' },
  { input: '09876543210', expected: '919876543210' },
  { input: '+1 (555) 123-4567', expected: '15551234567' },
  { input: '91-9876543210', expected: '919876543210' },
];

let allPhonesPass = true;
testPhones.forEach(({ input, expected }) => {
  const result = normalizePhoneNumber(input);
  const pass = result === expected;
  console.log(`Phone: "${input}" -> "${result}" [${pass ? 'PASS' : 'FAIL'}]`);
  if (!pass) allPhonesPass = false;
});

if (!allPhonesPass) {
  throw new Error('Phone normalization tests failed');
}

console.log('\n=== TEST 2: Multi-Dealer Order Grouping ===');
const dealerA = {
  _id: 'dealer_1',
  name: 'ABC Footwear',
  businessName: 'ABC Footwear Pvt Ltd',
  whatsapp: '919876543210',
  status: 'active',
};

const dealerB = {
  _id: 'dealer_2',
  name: 'XYZ Sports',
  businessName: 'XYZ Sports Gear',
  whatsapp: '919123456789',
  status: 'active',
};

const dealersMap = {
  dealer_1: dealerA,
  dealer_2: dealerB,
};

const sampleProducts = [
  {
    product: { _ref: 'prod_1' },
    name: 'Nike Air Max 270',
    productCode: 'AXS-001',
    size: '9',
    quantity: 1,
    price: 12999,
    dealer: { _ref: 'dealer_1' },
    dealerName: 'ABC Footwear',
  },
  {
    product: { _ref: 'prod_2' },
    name: 'Adidas Ultraboost',
    productCode: 'AXS-002',
    size: '8',
    quantity: 1,
    price: 15999,
    dealer: { _ref: 'dealer_2' },
    dealerName: 'XYZ Sports',
  },
  {
    product: { _ref: 'prod_3' },
    name: 'Puma RS-X',
    productCode: 'AXS-003',
    size: '10',
    quantity: 2,
    price: 8999,
    dealer: { _ref: 'dealer_1' },
    dealerName: 'ABC Footwear',
  },
  {
    product: { _ref: 'prod_4' },
    name: 'Generic Store Socks',
    productCode: 'AXS-004',
    size: 'Free',
    quantity: 1,
    price: 499,
    // No dealer assigned
  },
];

const grouped = groupOrderItemsByDealer(sampleProducts, dealersMap);
console.log(`Dealer groups created: ${grouped.groups.length} (Expected: 2)`);
console.log(`Dealer A items: ${grouped.groups.find(g => g.dealer._id === 'dealer_1')?.items.length} (Expected: 2)`);
console.log(`Dealer B items: ${grouped.groups.find(g => g.dealer._id === 'dealer_2')?.items.length} (Expected: 1)`);
console.log(`Unassigned items: ${grouped.unassignedItems.length} (Expected: 1)`);

if (grouped.groups.length !== 2 || grouped.unassignedItems.length !== 1) {
  throw new Error('Dealer grouping failed');
}

console.log('\n=== TEST 3: Dynamic Message Generation ===');
const mockOrder = {
  orderId: 'ORD-1050',
  orderDate: new Date().toISOString(),
  paymentStatus: 'Paid',
  shippingAddress: {
    firstName: 'Mohammed',
    lastName: 'Ajnas',
    phone: '+91 98765 00000',
    streetAddress: '123 Marine Drive',
    city: 'Mumbai',
    postalCode: '400020',
    country: 'India',
  },
  products: sampleProducts,
  subtotal: 46496,
  totalAmount: 46496,
};

// 3.1: Dealer A Paid Message
const dealerAGroup = grouped.groups.find(g => g.dealer._id === 'dealer_1');
const dealerAMsg = generateDealerPaidMessage({
  order: mockOrder,
  dealer: dealerAGroup.dealer,
  items: dealerAGroup.items,
});
console.log('--- Dealer A Paid Message ---');
console.log(dealerAMsg);
console.log('-----------------------------');

// 3.2: Admin Unpaid Message
const adminUnpaidMsg = generateAdminUnpaidMessage({
  order: { ...mockOrder, paymentStatus: 'UNPAID' },
  paymentStatus: 'UNPAID',
});
console.log('--- Admin Unpaid Message ---');
console.log(adminUnpaidMsg);
console.log('----------------------------');

// 3.3: Admin Unassigned Items Alert
const adminAlertMsg = generateAdminUnassignedDealerMessage({
  order: mockOrder,
  unassignedItems: grouped.unassignedItems,
});
console.log('--- Admin Unassigned Products Alert ---');
console.log(adminAlertMsg);
console.log('---------------------------------------');

console.log('\n=== TEST 4: Compute Order Routing (PAID vs UNPAID) ===');

// 4.1: Compute Routing for PAID order
const paidRouting = computeOrderRouting({
  order: mockOrder,
  dealersMap,
});
console.log('PAID Routing Dealer Notifications Count:', paidRouting.dealerNotifications.length);
console.log('PAID Routing Needs Admin Attention:', paidRouting.needsAdminAttention);
console.log('PAID Routing Dealer A WA URL:', paidRouting.dealerNotifications[0]?.whatsappUrl.substring(0, 50) + '...');

if (paidRouting.dealerNotifications.length !== 2 || !paidRouting.needsAdminAttention) {
  throw new Error('PAID routing computation failed');
}

// 4.2: Compute Routing for UNPAID order
const unpaidRouting = computeOrderRouting({
  order: { ...mockOrder, paymentStatus: 'Pending' },
  dealersMap,
});
console.log('UNPAID Routing Dealer Notifications Count:', unpaidRouting.dealerNotifications.length, '(Expected: 0)');
console.log('UNPAID Routing Admin Notification Present:', !!unpaidRouting.adminNotification);
console.log('UNPAID Routing Admin WA URL:', unpaidRouting.adminNotification?.whatsappUrl.substring(0, 50) + '...');

if (unpaidRouting.dealerNotifications.length !== 0 || !unpaidRouting.adminNotification) {
  throw new Error('UNPAID routing computation failed');
}

console.log('\n✅ ALL ROUTING & MESSAGE TESTS PASSED PERFECTLY!');
