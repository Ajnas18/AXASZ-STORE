import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 1. Find user with the matching token
    const customer = await client.fetch(
      `*[_type == "customer" && resetPasswordToken == $token][0]`,
      { token }
    );

    if (!customer) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // 2. Check if token is expired
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

    // 3. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update the customer in Sanity: set new password, unset token fields
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
