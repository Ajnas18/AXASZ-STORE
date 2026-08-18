export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'Order ID',
      type: 'string',
    },
    {
      name: 'customer',
      title: 'Customer',
      type: 'reference',
      to: [{ type: 'customer' }],
    },
    {
      name: 'orderDate',
      title: 'Order Date',
      type: 'datetime',
    },
    {
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'streetAddress', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'postalCode', type: 'string' },
        { name: 'country', type: 'string' },
      ],
    },
    {
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'product', type: 'reference', to: [{ type: 'product' }] },
            { name: 'dealer', title: 'Assigned Dealer', type: 'reference', to: [{ type: 'dealer' }] },
            { name: 'dealerName', title: 'Dealer Name Snapshot', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'productCode', type: 'string' },
            { name: 'size', type: 'string' },
            { name: 'quantity', type: 'number' },
            { name: 'price', type: 'number' },
            { name: 'image', type: 'string' },
          ],
          preview: {
            select: {
              title: 'name',
              size: 'size',
              quantity: 'quantity',
              price: 'price',
              dealerName: 'dealerName',
            },
            prepare(selection) {
              const { title, size, quantity, price, dealerName } = selection;
              const dealerLabel = dealerName ? `Dealer: ${dealerName}` : 'No Dealer';
              return {
                title: title || 'Product',
                subtitle: `Qty: ${quantity || 1} | Size: ${size || 'N/A'} | ₹${price || 0} | [${dealerLabel}]`,
              };
            },
          },
        },
      ],
    },
    {
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
    },
    {
      name: 'discount',
      title: 'Discount',
      type: 'number',
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
    },
    {
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'Pending' },
          { title: 'Paid', value: 'Paid' },
          { title: 'Failed', value: 'Failed' },
          { title: 'Cancelled', value: 'Cancelled' },
          { title: 'Refunded', value: 'Refunded' },
        ],
      },
      initialValue: 'Pending',
    },
    {
      name: 'orderStatus',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'Pending' },
          { title: 'Confirmed', value: 'Confirmed' },
          { title: 'Processing', value: 'Processing' },
          { title: 'Packed', value: 'Packed' },
          { title: 'Shipped', value: 'Shipped' },
          { title: 'Out for Delivery', value: 'Out for Delivery' },
          { title: 'Delivered', value: 'Delivered' },
          { title: 'Cancelled', value: 'Cancelled' },
        ],
      },
      initialValue: 'Pending',
    },
    {
      name: 'dealerNotifications',
      title: 'Dealer WhatsApp Routing & Notifications',
      description: 'Tracking status of order routing to individual dealers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'dealer', title: 'Dealer', type: 'reference', to: [{ type: 'dealer' }] },
            { name: 'dealerName', title: 'Dealer Name', type: 'string' },
            { name: 'whatsappNumber', title: 'Dealer WhatsApp Number', type: 'string' },
            {
              name: 'status',
              title: 'Notification Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Not Sent', value: 'NOT_SENT' },
                  { title: 'Ready', value: 'READY' },
                  { title: 'WhatsApp Link Generated', value: 'WHATSAPP_LINK_GENERATED' },
                  { title: 'Sent via API', value: 'SENT' },
                  { title: 'Failed', value: 'FAILED' },
                ],
              },
              initialValue: 'READY',
            },
            { name: 'whatsappUrl', title: 'Generated WhatsApp URL', type: 'url' },
            { name: 'message', title: 'Message Content', type: 'text', rows: 4 },
            { name: 'sentAt', title: 'Timestamp', type: 'datetime' },
            { name: 'notes', title: 'Notes / API Response', type: 'string' },
          ],
          preview: {
            select: {
              dealerName: 'dealerName',
              whatsappNumber: 'whatsappNumber',
              status: 'status',
              sentAt: 'sentAt',
            },
            prepare(selection) {
              const { dealerName, whatsappNumber, status, sentAt } = selection;
              const statusEmoji =
                status === 'SENT' ? '✅' :
                status === 'WHATSAPP_LINK_GENERATED' ? '🔗' :
                status === 'READY' ? '⏳' :
                status === 'FAILED' ? '❌' : '⚪';
              return {
                title: `${statusEmoji} ${dealerName || 'Dealer'} (${whatsappNumber || 'No WA'})`,
                subtitle: `Status: ${status || 'NOT_SENT'}${sentAt ? ` • ${new Date(sentAt).toLocaleDateString()}` : ''}`,
              };
            },
          },
        },
      ],
    },
    {
      name: 'adminNotification',
      title: 'Admin WhatsApp Notification (Unpaid/Alerts)',
      type: 'object',
      fields: [
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              { title: 'Not Sent', value: 'NOT_SENT' },
              { title: 'Ready', value: 'READY' },
              { title: 'WhatsApp Link Generated', value: 'WHATSAPP_LINK_GENERATED' },
              { title: 'Sent via API', value: 'SENT' },
              { title: 'Failed', value: 'FAILED' },
            ],
          },
          initialValue: 'READY',
        },
        { name: 'whatsappUrl', title: 'WhatsApp Link', type: 'url' },
        { name: 'message', title: 'Admin Message', type: 'text', rows: 4 },
        { name: 'sentAt', title: 'Timestamp', type: 'datetime' },
      ],
    },
    {
      name: 'needsAdminAttention',
      title: 'Needs Admin Attention',
      type: 'boolean',
      description: 'Flagged if a product has no assigned dealer or requires manual intervention',
      initialValue: false,
    },
    {
      name: 'attentionReason',
      title: 'Attention Reason',
      type: 'string',
    },
    {
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'orderId',
      orderStatus: 'orderStatus',
      paymentStatus: 'paymentStatus',
      totalAmount: 'totalAmount',
      needsAttention: 'needsAdminAttention',
    },
    prepare(selection) {
      const { title, orderStatus, paymentStatus, totalAmount, needsAttention } = selection;
      const attentionTag = needsAttention ? ' ⚠️ [NEEDS ATTENTION]' : '';
      return {
        title: `#${title || 'Order'}${attentionTag}`,
        subtitle: `Payment: ${paymentStatus || 'Pending'} | Status: ${orderStatus || 'Pending'} | ₹${totalAmount || 0}`,
      };
    },
  },
};
