import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { computeOrderRouting } from '@/lib/orderRouting';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 20 verification attempts per minute per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`payment-verify-${ip}`, 20, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many payment verification requests. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      orderId, 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      adminSecret 
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 2. Fetch the order from Sanity
    const order = await client.fetch(
      `*[_type == "order" && (orderId == $orderId || _id == $orderId || razorpayOrderId == $razorpayOrderId)][0]`,
      { orderId, razorpayOrderId: razorpayOrderId || '' }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Authorization / Security check
    const session = await getSession();
    const envAdminSecret = process.env.ADMIN_PASSWORD || process.env.SANITY_REVALIDATE_SECRET;
    const isAuthorizedAdmin = adminSecret && envAdminSecret && adminSecret === envAdminSecret;

    // If order has already been verified and marked as Paid (Idempotency)
    if (order.paymentStatus === 'Paid') {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        orderId: order.orderId,
        paymentStatus: 'Paid',
        razorpayPaymentId: order.razorpayPaymentId || razorpayPaymentId,
        message: 'Order payment is already verified and marked as Paid.',
      });
    }

    // Verify cryptographic signature strictly on server
    if (!isAuthorizedAdmin) {
      if (!razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: 'Missing payment verification credentials' }, { status: 400 });
      }

      const activeRazorpayOrderId = razorpayOrderId || order.razorpayOrderId;
      if (!activeRazorpayOrderId) {
        return NextResponse.json({ error: 'Razorpay Order ID not linked to this order' }, { status: 400 });
      }

      const isValidSignature = verifyPaymentSignature({
        razorpayOrderId: activeRazorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isValidSignature) {
        console.error('Invalid Razorpay signature detected for order:', order.orderId);
        // Record payment failure attempt on order without marking it paid
        await client.patch(order._id).set({
          paymentStatus: 'Failed',
          attentionReason: 'Payment verification failed: Invalid cryptographic signature',
          needsAdminAttention: true,
        }).commit();

        return NextResponse.json(
          { error: 'Payment signature verification failed. Tampering detected or invalid keys.' },
          { status: 400 }
        );
      }
    }

    // 4. Extract product IDs and dealer IDs to resolve current dealer data
    const productIds = (order.products || [])
      .map((item) => item.product?._ref)
      .filter(Boolean);

    const dbProducts = productIds.length > 0 ? await client.fetch(
      `*[_type == "product" && _id in $productIds]{
        _id,
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
    ) : [];

    const dealersMap = {};
    const productDealerMap = {};

    dbProducts.forEach((p) => {
      if (p.dealer && p.dealer._id) {
        dealersMap[p.dealer._id] = p.dealer;
        productDealerMap[p._id] = p.dealer;
      }
    });

    // Also fetch any dealers directly referenced on the order line items
    const directDealerIds = (order.products || [])
      .map((item) => item.dealer?._ref)
      .filter((id) => Boolean(id) && !dealersMap[id]);

    if (directDealerIds.length > 0) {
      const directDealers = await client.fetch(
        `*[_type == "dealer" && _id in $directDealerIds]{
          _id,
          name,
          businessName,
          whatsapp,
          phone,
          status
        }`,
        { directDealerIds }
      );
      directDealers.forEach((d) => {
        dealersMap[d._id] = d;
      });
    }

    // Enrich line items with resolved dealer references if missing
    const enrichedProducts = (order.products || []).map((item) => {
      const resolvedDealer =
        (item.dealer?._ref && dealersMap[item.dealer._ref]) ||
        (item.product?._ref && productDealerMap[item.product._ref]);

      return {
        ...item,
        dealer: resolvedDealer?._id
          ? { _type: 'reference', _ref: resolvedDealer._id }
          : item.dealer,
        dealerName: resolvedDealer?.name || resolvedDealer?.businessName || item.dealerName || '',
      };
    });

    // 5. Compute dealer routing for PAID status
    const routingResult = computeOrderRouting({
      order: {
        ...order,
        products: enrichedProducts,
        paymentStatus: 'Paid',
      },
      dealersMap,
    });

    const now = new Date().toISOString();

    // 6. Update Order in Sanity
    const patchData = {
      paymentStatus: 'Paid',
      orderStatus: order.orderStatus === 'Pending' ? 'Confirmed' : order.orderStatus,
      paymentMethod: 'Razorpay',
      razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId || '',
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId || '',
      razorpaySignature: razorpaySignature || order.razorpaySignature || '',
      paidAt: now,
      products: enrichedProducts,
      dealerNotifications: routingResult.dealerNotifications,
      needsAdminAttention: routingResult.needsAdminAttention,
      attentionReason: routingResult.attentionReason || '',
    };

    if (routingResult.adminNotification) {
      patchData.adminNotification = routingResult.adminNotification;
    }

    await client.patch(order._id).set(patchData).commit();

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      paymentStatus: 'Paid',
      orderStatus: patchData.orderStatus,
      razorpayPaymentId: patchData.razorpayPaymentId,
      paidAt: now,
      dealerNotifications: routingResult.dealerNotifications,
      adminNotification: routingResult.adminNotification,
      needsAdminAttention: routingResult.needsAdminAttention,
      dealerGroupsCount: routingResult.dealerGroupsCount,
    });

  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment and confirm order' },
      { status: 500 }
    );
  }
}
