import {
  calculateGrowth,
  getDateRangeBoundaries,
  aggregateOrderMetrics,
  generateTimeSeriesBuckets,
  computeWeeklyGrowth,
  computeMonthlyGrowth,
  computeProductPerformance,
  computeStatusAndPaymentAnalytics,
  computeDealerPerformance,
  compileDashboardAnalytics,
} from './src/lib/analytics.js';

console.log('=== TEST 1: calculateGrowth Function ===');
const g1 = calculateGrowth(120, 100);
console.log('100 -> 120 (Revenue +20%):', g1);
if (g1.value !== 20 || g1.status !== 'positive') throw new Error('Growth test 1 failed');

const g2 = calculateGrowth(80, 100);
console.log('100 -> 80 (Revenue -20%):', g2);
if (g2.value !== -20 || g2.status !== 'negative') throw new Error('Growth test 2 failed');

const g3 = calculateGrowth(50, 0);
console.log('0 -> 50 (New):', g3);
if (g3.formatted !== 'New' || g3.status !== 'positive') throw new Error('Growth test 3 failed');

const g4 = calculateGrowth(5, 10, true); // Inverted (Unpaid orders down)
console.log('10 -> 5 (Unpaid orders reduced):', g4);
if (g4.status !== 'positive') throw new Error('Inverted growth test failed');

console.log('\n=== TEST 2: getDateRangeBoundaries ===');
['today', 'yesterday', '7d', '30d', 'this_month', 'last_month', '3m', '6m', '1y'].forEach((r) => {
  const bounds = getDateRangeBoundaries(r);
  console.log(`Range [${r}]: currentStart=${bounds.currentStart.substring(0, 10)}, bucketType=${bounds.bucketType}`);
  if (!bounds.currentStart || !bounds.currentEnd || !bounds.prevStart || !bounds.prevEnd) {
    throw new Error(`Boundary test failed for range ${r}`);
  }
});

console.log('\n=== TEST 3: Mock Data & Full Analytics Compilation ===');
const mockOrders = [
  {
    _id: 'ord_1',
    orderId: 'ORD-101',
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 12999,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    products: [
      {
        product: { _ref: 'prod_nike' },
        name: 'Nike Air Max 270',
        productCode: 'AXS-001',
        quantity: 1,
        price: 12999,
        dealer: { _ref: 'dealer_abc' },
        dealerName: 'ABC Footwear',
      },
    ],
  },
  {
    _id: 'ord_2',
    orderId: 'ORD-102',
    orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 24998,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    products: [
      {
        product: { _ref: 'prod_nike' },
        name: 'Nike Air Max 270',
        productCode: 'AXS-001',
        quantity: 1,
        price: 12999,
        dealer: { _ref: 'dealer_abc' },
        dealerName: 'ABC Footwear',
      },
      {
        product: { _ref: 'prod_adidas' },
        name: 'Adidas Ultraboost',
        productCode: 'AXS-002',
        quantity: 1,
        price: 11999,
        dealer: { _ref: 'dealer_xyz' },
        dealerName: 'XYZ Sports',
      },
    ],
  },
  {
    _id: 'ord_3',
    orderId: 'ORD-103',
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 8999,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    products: [
      {
        product: { _ref: 'prod_puma' },
        name: 'Puma RS-X',
        productCode: 'AXS-003',
        quantity: 1,
        price: 8999,
        dealer: { _ref: 'dealer_abc' },
        dealerName: 'ABC Footwear',
      },
    ],
  },
];

const mockDealers = [
  { _id: 'dealer_abc', name: 'ABC Footwear', businessName: 'ABC Footwear Pvt Ltd' },
  { _id: 'dealer_xyz', name: 'XYZ Sports', businessName: 'XYZ Sports Gear' },
];

const result = compileDashboardAnalytics({
  orders: mockOrders,
  dealers: mockDealers,
  rangeKey: '30d',
});

console.log('\n--- Compiled Analytics Results ---');
console.log('Total Revenue:', result.kpis.totalRevenue);
console.log('Total Orders:', result.kpis.totalSales);
console.log('Paid Orders:', result.kpis.paidOrders);
console.log('Unpaid Orders:', result.kpis.unpaidOrders);
console.log('Products Sold Units:', result.kpis.productsSold);
console.log('Average Order Value:', result.kpis.averageOrderValue);
console.log('Best by Revenue Product #1:', result.productAnalytics.bestByRevenue[0]?.name);
console.log('Top Dealer #1:', result.dealerPerformance[0]?.name, 'Revenue:', result.dealerPerformance[0]?.revenue);
console.log('Revenue Chart Buckets Count:', result.revenueChart.length);

if (result.kpis.totalRevenue.value !== 37997) {
  throw new Error(`Expected revenue 37997, got ${result.kpis.totalRevenue.value}`);
}

if (result.kpis.paidOrders.value !== 2) {
  throw new Error(`Expected 2 paid orders, got ${result.kpis.paidOrders.value}`);
}

if (result.kpis.unpaidOrders.value !== 1) {
  throw new Error(`Expected 1 unpaid order, got ${result.kpis.unpaidOrders.value}`);
}

console.log('\n✅ ALL ANALYTICS ENGINE TESTS PASSED PERFECTLY!');
