import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { computeOrderRouting } from '@/lib/orderRouting';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured on the server');
      return NextResponse.json({ error: 'Webhook secret not configured on server' }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid Razorpay Webhook signature received');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const eventData = JSON.parse(rawBody);
    const event = eventData.event;
    const payload = eventData.payload;

    console.log(`Razorpay Webhook event received: ${event}`);

    // 1. Payment Captured / Order Paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payment?.entity;
      const orderEntity = payload.order?.entity;
      
      const rzpOrderId = payment?.order_id || orderEntity?.id;
      const rzpPaymentId = payment?.id;
      const storeOrderId = payment?.notes?.orderId || orderEntity?.notes?.orderId || payment?.notes?.receipt;

      if (!rzpOrderId && !storeOrderId) {
        console.warn('Webhook payload lacks order identifiers:', eventData);
        return NextResponse.json({ status: 'ignored_missing_order_id' });
      }

      // Query order in Sanity
      const order = await client.fetch(
        `*[_type == "order" && (razorpayOrderId == $rzpOrderId || orderId == $storeOrderId)][0]`,
        { rzpOrderId: rzpOrderId || '', storeOrderId: storeOrderId || '' }
      );

      if (!order) {
        console.warn(`Order not found for webhook event ${event}: rzpOrderId=${rzpOrderId}, storeOrderId=${storeOrderId}`);
        return NextResponse.json({ status: 'order_not_found' });
      }

      // Idempotency: If already paid, do nothing
      if (order.paymentStatus === 'Paid') {
        return NextResponse.json({ status: 'already_processed' });
      }

      // Resolve dealer routing
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

      const routingResult = computeOrderRouting({
        order: {
          ...order,
          products: enrichedProducts,
          paymentStatus: 'Paid',
        },
        dealersMap,
      });

      const now = new Date().toISOString();

      const patchData = {
        paymentStatus: 'Paid',
        orderStatus: order.orderStatus === 'Pending' ? 'Confirmed' : order.orderStatus,
        paymentMethod: 'Razorpay',
        razorpayPaymentId: rzpPaymentId || order.razorpayPaymentId || '',
        razorpayOrderId: rzpOrderId || order.razorpayOrderId || '',
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
      console.log(`Order ${order.orderId} marked as Paid via webhook.`);
      return NextResponse.json({ status: 'ok', event, orderId: order.orderId });
    }

    // 2. Payment Failed
    if (event === 'payment.failed') {
      const payment = payload.payment?.entity;
      const rzpOrderId = payment?.order_id;
      const storeOrderId = payment?.notes?.orderId;
      const failureReason = payment?.error_description || payment?.error_reason || 'Payment failed';

      const order = await client.fetch(
        `*[_type == "order" && (razorpayOrderId == $rzpOrderId || orderId == $storeOrderId)][0]`,
        { rzpOrderId: rzpOrderId || '', storeOrderId: storeOrderId || '' }
      );

      if (order && order.paymentStatus !== 'Paid') {
        await client.patch(order._id).set({
          paymentStatus: 'Failed',
          attentionReason: `Razorpay payment failed: ${failureReason}`,
          needsAdminAttention: true,
        }).commit();
        console.log(`Order ${order.orderId} marked as Failed via webhook.`);
      }

      return NextResponse.json({ status: 'ok', event });
    }

    // 3. Refund Processed / Created
    if (event === 'refund.processed' || event === 'refund.created' || event === 'refund.speed_processed') {
      const refund = payload.refund?.entity;
      const payment = payload.payment?.entity;
      const rzpPaymentId = refund?.payment_id || payment?.id;

      if (rzpPaymentId) {
        const order = await client.fetch(
          `*[_type == "order" && razorpayPaymentId == $rzpPaymentId][0]`,
          { rzpPaymentId }
        );

        if (order) {
          await client.patch(order._id).set({
            paymentStatus: 'Refunded',
            attentionReason: `Refund processed (ID: ${refund?.id || 'N/A'}) for amount ₹${((refund?.amount || 0) / 100).toFixed(2)}`,
            needsAdminAttention: true,
          }).commit();
          console.log(`Order ${order.orderId} marked as Refunded via webhook.`);
        }
      }

      return NextResponse.json({ status: 'ok', event });
    }

    return NextResponse.json({ status: 'ignored_unhandled_event', event });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Webhook handling failed' }, { status: 500 });
  }
}
