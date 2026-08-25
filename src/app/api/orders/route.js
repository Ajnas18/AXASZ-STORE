import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { computeOrderRouting } from '@/lib/orderRouting';
import { getRazorpayClient } from '@/lib/razorpay';

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
    const { 
      formData, 
      cart, 
      subtotal, 
      discount, 
      totalAmount, 
      policyConsent, 
      policyConsentAt, 
      policyVersions,
      actionType = 'pay_now'
    } = body;

    // 2. Policy Consent Validation
    if (policyConsent !== true) {
      return NextResponse.json(
        { error: 'Please accept the Terms & Conditions and store policies before continuing.' },
        { status: 400 }
      );
    }

    // 3. Input Structure Validation
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

    // 4. Address Fields & Format Validation
    const fullName = sanitizeString(formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim());
    const email = sanitizeString(formData.email).toLowerCase();
    const phone = sanitizeString(formData.phone || formData.mobileNumber);
    const houseBuilding = sanitizeString(formData.houseBuilding);
    const streetLocality = sanitizeString(formData.streetLocality || formData.streetAddress);
    const city = sanitizeString(formData.city);
    const state = sanitizeString(formData.state);
    const postalCode = sanitizeString(formData.postalCode || formData.pincode);
    const landmark = sanitizeString(formData.landmark || '');
    const country = sanitizeString(formData.country || 'India');

    // Split name for backward compatibility if needed
    const nameParts = fullName.split(' ');
    const firstName = sanitizeString(formData.firstName || nameParts[0] || fullName);
    const lastName = sanitizeString(formData.lastName || nameParts.slice(1).join(' ') || '');

    // Full composite street address
    const streetAddress = sanitizeString(
      formData.streetAddress || 
      [houseBuilding, streetLocality, landmark ? `Landmark: ${landmark}` : ''].filter(Boolean).join(', ')
    );

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name (minimum 2 characters)' }, { status: 400 });
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!houseBuilding) {
      return NextResponse.json({ error: 'Please enter house / building name' }, { status: 400 });
    }

    if (!streetLocality) {
      return NextResponse.json({ error: 'Please enter street / locality' }, { status: 400 });
    }

    if (!city) {
      return NextResponse.json({ error: 'Please enter city' }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ error: 'Please enter state' }, { status: 400 });
    }

    if (!postalCode || !/^[1-9][0-9]{5}$/.test(postalCode.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit PIN / postal code' }, { status: 400 });
    }

    // 5. Cart Integrity Verification & Price Validation
    const productIds = cart.map(item => item._id || item.id).filter(Boolean);
    if (productIds.length !== cart.length) {
      return NextResponse.json({ error: 'Some items in the cart are missing IDs' }, { status: 400 });
    }

    // Fetch live product data including assigned dealers from Sanity
    const dbProducts = await client.fetch(
      `*[_type == "product" && _id in $productIds]{
        _id,
        price,
        name,
        productCode,
        dealer->{
          _id,
          name,
          businessName,
          whatsapp,
          phone,
          status
        }
      }`,
      { productIds }
    );

    const productMap = {};
    const dealersMap = {};

    dbProducts.forEach(product => {
      productMap[product._id] = product;
      if (product.dealer && product.dealer._id) {
        dealersMap[product.dealer._id] = product.dealer;
      }
    });

    let computedSubtotal = 0;
    for (const item of cart) {
      const id = item._id || item.id;
      const dbProduct = productMap[id];
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.name || id}` }, { status: 400 });
      }
      computedSubtotal += dbProduct.price * item.quantity;
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

    // Format products for Sanity with dealer references
    const formattedProducts = cart.map(item => {
      const id = item._id || item.id;
      const dbProduct = productMap[id];
      const dealer = dbProduct?.dealer;

      return {
        _key: uuidv4(),
        product: {
          _type: 'reference',
          _ref: id,
        },
        dealer: dealer?._id ? {
          _type: 'reference',
          _ref: dealer._id,
        } : undefined,
        dealerName: dealer?.name || dealer?.businessName || '',
        name: item.name,
        productCode: item.productCode ? sanitizeString(item.productCode) : (dbProduct?.productCode || ''),
        variantId: item.variantId ? sanitizeString(item.variantId) : '',
        color: item.selectedColor ? sanitizeString(item.selectedColor) : '',
        size: item.selectedSize ? sanitizeString(item.selectedSize) : '',
        quantity: item.quantity,
        price: dbProduct.price, // Use database verified price
        image: item.image ? sanitizeString(item.image) : '',
      };
    });

    const orderId = `ORD-${Date.now()}`;
    const initialOrderStatus = actionType === 'connect_store' ? 'Pending Confirmation' : 'Pending';

    // 6. Create Razorpay order ONLY if actionType is 'pay_now'
    let razorpayOrder = null;
    if (actionType === 'pay_now') {
      try {
        const razorpay = getRazorpayClient();
        const amountInPaise = Math.round(computedSubtotal * 100);
        
        razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            orderId,
            customerName: `${firstName} ${lastName}`,
            customerEmail: email,
            customerPhone: phone,
          },
        });
      } catch (rzpErr) {
        console.error('Razorpay Order Creation Error:', rzpErr);
        return NextResponse.json(
          { 
            error: rzpErr.message || 'Payment gateway initialization failed. Please check server Razorpay credentials.' 
          }, 
          { status: 502 }
        );
      }
    }

    // Compute initial routing
    const shippingAddressObj = {
      fullName,
      firstName,
      lastName,
      email,
      phone,
      houseBuilding,
      streetLocality,
      streetAddress,
      city,
      state,
      postalCode,
      landmark,
      country,
    };

    const {
      dealerNotifications,
      adminNotification,
      needsAdminAttention,
      attentionReason,
    } = computeOrderRouting({
      order: {
        orderId,
        paymentStatus: 'Pending',
        orderStatus: initialOrderStatus,
        shippingAddress: shippingAddressObj,
        products: formattedProducts,
        subtotal: computedSubtotal,
        totalAmount: computedSubtotal,
      },
      dealersMap,
    });

    const acceptedVersions = policyVersions || {
      terms: '1.0',
      privacy: '1.0',
      cancellation: '1.0',
      refund: '1.0',
      shipping: '1.0',
    };

    // Create order in Sanity
    const newOrder = await client.create({
      _type: 'order',
      orderId,
      customer: customerRef,
      orderDate: new Date().toISOString(),
      shippingAddress: shippingAddressObj,
      products: formattedProducts,
      subtotal: computedSubtotal,
      shippingCharge: 0,
      discount: 0,
      totalAmount: computedSubtotal,
      currency: 'INR',
      paymentMethod: 'Razorpay',
      paymentStatus: 'Pending',
      orderStatus: initialOrderStatus,
      policyConsent: true,
      policyConsentAt: policyConsentAt || new Date().toISOString(),
      policyVersions: acceptedVersions,
      razorpayOrderId: razorpayOrder?.id || undefined,
      dealerNotifications: dealerNotifications || [],
      adminNotification: adminNotification || undefined,
      needsAdminAttention,
      attentionReason,
    });

    if (actionType === 'connect_store') {
      return NextResponse.json({
        success: true,
        actionType: 'connect_store',
        orderId: newOrder.orderId,
        orderDocId: newOrder._id,
        orderStatus: 'Pending Confirmation',
        totalAmount: computedSubtotal,
        itemCount: formattedProducts.length,
        customer: {
          name: `${firstName} ${lastName}`,
          email,
          phone,
        },
        adminWhatsappUrl: adminNotification?.whatsappUrl || '',
      });
    }

    return NextResponse.json({
      success: true,
      actionType: 'pay_now',
      orderId: newOrder.orderId,
      orderDocId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency || 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
      },
      adminWhatsappUrl: adminNotification?.whatsappUrl || '',
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
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
