import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Input sanitization helper to strip HTML tags
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // 1. Rate Limiting: Max 3 password reset requests per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(`forgot-password-${ip}`, 3, 15 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many password reset attempts. Please try again in ${rateLimitResult.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { email } = body;

    // 2. Formatting & Sanitization
    email = sanitizeString(email).toLowerCase();

    // 3. Validation Rules
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // 4. Find user in Sanity
    const customer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      { email }
    );

    if (!customer) {
      return NextResponse.json({ error: 'This email is not registered in our store.' }, { status: 404 });
    }

    // 5. Generate a token and expiration
    const resetToken = uuidv4();
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // 6. Save token in Sanity
    await client
      .patch(customer._id)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiration.toISOString()
      })
      .commit();

    // 7. Send email using Nodemailer SMTP
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP email credentials are not configured in environment variables.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"AXASZ STORE" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">AXASZ STORE</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3>Password Reset</h3>
          <p>You recently requested to reset your password for your AXASZ STORE account.</p>
          <p>Click the button below to reset it. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: #fff; background-color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: 'If that email exists, a reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
