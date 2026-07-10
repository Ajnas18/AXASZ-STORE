import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the order, ensuring it belongs strictly to the authenticated customer
    const order = await client.fetch(
      `*[_type == "order" && _id == $id && customer._ref == $customerId][0]`,
      { id, customerId: session.customerId }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error('Fetch Order Detail Error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
