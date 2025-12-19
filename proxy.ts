import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { extractSubdomain } from '@/lib/tenant/subdomain';
import { db } from '@/db';
import { tenants } from '@/db/schema/admin';
import { eq } from 'drizzle-orm';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request.headers.get('host') || '');

  // Get session for auth check
  const session = await auth();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth',
    '/invitations/accept',
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (subdomain) {
    // Fetch tenant data from database
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.subdomain, subdomain),
    });

    // If tenant doesn't exist, redirect to main domain
    if (!tenant) {
      const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      return NextResponse.redirect(`${protocol}://${rootDomain}/404`);
    }

    // Check if tenant is active
    if (tenant.status !== 'active') {
      // Allow access to login page even if suspended
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/suspended', request.url));
      }
    }

    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Require authentication for tenant routes (except public routes)
    if (!session && !isPublicRoute) {
      // Redirect to login on the same subdomain
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Inject tenant context into headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.id);
    requestHeaders.set('x-tenant-subdomain', tenant.subdomain);
    requestHeaders.set('x-tenant-name', tenant.name);

    // For the root path on a subdomain, rewrite to the tenant dashboard
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url), {
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Pass tenant context to all other routes
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};
