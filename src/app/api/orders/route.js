import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cart, subtotal, discount, totalAmount } = body;
    
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
        _ref: item._id || item.id, // Depends on how the cart stores IDs
      },
      name: item.name,
      productCode: item.productCode || '',
      size: item.selectedSize || '',
      quantity: item.quantity,
      price: item.price,
      image: item.image, // Assuming this is a URL or we just store string for simplicity
    }));

    const orderId = `ORD-${Date.now()}`;

    // Create order in Sanity
    const newOrder = await client.create({
      _type: 'order',
      orderId,
      customer: customerRef,
      orderDate: new Date().toISOString(),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        streetAddress: formData.streetAddress,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      products: formattedProducts,
      subtotal,
      discount,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
    });

    return NextResponse.json({ success: true, orderId: newOrder.orderId });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
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
