import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { verifyPassword, createSession } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Input sanitization helper to strip HTML tags
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 10 login attempts per 10 minutes per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`login-${ip}`, 10, 10 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { email, password } = body;

    // 2. Formatting & Sanitization
    email = sanitizeString(email).toLowerCase();
    password = typeof password === 'string' ? password : '';

    // 3. Validation Rules
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Find customer by email
    const customer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      { email }
    );

    if (!customer) {
      // Return a generic error to prevent email enumeration attacks
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
