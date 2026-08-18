/**
 * AXASZSTORE Analytics & Business Intelligence Engine
 * High-performance, pure calculations for KPIs, growth rates,
 * time-series bucketing, product growth trajectories, and dealer performance.
 */

/**
 * Calculates percentage growth between current and previous values.
 * Returns null or formatted number, handling zero division gracefully.
 */
export function calculateGrowth(current, previous, invert = false) {
  if (previous === undefined || previous === null || current === undefined || current === null) {
    return { value: 0, formatted: '0.0%', status: 'neutral', label: 'No prior data' };
  }

  if (previous === 0) {
    if (current === 0) {
      return { value: 0, formatted: '0.0%', status: 'neutral', label: '0.0%' };
    }
    return { value: 100, formatted: 'New', status: invert ? 'negative' : 'positive', label: 'New' };
  }

  const growth = ((current - previous) / previous) * 100;
  const rounded = Number(growth.toFixed(1));
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;

  let status = 'neutral';
  if (isPositive) {
    status = invert ? 'negative' : 'positive';
  } else if (isNegative) {
    status = invert ? 'positive' : 'negative';
  }

  const sign = isPositive ? '+' : '';
  const formatted = `${sign}${rounded}%`;

  return {
    value: rounded,
    formatted,
    status,
    label: formatted,
  };
}

/**
 * Resolves exact start/end dates for the selected date range and the previous comparison period.
 */
export function getDateRangeBoundaries(rangeKey = '30d', customStart = null, customEnd = null) {
  const now = new Date();
  let currentStart = new Date(now);
  let currentEnd = new Date(now);
  let prevStart = new Date(now);
  let prevEnd = new Date(now);
  let bucketType = 'day'; // 'day' | 'week' | 'month'

  switch (rangeKey) {
    case 'today': {
      currentStart.setHours(0, 0, 0, 0);
      currentEnd.setHours(23, 59, 59, 999);

      prevStart.setDate(prevStart.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      bucketType = 'hour';
      break;
    }

    case 'yesterday': {
      currentStart.setDate(currentStart.getDate() - 1);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentEnd.setHours(23, 59, 59, 999);

      prevStart.setDate(prevStart.getDate() - 2);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(prevEnd.getDate() - 2);
      prevEnd.setHours(23, 59, 59, 999);
      bucketType = 'hour';
      break;
    }

    case '7d': {
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 6);
      prevStart.setHours(0, 0, 0, 0);
      bucketType = 'day';
      break;
    }

    case 'this_month': {
      currentStart.setDate(1);
      currentStart.setHours(0, 0, 0, 0);

      const daysInCurrentSpan = Math.max(1, Math.ceil((now - currentStart) / (1000 * 60 * 60 * 24)));
      
      prevStart = new Date(currentStart);
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd = new Date(prevStart);
      prevEnd.setDate(prevEnd.getDate() + daysInCurrentSpan);
      bucketType = 'day';
      break;
    }

    case 'last_month': {
      currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      bucketType = 'day';
      break;
    }

    case '3m': {
      currentStart.setDate(currentStart.getDate() - 89);
      currentStart.setHours(0, 0, 0, 0);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 89);
      prevStart.setHours(0, 0, 0, 0);
      bucketType = 'week';
      break;
    }

    case '6m': {
      currentStart.setDate(currentStart.getDate() - 179);
      currentStart.setHours(0, 0, 0, 0);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 179);
      prevStart.setHours(0, 0, 0, 0);
      bucketType = 'month';
      break;
    }

    case '1y':
    case 'this_year': {
      currentStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

      prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
      bucketType = 'month';
      break;
    }

    case 'custom': {
      if (customStart && customEnd) {
        currentStart = new Date(customStart);
        currentEnd = new Date(customEnd);
        currentEnd.setHours(23, 59, 59, 999);

        const durationMs = currentEnd.getTime() - currentStart.getTime();
        prevEnd = new Date(currentStart.getTime() - 1);
        prevStart = new Date(prevEnd.getTime() - durationMs);
        
        const days = durationMs / (1000 * 60 * 60 * 24);
        bucketType = days > 90 ? 'month' : days > 21 ? 'week' : 'day';
      }
      break;
    }

    case '30d':
    default: {
      currentStart.setDate(currentStart.getDate() - 29);
      currentStart.setHours(0, 0, 0, 0);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 29);
      prevStart.setHours(0, 0, 0, 0);
      bucketType = 'day';
      break;
    }
  }

  return {
    currentStart: currentStart.toISOString(),
    currentEnd: currentEnd.toISOString(),
    prevStart: prevStart.toISOString(),
    prevEnd: prevEnd.toISOString(),
    bucketType,
  };
}

/**
 * Aggregates core KPI statistics for a given list of orders.
 */
export function aggregateOrderMetrics(orders = []) {
  let totalSalesOrders = 0;
  let totalRevenue = 0;
  let paidOrdersCount = 0;
  let unpaidOrdersCount = 0;
  let productsSoldUnits = 0;

  for (const order of orders) {
    const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
    const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';
    const isFailed = (order.paymentStatus || '').toLowerCase() === 'failed';

    totalSalesOrders += 1;

    if (isPaid && !isCancelled) {
      paidOrdersCount += 1;
      totalRevenue += Number(order.totalAmount || order.subtotal || 0);

      const items = order.products || [];
      for (const item of items) {
        productsSoldUnits += Number(item.quantity || 1);
      }
    } else {
      unpaidOrdersCount += 1;
    }
  }

  const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

  return {
    totalSalesOrders,
    totalRevenue,
    paidOrdersCount,
    unpaidOrdersCount,
    productsSoldUnits,
    averageOrderValue,
  };
}

/**
 * Builds time-series trend data for revenue and orders.
 */
export function generateTimeSeriesBuckets(orders = [], startIso, endIso, bucketType = 'day') {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const buckets = [];
  const bucketMap = new Map();

  if (bucketType === 'day') {
    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toISOString().split('T')[0];
      const label = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const item = { key, label, revenue: 0, orders: 0, paidOrders: 0, units: 0 };
      bucketMap.set(key, item);
      buckets.push(item);
      cur.setDate(cur.getDate() + 1);
    }
  } else if (bucketType === 'month') {
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      const label = cur.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const item = { key, label, revenue: 0, orders: 0, paidOrders: 0, units: 0 };
      bucketMap.set(key, item);
      buckets.push(item);
      cur.setMonth(cur.getMonth() + 1);
    }
  } else {
    // Weekly
    const cur = new Date(start);
    let weekIndex = 1;
    while (cur <= end) {
      const key = cur.toISOString().split('T')[0];
      const label = `W${weekIndex} (${cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      const item = { key, label, revenue: 0, orders: 0, paidOrders: 0, units: 0 };
      bucketMap.set(key, item);
      buckets.push(item);
      cur.setDate(cur.getDate() + 7);
      weekIndex += 1;
    }
  }

  // Populate buckets from orders
  for (const order of orders) {
    if (!order.orderDate) continue;
    const oDate = new Date(order.orderDate);
    if (oDate < start || oDate > end) continue;

    let key;
    if (bucketType === 'day') {
      key = oDate.toISOString().split('T')[0];
    } else if (bucketType === 'month') {
      key = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // Find nearest week bucket
      let matchedKey = buckets[0]?.key;
      for (const b of buckets) {
        if (new Date(b.key) <= oDate) {
          matchedKey = b.key;
        } else {
          break;
        }
      }
      key = matchedKey;
    }

    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.orders += 1;
      const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
      const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';

      if (isPaid && !isCancelled) {
        bucket.paidOrders += 1;
        bucket.revenue += Number(order.totalAmount || order.subtotal || 0);
        for (const item of (order.products || [])) {
          bucket.units += Number(item.quantity || 1);
        }
      }
    }
  }

  return buckets;
}

/**
 * Computes comparative Weekly Growth (Current 7 Days vs Prior 7 Days).
 */
export function computeWeeklyGrowth(allOrders = []) {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(currentWeekStart.getDate() - 6);
  currentWeekStart.setHours(0, 0, 0, 0);

  const prevWeekEnd = new Date(currentWeekStart);
  prevWeekEnd.setMilliseconds(-1);
  const prevWeekStart = new Date(prevWeekEnd);
  prevWeekStart.setDate(prevWeekStart.getDate() - 6);
  prevWeekStart.setHours(0, 0, 0, 0);

  const currentOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate);
    return d >= currentWeekStart && d <= now;
  });

  const prevOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate);
    return d >= prevWeekStart && d <= prevWeekEnd;
  });

  const currentMetrics = aggregateOrderMetrics(currentOrders);
  const prevMetrics = aggregateOrderMetrics(prevOrders);

  return {
    periodLabel: 'Current Week vs Previous Week',
    revenue: {
      current: currentMetrics.totalRevenue,
      previous: prevMetrics.totalRevenue,
      growth: calculateGrowth(currentMetrics.totalRevenue, prevMetrics.totalRevenue),
    },
    orders: {
      current: currentMetrics.totalSalesOrders,
      previous: prevMetrics.totalSalesOrders,
      growth: calculateGrowth(currentMetrics.totalSalesOrders, prevMetrics.totalSalesOrders),
    },
    productsSold: {
      current: currentMetrics.productsSoldUnits,
      previous: prevMetrics.productsSoldUnits,
      growth: calculateGrowth(currentMetrics.productsSoldUnits, prevMetrics.productsSoldUnits),
    },
    paidOrders: {
      current: currentMetrics.paidOrdersCount,
      previous: prevMetrics.paidOrdersCount,
      growth: calculateGrowth(currentMetrics.paidOrdersCount, prevMetrics.paidOrdersCount),
    },
    unpaidOrders: {
      current: currentMetrics.unpaidOrdersCount,
      previous: prevMetrics.unpaidOrdersCount,
      growth: calculateGrowth(currentMetrics.unpaidOrdersCount, prevMetrics.unpaidOrdersCount, true),
    },
  };
}

/**
 * Computes comparative Monthly Growth (Current Month to Date vs Previous Month).
 */
export function computeMonthlyGrowth(allOrders = []) {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const currentOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate);
    return d >= currentMonthStart && d <= now;
  });

  const prevOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  const currentMetrics = aggregateOrderMetrics(currentOrders);
  const prevMetrics = aggregateOrderMetrics(prevOrders);

  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonthName = prevMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    currentMonthName,
    prevMonthName,
    periodLabel: `${currentMonthName} vs ${prevMonthName}`,
    revenue: {
      current: currentMetrics.totalRevenue,
      previous: prevMetrics.totalRevenue,
      growth: calculateGrowth(currentMetrics.totalRevenue, prevMetrics.totalRevenue),
    },
    orders: {
      current: currentMetrics.totalSalesOrders,
      previous: prevMetrics.totalSalesOrders,
      growth: calculateGrowth(currentMetrics.totalSalesOrders, prevMetrics.totalSalesOrders),
    },
    paidOrders: {
      current: currentMetrics.paidOrdersCount,
      previous: prevMetrics.paidOrdersCount,
      growth: calculateGrowth(currentMetrics.paidOrdersCount, prevMetrics.paidOrdersCount),
    },
    unpaidOrders: {
      current: currentMetrics.unpaidOrdersCount,
      previous: prevMetrics.unpaidOrdersCount,
      growth: calculateGrowth(currentMetrics.unpaidOrdersCount, prevMetrics.unpaidOrdersCount, true),
    },
    productsSold: {
      current: currentMetrics.productsSoldUnits,
      previous: prevMetrics.productsSoldUnits,
      growth: calculateGrowth(currentMetrics.productsSoldUnits, prevMetrics.productsSoldUnits),
    },
  };
}

/**
 * Computes Product Performance and Product Growth trajectories.
 */
export function computeProductPerformance(currentOrders = [], prevOrders = []) {
  const currentProductMap = new Map();
  const prevProductMap = new Map();

  // Aggregate current period
  for (const order of currentOrders) {
    const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
    const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';
    if (!isPaid || isCancelled) continue;

    for (const item of (order.products || [])) {
      const key = item.product?._ref || item.name || 'Unknown Product';
      if (!currentProductMap.has(key)) {
        currentProductMap.set(key, {
          id: item.product?._ref || key,
          name: item.name || 'Product',
          productCode: item.productCode || '',
          image: item.image || '',
          units: 0,
          revenue: 0,
          ordersCount: 0,
        });
      }
      const p = currentProductMap.get(key);
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      p.units += qty;
      p.revenue += price * qty;
      p.ordersCount += 1;
    }
  }

  // Aggregate previous period for trajectory comparison
  for (const order of prevOrders) {
    const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
    const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';
    if (!isPaid || isCancelled) continue;

    for (const item of (order.products || [])) {
      const key = item.product?._ref || item.name || 'Unknown Product';
      if (!prevProductMap.has(key)) {
        prevProductMap.set(key, { units: 0, revenue: 0 });
      }
      const p = prevProductMap.get(key);
      p.units += Number(item.quantity || 1);
      p.revenue += Number(item.price || 0) * Number(item.quantity || 1);
    }
  }

  const allProductsList = Array.from(currentProductMap.values()).map((p) => {
    const prev = prevProductMap.get(p.id) || { units: 0, revenue: 0 };
    const unitsGrowth = calculateGrowth(p.units, prev.units);
    const revenueGrowth = calculateGrowth(p.revenue, prev.revenue);

    return {
      ...p,
      prevUnits: prev.units,
      prevRevenue: prev.revenue,
      unitsGrowth,
      revenueGrowth,
      growthRate: revenueGrowth.value,
      avgPrice: p.units > 0 ? p.revenue / p.units : 0,
    };
  });

  // Best by Units
  const bestByUnits = [...allProductsList].sort((a, b) => b.units - a.units);
  // Best by Revenue
  const bestByRevenue = [...allProductsList].sort((a, b) => b.revenue - a.revenue);

  // Top Growing Products (positive growth with prior history or strong new volume)
  const growingProducts = [...allProductsList]
    .filter((p) => p.revenueGrowth.status === 'positive' || (p.prevUnits === 0 && p.units >= 2))
    .sort((a, b) => b.revenueGrowth.value - a.revenueGrowth.value);

  // Top Declining Products (negative growth)
  const decliningProducts = [...allProductsList]
    .filter((p) => p.revenueGrowth.status === 'negative')
    .sort((a, b) => a.revenueGrowth.value - b.revenueGrowth.value);

  return {
    bestByUnits,
    bestByRevenue,
    growingProducts: growingProducts.slice(0, 5),
    decliningProducts: decliningProducts.slice(0, 5),
    totalUniqueProductsSold: allProductsList.length,
  };
}

/**
 * Computes Order Status distribution and Paid vs Unpaid conversion ratio.
 */
export function computeStatusAndPaymentAnalytics(orders = []) {
  const statusCounts = {
    Delivered: 0,
    Shipped: 0,
    'Out for Delivery': 0,
    Packed: 0,
    Processing: 0,
    Confirmed: 0,
    Pending: 0,
    Cancelled: 0,
  };

  let paidCount = 0;
  let unpaidCount = 0;
  let totalRevenue = 0;

  for (const order of orders) {
    const status = order.orderStatus || 'Pending';
    if (statusCounts[status] !== undefined) {
      statusCounts[status] += 1;
    } else {
      statusCounts.Pending += 1;
    }

    const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
    const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';

    if (isPaid && !isCancelled) {
      paidCount += 1;
      totalRevenue += Number(order.totalAmount || order.subtotal || 0);
    } else {
      unpaidCount += 1;
    }
  }

  const totalOrders = orders.length;
  const paidPercentage = totalOrders > 0 ? Number(((paidCount / totalOrders) * 100).toFixed(1)) : 0;
  const unpaidPercentage = totalOrders > 0 ? Number(((unpaidCount / totalOrders) * 100).toFixed(1)) : 0;

  return {
    orderStatusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? Number(((count / totalOrders) * 100).toFixed(1)) : 0,
    })),
    paymentAnalytics: {
      paidCount,
      unpaidCount,
      totalOrders,
      paidPercentage,
      unpaidPercentage,
      totalRevenue,
    },
  };
}

/**
 * Computes Multi-Dealer performance rankings.
 */
export function computeDealerPerformance(orders = [], dealers = []) {
  const dealersMap = new Map();

  dealers.forEach((d) => {
    dealersMap.set(d._id, {
      id: d._id,
      name: d.name || 'Dealer',
      businessName: d.businessName || '',
      whatsapp: d.whatsapp || '',
      status: d.status || 'active',
      ordersCount: 0,
      revenue: 0,
      unitsSold: 0,
    });
  });

  const orderDealerSet = new Map(); // tracks unique orders per dealer

  for (const order of orders) {
    const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
    const isCancelled = (order.orderStatus || '').toLowerCase() === 'cancelled';
    if (!isPaid || isCancelled) continue;

    for (const item of (order.products || [])) {
      const dealerId = item.dealer?._ref;
      if (!dealerId) continue;

      if (!dealersMap.has(dealerId)) {
        dealersMap.set(dealerId, {
          id: dealerId,
          name: item.dealerName || 'Dealer',
          businessName: '',
          whatsapp: '',
          status: 'active',
          ordersCount: 0,
          revenue: 0,
          unitsSold: 0,
        });
      }

      const dealerData = dealersMap.get(dealerId);
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);

      dealerData.unitsSold += qty;
      dealerData.revenue += price * qty;

      const orderKey = `${order.orderId || order._id}_${dealerId}`;
      if (!orderDealerSet.has(orderKey)) {
        orderDealerSet.set(orderKey, true);
        dealerData.ordersCount += 1;
      }
    }
  }

  const dealerList = Array.from(dealersMap.values()).filter((d) => d.ordersCount > 0 || d.unitsSold > 0 || d.revenue > 0);
  dealerList.sort((a, b) => b.revenue - a.revenue);

  return dealerList;
}

/**
 * Master Analytics Compiler
 */
export function compileDashboardAnalytics({
  orders = [],
  dealers = [],
  rangeKey = '30d',
  customStart = null,
  customEnd = null,
}) {
  const boundaries = getDateRangeBoundaries(rangeKey, customStart, customEnd);
  const { currentStart, currentEnd, prevStart, prevEnd, bucketType } = boundaries;

  const cStart = new Date(currentStart);
  const cEnd = new Date(currentEnd);
  const pStart = new Date(prevStart);
  const pEnd = new Date(prevEnd);

  // Filter orders by date ranges
  const currentPeriodOrders = orders.filter((o) => {
    if (!o.orderDate) return false;
    const d = new Date(o.orderDate);
    return d >= cStart && d <= cEnd;
  });

  const prevPeriodOrders = orders.filter((o) => {
    if (!o.orderDate) return false;
    const d = new Date(o.orderDate);
    return d >= pStart && d <= pEnd;
  });

  // 1. Core KPIs
  const currentKPIs = aggregateOrderMetrics(currentPeriodOrders);
  const prevKPIs = aggregateOrderMetrics(prevPeriodOrders);

  const kpis = {
    totalSales: {
      value: currentKPIs.totalSalesOrders,
      growth: calculateGrowth(currentKPIs.totalSalesOrders, prevKPIs.totalSalesOrders),
    },
    totalRevenue: {
      value: currentKPIs.totalRevenue,
      growth: calculateGrowth(currentKPIs.totalRevenue, prevKPIs.totalRevenue),
    },
    paidOrders: {
      value: currentKPIs.paidOrdersCount,
      growth: calculateGrowth(currentKPIs.paidOrdersCount, prevKPIs.paidOrdersCount),
    },
    unpaidOrders: {
      value: currentKPIs.unpaidOrdersCount,
      growth: calculateGrowth(currentKPIs.unpaidOrdersCount, prevKPIs.unpaidOrdersCount, true),
    },
    productsSold: {
      value: currentKPIs.productsSoldUnits,
      growth: calculateGrowth(currentKPIs.productsSoldUnits, prevKPIs.productsSoldUnits),
    },
    averageOrderValue: {
      value: Number(currentKPIs.averageOrderValue.toFixed(2)),
      growth: calculateGrowth(currentKPIs.averageOrderValue, prevKPIs.averageOrderValue),
    },
  };

  // 2. Revenue Time Series
  const revenueChart = generateTimeSeriesBuckets(
    currentPeriodOrders,
    currentStart,
    currentEnd,
    bucketType
  );

  // 3. Weekly & Monthly Comparisons
  const weeklyGrowth = computeWeeklyGrowth(orders);
  const monthlyGrowth = computeMonthlyGrowth(orders);

  // 4. Product Performance & Growth
  const productAnalytics = computeProductPerformance(currentPeriodOrders, prevPeriodOrders);

  // 5. Order Status & Payment Breakdown
  const statusAndPayment = computeStatusAndPaymentAnalytics(currentPeriodOrders);

  // 6. Dealer Performance
  const dealerPerformance = computeDealerPerformance(currentPeriodOrders, dealers);

  return {
    range: {
      key: rangeKey,
      currentStart,
      currentEnd,
      prevStart,
      prevEnd,
      bucketType,
    },
    kpis,
    revenueChart,
    weeklyGrowth,
    monthlyGrowth,
    productAnalytics,
    statusAndPayment,
    dealerPerformance,
    totalHistoricalOrders: orders.length,
    hasData: currentPeriodOrders.length > 0 || orders.length > 0,
  };
}
