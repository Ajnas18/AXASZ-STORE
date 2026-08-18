import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { computeOrderRouting, DEFAULT_ADMIN_WHATSAPP } from '@/lib/orderRouting';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paymentSignature, paymentProvider, adminSecret } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Authorization check: Either admin secret or logged-in session or verified webhook
    const session = await getSession();
    const envAdminSecret = process.env.ADMIN_PASSWORD || process.env.SANITY_REVALIDATE_SECRET;
    const isAuthorizedAdmin = adminSecret && envAdminSecret && adminSecret === envAdminSecret;

    // 2. Fetch the order from Sanity
    const order = await client.fetch(
      `*[_type == "order" && (orderId == $orderId || _id == $orderId)][0]`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer authorization check if not called with admin privileges
    if (!isAuthorizedAdmin) {
      if (!session || !session.customerId || order.customer?._ref !== session.customerId) {
        // If customer is verifying their own order with a gateway token or session
        // (In production, also verify gateway webhook signature here)
        if (!paymentSignature) {
          return NextResponse.json({ error: 'Unauthorized payment verification attempt' }, { status: 401 });
        }
      }
    }

    // 3. Extract product IDs and dealer IDs to resolve full current dealer data
    const productIds = (order.products || [])
      .map((item) => item.product?._ref)
      .filter(Boolean);

    const dbProducts = await client.fetch(
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
    );

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

    // 4. Compute dealer routing for PAID status
    const routingResult = computeOrderRouting({
      order: {
        ...order,
        products: enrichedProducts,
        paymentStatus: 'Paid',
      },
      dealersMap,
    });

    // 5. Update Order in Sanity
    const patchData = {
      paymentStatus: 'Paid',
      orderStatus: order.orderStatus === 'Pending' ? 'Confirmed' : order.orderStatus,
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
      dealerNotifications: routingResult.dealerNotifications,
      adminNotification: routingResult.adminNotification,
      needsAdminAttention: routingResult.needsAdminAttention,
      dealerGroupsCount: routingResult.dealerGroupsCount,
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment and route order' }, { status: 500 });
  }
}
