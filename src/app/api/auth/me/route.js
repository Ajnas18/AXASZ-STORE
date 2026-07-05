import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { client } from '@/sanity/client';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.customerId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const customer = await client.fetch(
      `*[_type == "customer" && _id == $id][0]{ _id, fullName, email, phone }`,
      { id: session.customerId }
    );

    if (!customer) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      }
    });
  } catch (error) {
    console.error('Session Error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
