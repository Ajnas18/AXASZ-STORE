import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Input sanitization helper to strip HTML tags
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 10 order creation attempts per 5 minutes per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`orders-post-${ip}`, 10, 5 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { formData, cart, subtotal, discount, totalAmount } = body;

    // 2. Input Structure Validation
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid shipping details structure' }, { status: 400 });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart must be a non-empty list of products' }, { status: 400 });
    }

    if (
      typeof subtotal !== 'number' || 
      typeof discount !== 'number' || 
      typeof totalAmount !== 'number'
    ) {
      return NextResponse.json({ error: 'Price fields must be valid numbers' }, { status: 400 });
    }

    // 3. Shipping Fields & Format Validation
    const firstName = sanitizeString(formData.firstName);
    const lastName = sanitizeString(formData.lastName);
    const email = sanitizeString(formData.email).toLowerCase();
    const phone = sanitizeString(formData.phone);
    const streetAddress = sanitizeString(formData.streetAddress);
    const city = sanitizeString(formData.city);
    const postalCode = sanitizeString(formData.postalCode);
    const country = sanitizeString(formData.country);

    if (
      !firstName || !lastName || !email || !phone || 
      !streetAddress || !city || !postalCode || !country
    ) {
      return NextResponse.json({ error: 'Missing required shipping fields' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // 4. Cart Integrity Verification & Price Validation
    const productIds = cart.map(item => item._id || item.id).filter(Boolean);
    if (productIds.length !== cart.length) {
      return NextResponse.json({ error: 'Some items in the cart are missing IDs' }, { status: 400 });
    }

    // Fetch live product data from Sanity
    const dbProducts = await client.fetch(
      `*[_type == "product" && _id in $productIds]{ _id, price, name }`,
      { productIds }
    );

    const priceMap = {};
    dbProducts.forEach(product => {
      priceMap[product._id] = product.price;
    });

    let computedSubtotal = 0;
    for (const item of cart) {
      const id = item._id || item.id;
      const dbPrice = priceMap[id];
      if (dbPrice === undefined) {
        return NextResponse.json({ error: `Product not found: ${item.name || id}` }, { status: 400 });
      }
      computedSubtotal += dbPrice * item.quantity;
    }

    // Prevent Price Tampering
    if (discount !== 0) {
      return NextResponse.json({ error: 'Discounts are not currently supported' }, { status: 400 });
    }

    if (Math.abs(subtotal - computedSubtotal) > 0.01) {
      return NextResponse.json({ error: 'Order subtotal mismatch' }, { status: 400 });
    }

    if (Math.abs(totalAmount - computedSubtotal) > 0.01) {
      return NextResponse.json({ error: 'Order total amount mismatch' }, { status: 400 });
    }

    // Check for logged-in user
    const session = await getSession();
    let customerRef = undefined;
    
    if (session && session.customerId) {
      customerRef = {
        _type: 'reference',
        _ref: session.customerId,
      };
    }

    // Format products for Sanity
    const formattedProducts = cart.map(item => ({
      _key: uuidv4(),
      product: {
        _type: 'reference',
        _ref: item._id || item.id,
      },
      name: item.name,
      productCode: item.productCode ? sanitizeString(item.productCode) : '',
      size: item.selectedSize ? sanitizeString(item.selectedSize) : '',
      quantity: item.quantity,
      price: priceMap[item._id || item.id], // Use database verified price
      image: item.image ? sanitizeString(item.image) : '',
    }));

    const orderId = `ORD-${Date.now()}`;

    // Create order in Sanity
    const newOrder = await client.create({
      _type: 'order',
      orderId,
      customer: customerRef,
      orderDate: new Date().toISOString(),
      shippingAddress: {
        firstName,
        lastName,
        email,
        phone,
        streetAddress,
        city,
        postalCode,
        country,
      },
      products: formattedProducts,
      subtotal: computedSubtotal,
      discount: 0,
      totalAmount: computedSubtotal,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
    });

    return NextResponse.json({ success: true, orderId: newOrder.orderId });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // 1. Rate Limiting: Max 30 GET requests per minute per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`orders-get-${ip}`, 30, 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many requests. Please wait before refreshing.` },
        { status: 429 }
      );
    }

    const session = await getSession();
    
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders for this customer
    const orders = await client.fetch(
      `*[_type == "order" && customer._ref == $customerId] | order(orderDate desc) {
        _id,
        orderId,
        orderDate,
        totalAmount,
        paymentStatus,
        orderStatus,
        products
      }`,
      { customerId: session.customerId }
    );

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
