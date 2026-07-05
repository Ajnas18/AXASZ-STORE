import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Find user in Sanity
    const customer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      { email }
    );

    if (!customer) {
      return NextResponse.json({ error: 'This email is not registered in our store.' }, { status: 404 });
    }

    // 2. Generate a token and expiration
    const resetToken = uuidv4();
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Save token in Sanity
    await client
      .patch(customer._id)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiration.toISOString()
      })
      .commit();

    // 4. Send email using Nodemailer
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    let transporter;
    
    // Check if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal if no SMTP is configured
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"AXASZ STORE" <${process.env.SMTP_USER || 'noreply@axaszstore.com'}>`,
      to: customer.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You recently requested to reset your password for your AXASZ STORE account.</p>
          <p>Click the button below to reset it. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #000; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };

    let info = await transporter.sendMail(mailOptions);
    let testUrl = null;
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        testUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", testUrl);
    }

    return NextResponse.json({ 
      message: 'If that email exists, a reset link has been sent.',
      testUrl: testUrl 
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
