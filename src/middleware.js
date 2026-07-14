import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip the login page itself to avoid infinite redirect loop
  if (pathname.startsWith('/admin-login')) {
    return NextResponse.next();
  }

  // Protect all /admin routes (including bare /admin)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const session = request.cookies.get('admin_session');

    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match /admin, /admin/*, and /admin-login (to skip it explicitly)
  matcher: ['/admin', '/admin/(.*)', '/admin-login'],
};
