import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      // Parse "Basic <base64(username:password)>"
      const base64 = authHeader.split(' ')[1];
      const decoded = atob(base64);
      const [username, password] = decoded.split(':');

      const validUser = username === process.env.ADMIN_USERNAME;
      const validPass = password === process.env.ADMIN_PASSWORD;

      if (validUser && validPass) {
        return NextResponse.next(); // ✅ Access granted
      }
    }

    // ❌ No valid credentials — show browser login dialog
    return new NextResponse('Access Denied', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="AXASZ Admin", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/(.*)'],
};
