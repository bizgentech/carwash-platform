import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = [
    '/customer',
    '/washer/dashboard',
    '/admin',
  ]

  // Check if the current path is protected
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (isProtected) {
    // Get token from cookies (primary) or headers (fallback for API calls)
    const tokenFromCookie = request.cookies.get('token')?.value
    const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '')
    const token = tokenFromCookie || tokenFromHeader

    console.log('[Middleware] Path:', path)
    console.log('[Middleware] Token from cookie:', tokenFromCookie ? 'exists' : 'missing')
    console.log('[Middleware] Token from header:', tokenFromHeader ? 'exists' : 'missing')

    if (!token) {
      console.log('[Middleware] No token found, redirecting to login')
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify token using Edge-compatible function
      const payload = await verifyTokenEdge(token)

      console.log('[Middleware] Token payload:', payload)

      if (!payload) {
        console.log('[Middleware] Invalid token, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Role-based access control
      if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      if (path.startsWith('/washer/dashboard') && payload.role !== 'WASHER') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      if (path.startsWith('/customer') && payload.role !== 'CUSTOMER') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)

      console.log('[Middleware] Access granted for user:', payload.userId, 'role:', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('[Middleware] Error verifying token:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/washer/dashboard/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
  ],
}
