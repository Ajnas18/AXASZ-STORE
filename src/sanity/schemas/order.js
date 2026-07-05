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
            { name: 'name', type: 'string' },
            { name: 'productCode', type: 'string' },
            { name: 'size', type: 'string' },
            { name: 'quantity', type: 'number' },
            { name: 'price', type: 'number' },
            { name: 'image', type: 'string' }, // Store image URL or Sanity image reference
          ],
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
        list: ['Pending', 'Paid', 'Failed', 'Refunded'],
      },
      initialValue: 'Pending',
    },
    {
      name: 'orderStatus',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          'Pending',
          'Confirmed',
          'Packed',
          'Shipped',
          'Out for Delivery',
          'Delivered',
          'Cancelled',
        ],
      },
      initialValue: 'Pending',
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
      subtitle: 'orderStatus',
    },
  },
};
