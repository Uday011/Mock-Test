import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get('mocktest_auth_token')?.value;

  // Protected paths that require an active session
  const protectedRoutes = [
    '/dashboard',
    '/exams',
    '/learn',
    '/mistakes',
    '/performance',
    '/question-bank',
    '/settings',
    '/onboarding',
  ];

  const isProtected = protectedRoutes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Allow direct access to administration dashboards so their dedicated credential gates can challenge the user
  if (
    pathname === '/dashboard/superadmin' ||
    pathname.startsWith('/dashboard/superadmin/') ||
    pathname === '/dashboard/admin' ||
    pathname.startsWith('/dashboard/admin/')
  ) {
    return NextResponse.next();
  }

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/exams/:path*',
    '/learn/:path*',
    '/mistakes/:path*',
    '/performance/:path*',
    '/question-bank/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
  ],
};
