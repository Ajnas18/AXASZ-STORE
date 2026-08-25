import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { getRazorpayClient } from '@/lib/razorpay';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request, { params }) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`order-pay-${ip}`, 15, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many payment requests. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch the order from Sanity
    const order = await client.fetch(
      `*[_type == "order" && (_id == $id || orderId == $id)][0]`,
      { id }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: if customer is logged in, ensure matching or allow guest access if phone/email matches
    const session = await getSession();
    if (session && session.customerId && order.customer?._ref && order.customer._ref !== session.customerId) {
      return NextResponse.json({ error: 'Unauthorized access to this order' }, { status: 403 });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'Paid') {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: order.orderId,
        message: 'This order is already paid.',
      });
    }

    const totalAmount = order.totalAmount || order.subtotal || 0;
    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order total amount' }, { status: 400 });
    }

    let razorpayOrderId = order.razorpayOrderId;
    const amountInPaise = Math.round(totalAmount * 100);

    // If order does not have a Razorpay Order ID yet, create one
    if (!razorpayOrderId) {
      try {
        const razorpay = getRazorpayClient();
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderId,
          notes: {
            orderId: order.orderId,
            customerName: order.shippingAddress?.fullName || 'Customer',
            customerEmail: order.shippingAddress?.email || '',
            customerPhone: order.shippingAddress?.phone || '',
          },
        });

        razorpayOrderId = rzpOrder.id;

        // Persist the newly created Razorpay Order ID on the existing Sanity order
        await client.patch(order._id).set({
          razorpayOrderId: rzpOrder.id,
        }).commit();
      } catch (rzpErr) {
        console.error('Razorpay Order Creation Error for existing order:', rzpErr);
        return NextResponse.json(
          { error: rzpErr.message || 'Failed to initialize payment gateway for this order.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      orderDocId: order._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: {
        name: order.shippingAddress?.fullName || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Customer',
        email: order.shippingAddress?.email || '',
        phone: order.shippingAddress?.phone || '',
      },
    });

  } catch (error) {
    console.error('Initiate Existing Order Payment Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment for this order' },
      { status: 500 }
    );
  }
}
