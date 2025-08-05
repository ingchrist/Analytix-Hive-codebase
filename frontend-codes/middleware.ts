import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '')

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/home',
    '/waitlist',
  ]

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/learning',
    '/courses'
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a protected route and user is not authenticated, redirect to auth
  if (isProtectedRoute && !token) {
    const authUrl = new URL('/auth', request.url)
    return NextResponse.redirect(authUrl)
  }

  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (token && pathname === '/auth') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

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
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}