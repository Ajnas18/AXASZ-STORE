import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if customer already exists
    const existingCustomer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      { email }
    );

    if (existingCustomer) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer in Sanity
    const newCustomer = await client.create({
      _type: 'customer',
      fullName: name,
      email,
      phone: phone || '',
      password: hashedPassword,
    });

    // Create session
    await createSession(newCustomer._id);

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newCustomer._id,
        name: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
