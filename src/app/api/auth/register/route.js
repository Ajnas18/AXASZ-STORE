import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { hashPassword, createSession } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Input sanitization helper to strip HTML tags
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 5 registrations per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`register-${ip}`, 5, 15 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { name, email, phone, password } = body;

    // 2. Formatting & Sanitization
    name = sanitizeString(name);
    email = sanitizeString(email).toLowerCase();
    phone = sanitizeString(phone);
    password = typeof password === 'string' ? password : '';

    // 3. Validation Rules
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (phone) {
      const numericPhone = phone.replace(/[^0-9+]/g, '');
      if (numericPhone.length < 7 || numericPhone.length > 15) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
      }
      phone = numericPhone;
    } else {
      phone = '';
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
      phone,
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
