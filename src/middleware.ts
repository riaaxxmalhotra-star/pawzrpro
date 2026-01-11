import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - only accessible by ADMIN role
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Dashboard routes - redirect to role-specific dashboard
    if (path === '/dashboard') {
      const role = token?.role?.toLowerCase()
      if (role) {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
      }
    }

    // Ensure users can only access their own dashboard
    const dashboardMatch = path.match(/^\/dashboard\/(owner|lover|vet|groomer|supplier)/)
    if (dashboardMatch) {
      const requestedRole = dashboardMatch[1].toUpperCase()
      if (token?.role !== requestedRole && token?.role !== 'ADMIN') {
        const correctPath = `/dashboard/${token?.role?.toLowerCase()}`
        return NextResponse.redirect(new URL(correctPath, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/login',
          '/signup',
          '/forgot-password',
          '/browse',
          '/events',
        ]

        // Check if path starts with any public route
        const isPublicRoute = publicRoutes.some(
          (route) => path === route || path.startsWith(`${route}/`)
        )

        // Allow public routes
        if (isPublicRoute) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/messages/:path*',
    '/checkout/:path*',
    '/profile/:path*',
  ],
}
