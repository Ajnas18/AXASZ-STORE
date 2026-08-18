/**
 * AXASZSTORE Order Routing & WhatsApp Notification Service
 * Handles multi-dealer order grouping, dynamic message generation,
 * phone number normalization, and notification state tracking.
 */

// Default store Admin WhatsApp number
export const DEFAULT_ADMIN_WHATSAPP =
  process.env.ADMIN_WHATSAPP_NUMBER ||
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER ||
  '918943029774';

/**
 * Normalizes a phone number to international digits-only format.
 * E.g., "+91 98765 43210" -> "919876543210", "9876543210" -> "919876543210"
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.replace(/[^0-9]/g, '');
  
  // Handle Indian phone numbers
  if (clean.length === 10) {
    clean = `91${clean}`;
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = `91${clean.slice(1)}`;
  }
  
  return clean;
}

/**
 * Builds a valid wa.me URL for the specified phone number and message.
 */
export function buildWhatsAppUrl(phoneNumber, message) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhone) return '';
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encoded}`;
}

/**
 * Formats a clean shipping address string from an order shipping address object.
 */
export function formatAddress(address) {
  if (!address) return 'Not provided';
  const parts = [
    address.streetAddress,
    address.city,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ') || 'Not provided';
}

/**
 * Generates the clean WhatsApp message for a Dealer when an order is PAID.
 */
export function generateDealerPaidMessage({ order, dealer, items }) {
  const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Customer';
  const customerPhone = order.shippingAddress?.phone || 'Not provided';
  const addressText = formatAddress(order.shippingAddress);
  const orderId = order.orderId || 'N/A';

  const dealerSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  let message = `NEW AXASZSTORE ORDER\n\n`;
  message += `Order ID: #${orderId}\n\n`;
  message += `Customer:\n${customerName}\nPhone: ${customerPhone}\n\n`;

  if (items.length === 1) {
    const item = items[0];
    const sizePart = item.size ? ` (Size: ${item.size})` : '';
    message += `Product:\n${item.name}${sizePart}\n\n`;
    message += `Quantity: ${item.quantity}\n`;
    message += `Price: ₹${item.price.toLocaleString('en-IN')}\n\n`;
    message += `Total: ₹${dealerSubtotal.toLocaleString('en-IN')}\n\n`;
  } else {
    message += `Products:\n`;
    items.forEach((item, idx) => {
      const sizePart = item.size ? ` - Size: ${item.size}` : '';
      message += `${idx + 1}. ${item.name}${sizePart} - Qty: ${item.quantity} - ₹${item.price.toLocaleString('en-IN')}\n`;
    });
    message += `\nTotal Quantity: ${totalQuantity}\n`;
    message += `Total: ₹${dealerSubtotal.toLocaleString('en-IN')}\n\n`;
  }

  message += `Payment: PAID\n\n`;
  message += `Delivery Address:\n${addressText}\n\n`;
  message += `Please process this order.`;

  return message;
}

/**
 * Generates the WhatsApp message for AXASZSTORE Admin when an order is UNPAID / PENDING / FAILED.
 */
export function generateAdminUnpaidMessage({ order, paymentStatus = 'UNPAID' }) {
  const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Customer';
  const customerPhone = order.shippingAddress?.phone || 'Not provided';
  const addressText = formatAddress(order.shippingAddress);
  const orderId = order.orderId || 'N/A';
  const items = order.products || [];
  const totalAmount = order.totalAmount || order.subtotal || 0;

  const normalizedStatus = (paymentStatus || 'UNPAID').toUpperCase();

  let message = `AXASZSTORE — PAYMENT NOT COMPLETED\n\n`;
  message += `Order ID: #${orderId}\n\n`;
  message += `Customer:\n${customerName}\nPhone: ${customerPhone}\n\n`;

  if (items.length === 1) {
    const item = items[0];
    const sizePart = item.size ? ` (Size: ${item.size})` : '';
    message += `Product:\n${item.name}${sizePart}\n\n`;
    message += `Quantity: ${item.quantity}\n\n`;
  } else {
    message += `Products:\n`;
    items.forEach((item, idx) => {
      const sizePart = item.size ? ` (Size: ${item.size})` : '';
      message += `${idx + 1}. ${item.name}${sizePart} - Qty: ${item.quantity}\n`;
    });
    message += `\n`;
  }

  message += `Amount: ₹${totalAmount.toLocaleString('en-IN')}\n\n`;
  message += `Payment Status:\n${normalizedStatus}\n\n`;
  message += `Customer Address:\n${addressText}\n\n`;
  message += `The customer did not complete payment.\nPlease follow up with the customer.`;

  return message;
}

/**
 * Generates an Admin Alert message when a PAID order has products with no assigned dealer.
 */
export function generateAdminUnassignedDealerMessage({ order, unassignedItems }) {
  const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Customer';
  const customerPhone = order.shippingAddress?.phone || 'Not provided';
  const addressText = formatAddress(order.shippingAddress);
  const orderId = order.orderId || 'N/A';

  let message = `⚠️ AXASZSTORE — PAID ORDER REQUIRES DEALER ATTENTION\n\n`;
  message += `Order ID: #${orderId}\n`;
  message += `Status: PAID (Manual Handling Needed)\n\n`;
  message += `Customer:\n${customerName}\nPhone: ${customerPhone}\n\n`;
  message += `The following paid items do not have an active dealer assigned:\n`;

  unassignedItems.forEach((item, idx) => {
    const sizePart = item.size ? ` (Size: ${item.size})` : '';
    message += `${idx + 1}. ${item.name}${sizePart} - Qty: ${item.quantity} - ₹${item.price.toLocaleString('en-IN')}\n`;
  });

  message += `\nDelivery Address:\n${addressText}\n\n`;
  message += `Please assign a dealer or fulfill manually in Sanity Admin.`;

  return message;
}

/**
 * Groups an order's products by their linked dealer.
 * Returns an array of groups: { dealer, items } and unassignedItems.
 */
export function groupOrderItemsByDealer(products = [], dealersMap = {}) {
  const dealerGroups = new Map();
  const unassignedItems = [];

  for (const item of products) {
    const dealerId = item.dealer?._ref || item.dealer?._id || item.dealerId;
    const dealerData = dealerId ? dealersMap[dealerId] : null;

    if (dealerData && dealerData.status !== 'inactive' && dealerData.whatsapp) {
      if (!dealerGroups.has(dealerData._id)) {
        dealerGroups.set(dealerData._id, {
          dealer: dealerData,
          items: [],
        });
      }
      dealerGroups.get(dealerData._id).items.push(item);
    } else {
      unassignedItems.push(item);
    }
  }

  return {
    groups: Array.from(dealerGroups.values()),
    unassignedItems,
  };
}

/**
 * Computes all routing data for an order:
 * - If Paid: routes to dealer(s) and creates admin alerts if any unassigned items.
 * - If Unpaid/Pending/Failed: routes to Admin WhatsApp for follow up.
 */
export function computeOrderRouting({ order, dealersMap = {}, adminWhatsapp = DEFAULT_ADMIN_WHATSAPP }) {
  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
  const products = order.products || [];

  const { groups, unassignedItems } = groupOrderItemsByDealer(products, dealersMap);

  const dealerNotifications = [];
  let adminNotification = null;
  let needsAdminAttention = false;
  let attentionReason = '';

  if (isPaid) {
    // Generate notification for each dealer group
    for (const group of groups) {
      const message = generateDealerPaidMessage({
        order,
        dealer: group.dealer,
        items: group.items,
      });
      const whatsappUrl = buildWhatsAppUrl(group.dealer.whatsapp, message);

      dealerNotifications.push({
        _key: `dealer_notif_${group.dealer._id}`,
        dealer: {
          _type: 'reference',
          _ref: group.dealer._id,
        },
        dealerName: group.dealer.name || group.dealer.businessName || 'Dealer',
        whatsappNumber: normalizePhoneNumber(group.dealer.whatsapp),
        status: 'READY',
        whatsappUrl,
        message,
        sentAt: null,
        notes: `Contains ${group.items.length} item(s)`,
      });
    }

    // If there are unassigned products in a PAID order, flag for admin attention
    if (unassignedItems.length > 0) {
      needsAdminAttention = true;
      attentionReason = `${unassignedItems.length} product(s) have no active dealer assigned.`;
      const adminAlertMsg = generateAdminUnassignedDealerMessage({ order, unassignedItems });
      const adminAlertUrl = buildWhatsAppUrl(adminWhatsapp, adminAlertMsg);

      adminNotification = {
        status: 'READY',
        whatsappUrl: adminAlertUrl,
        message: adminAlertMsg,
        sentAt: null,
      };
    }
  } else {
    // UNPAID / PENDING / FAILED: Route strictly to Admin WhatsApp
    const unpaidMsg = generateAdminUnpaidMessage({
      order,
      paymentStatus: order.paymentStatus || 'UNPAID',
    });
    const adminWaUrl = buildWhatsAppUrl(adminWhatsapp, unpaidMsg);

    adminNotification = {
      status: 'READY',
      whatsappUrl: adminWaUrl,
      message: unpaidMsg,
      sentAt: null,
    };
  }

  return {
    isPaid,
    dealerNotifications,
    adminNotification,
    needsAdminAttention,
    attentionReason,
    unassignedItemsCount: unassignedItems.length,
    dealerGroupsCount: groups.length,
  };
}
