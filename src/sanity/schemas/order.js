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
        { name: 'fullName', title: 'Full Name', type: 'string' },
        { name: 'firstName', title: 'First Name', type: 'string' },
        { name: 'lastName', title: 'Last Name', type: 'string' },
        { name: 'email', title: 'Email Address', type: 'string' },
        { name: 'phone', title: 'Mobile / Phone', type: 'string' },
        { name: 'houseBuilding', title: 'House / Building Name', type: 'string' },
        { name: 'streetLocality', title: 'Street / Locality', type: 'string' },
        { name: 'streetAddress', title: 'Complete Street Address', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'state', title: 'State', type: 'string' },
        { name: 'postalCode', title: 'Postal / PIN Code', type: 'string' },
        { name: 'landmark', title: 'Landmark (Optional)', type: 'string' },
        { name: 'country', title: 'Country', type: 'string' },
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
            { name: 'variantId', title: 'Variant ID / SKU', type: 'string' },
            { name: 'color', title: 'Color Variant', type: 'string' },
            { name: 'size', type: 'string' },
            { name: 'quantity', type: 'number' },
            { name: 'price', type: 'number' },
            { name: 'image', type: 'string' },
          ],
          preview: {
            select: {
              title: 'name',
              color: 'color',
              size: 'size',
              quantity: 'quantity',
              price: 'price',
              dealerName: 'dealerName',
            },
            prepare(selection) {
              const { title, color, size, quantity, price, dealerName } = selection;
              const dealerLabel = dealerName ? `Dealer: ${dealerName}` : 'No Dealer';
              const colorLabel = color ? ` [${color}]` : '';
              return {
                title: `${title || 'Product'}${colorLabel}`,
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
      name: 'shippingCharge',
      title: 'Shipping Charge',
      type: 'number',
      initialValue: 0,
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
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'INR',
    },
    {
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      initialValue: 'Razorpay',
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
      name: 'paidAt',
      title: 'Payment Timestamp',
      type: 'datetime',
    },
    {
      name: 'razorpayOrderId',
      title: 'Razorpay Order ID',
      type: 'string',
      description: 'Razorpay generated order identifier (e.g. order_xxx)',
    },
    {
      name: 'razorpayPaymentId',
      title: 'Razorpay Payment ID',
      type: 'string',
      description: 'Razorpay confirmed transaction ID (e.g. pay_xxx)',
    },
    {
      name: 'razorpaySignature',
      title: 'Razorpay Payment Signature',
      type: 'string',
      readOnly: true,
      description: 'HMAC SHA256 signature verified server-side',
    },
    {
      name: 'orderStatus',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Confirmation', value: 'Pending Confirmation' },
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
      name: 'policyConsent',
      title: 'Policy Consent Status',
      type: 'boolean',
      description: 'Whether the customer explicitly accepted Terms, Privacy, Refund, Cancellation & Shipping policies before payment',
      initialValue: false,
    },
    {
      name: 'policyConsentAt',
      title: 'Policy Consent Timestamp',
      type: 'datetime',
      description: 'Exact timestamp when customer accepted store policies',
    },
    {
      name: 'policyVersions',
      title: 'Policy Versions Accepted',
      type: 'object',
      fields: [
        { name: 'terms', title: 'Terms & Conditions Version', type: 'string', initialValue: '1.0' },
        { name: 'privacy', title: 'Privacy Policy Version', type: 'string', initialValue: '1.0' },
        { name: 'cancellation', title: 'Cancellation Policy Version', type: 'string', initialValue: '1.0' },
        { name: 'refund', title: 'Refund Policy Version', type: 'string', initialValue: '1.0' },
        { name: 'shipping', title: 'Shipping & Delivery Policy Version', type: 'string', initialValue: '1.0' },
      ],
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
      razorpayPaymentId: 'razorpayPaymentId',
      totalAmount: 'totalAmount',
      needsAttention: 'needsAdminAttention',
    },
    prepare(selection) {
      const { title, orderStatus, paymentStatus, razorpayPaymentId, totalAmount, needsAttention } = selection;
      const attentionTag = needsAttention ? ' ⚠️ [NEEDS ATTENTION]' : '';
      const payIdTag = razorpayPaymentId ? ` | PayID: ${razorpayPaymentId}` : '';
      return {
        title: `#${title || 'Order'}${attentionTag}`,
        subtitle: `Payment: ${paymentStatus || 'Pending'}${payIdTag} | Status: ${orderStatus || 'Pending'} | ₹${totalAmount || 0}`,
      };
    },
  },
};
