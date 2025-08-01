import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/home',
    '/auth',
    '/about',
    '/contact',
    '/api/auth/callback', // For OAuth callbacks
    '/_next', // Next.js internals
    '/favicon.ico',
    '/assets', // Static assets
  ]
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/learning',
    '/achievements',
    '/course',
    '/lecture',
    '/profile',
    '/settings',
    '/purchases',
    '/cart',
    '/wishlist'
  ]
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/') || pathname.startsWith(route)
  )
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Get the auth token from cookies or headers
  const authToken = request.cookies.get('auth_token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If accessing a protected route without auth token, redirect to auth
  if (isProtectedRoute && !authToken) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(authUrl)
  }
  
  // If accessing auth page while authenticated, redirect to dashboard
  if (pathname === '/auth' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
