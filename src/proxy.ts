import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Handles server-side redirection and authentication checks.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define route types
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Only run logic for admin routes
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
    
  // 1. Authenticate JWT
  let isAuthenticated = false;
  try {
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    }
  } catch (error) {
    isAuthenticated = false;
  }

  // 2. Redirect Logic
  
  // If on login page and already authenticated -> Redirect to Dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // If on protected page and NOT authenticated -> Redirect to Login
  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

// Global matcher for admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
