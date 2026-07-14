import { NextResponse } from 'next/server';

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  // Secure httpOnly session cookie (7 days)
  response.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
