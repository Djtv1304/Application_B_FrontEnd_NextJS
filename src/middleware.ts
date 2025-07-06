import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { authkitMiddleware} from '@workos-inc/authkit-nextjs';
import { workos } from '../lib/workos';

const COOKIE_PASSWORD = process.env.WORKOS_COOKIE_PASSWORD!;

// Custom middleware function for role-based access control
async function customMiddleware(request: NextRequest, event: NextFetchEvent) {
  // Check if this is the admin page that requires role-based access control
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // First, ensure user is authenticated using WorkOS
    const authResponse = await authkitMiddleware({
      middlewareAuth: {
        enabled: true,
        unauthenticatedPaths: ['/'],
      },
    })(request, event);

    // If the response is a redirect (authentication required), return it
    if (authResponse instanceof Response && (authResponse.status === 307 || authResponse.status === 302)) {
      return authResponse;
    }

    // User is authenticated, now check for admin role
    try {
      // Get the session cookie from the request
      const sessionCookie = request.cookies.get('wos-session');
      
      if (!sessionCookie) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      // Get WorkOS client and load the sealed session
      // const workos = workos();
      const session = workos.userManagement.loadSealedSession({
        sessionData: sessionCookie.value,
        cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
      });

      // Authenticate the session
      const result = await session.authenticate();
      
      if (!result.authenticated) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      // Check if user has admin role
      const hasAdminRole = result.role?.includes('admin') || false;
      
      if (!hasAdminRole) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      console.log('CLIENT_ID en middleware:', process.env.WORKOS_CLIENT_ID);

      return NextResponse.redirect(new URL('/dx', request.url));
    }

    // If we reach here, user is authenticated and has admin role
    // Return the original auth response or continue with the request
    return authResponse instanceof Response ? authResponse : NextResponse.next();
  }

  // For all other routes, use the standard WorkOS middleware
  return authkitMiddleware({
    middlewareAuth: {
      enabled: true,
      unauthenticatedPaths: ['/'],
    },
  })(request, event);
}

export default customMiddleware;

// Match against pages that require authentication, including the admin page
export const config = {
  matcher: ['/', '/categories/:path*', '/generate', '/account/:page*', '/admin/:path*']
}