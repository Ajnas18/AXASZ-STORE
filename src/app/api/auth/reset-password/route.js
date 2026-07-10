import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Input sanitization helper to strip HTML tags
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 5 attempts per 10 minutes per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`reset-password-${ip}`, 5, 10 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { token, newPassword } = body;

    // 2. Formatting & Sanitization
    token = sanitizeString(token);
    newPassword = typeof newPassword === 'string' ? newPassword : '';

    // 3. Validation Rules
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // 4. Find user with the matching token
    const customer = await client.fetch(
      `*[_type == "customer" && resetPasswordToken == $token][0]`,
      { token }
    );

    if (!customer) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // 5. Check if token is expired
    const now = new Date();
    const expiresAt = new Date(customer.resetPasswordExpires);

    if (now > expiresAt) {
      // Clear expired token
      await client
        .patch(customer._id)
        .unset(['resetPasswordToken', 'resetPasswordExpires'])
        .commit();
        
      return NextResponse.json({ error: 'Password reset token has expired' }, { status: 400 });
    }

    // 6. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 7. Update the customer in Sanity: set new password, unset token fields
    await client
      .patch(customer._id)
      .set({ password: hashedPassword })
      .unset(['resetPasswordToken', 'resetPasswordExpires'])
      .commit();

    return NextResponse.json({ message: 'Password has been successfully reset' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
