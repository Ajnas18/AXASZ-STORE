import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    let { email, password } = body;
    
    if (email) {
      email = email.toLowerCase().trim();
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find customer by email
    const customer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      { email }
    );

    if (!customer) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    await createSession(customer._id);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
