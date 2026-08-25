import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { compileDashboardAnalytics } from '@/lib/analytics';

export async function GET(request) {
  try {
    // Check for admin authorization
    const session = await getSession();
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-admin-secret') || request.headers.get('x-revalidate-secret');
    const urlSecret = new URL(request.url).searchParams.get('secret');

    const expectedSecret = process.env.ADMIN_PASSWORD || process.env.SANITY_REVALIDATE_SECRET;
    const isSecretValid = expectedSecret && (
      secretHeader === expectedSecret ||
      urlSecret === expectedSecret ||
      authHeader === `Bearer ${expectedSecret}`
    );

    // If neither valid session nor valid secret is provided, reject request
    if (!session?.isAdmin && !isSecretValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rangeKey = searchParams.get('range') || '30d';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    // 1. Fetch live orders and dealers from Sanity
    const [orders, dealers] = await Promise.all([
      client.fetch(
        `*[_type == "order"] | order(orderDate desc) {
          _id,
          orderId,
          orderDate,
          totalAmount,
          subtotal,
          discount,
          paymentStatus,
          orderStatus,
          products[]{
            product->{ _id, name, productCode, image },
            name,
            productCode,
            size,
            quantity,
            price,
            dealer->{ _id, name, businessName, whatsapp, status },
            dealerName
          }
        }`
      ),
      client.fetch(
        `*[_type == "dealer"] {
          _id,
          name,
          businessName,
          whatsapp,
          status
        }`
      ),
    ]);

    // 2. Compile comprehensive business intelligence payload
    const analyticsData = compileDashboardAnalytics({
      orders: orders || [],
      dealers: dealers || [],
      rangeKey,
      customStart,
      customEnd,
    });

    return NextResponse.json(
      {
        success: true,
        data: analyticsData,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics dashboard data' },
      { status: 500 }
    );
  }
}
