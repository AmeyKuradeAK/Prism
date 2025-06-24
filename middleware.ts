import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/webhooks/clerk',
  '/docs',
  '/pricing(.*)', // Make pricing public but redirect in component
  '/about',
  '/contact'
])

export default clerkMiddleware(async (auth, request) => {
  // Allow webhooks to pass through without authentication
  if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }

  // Handle protected routes
  if (!isPublicRoute(request)) {
    try {
      const { userId } = await auth()
      if (!userId) {
        // Create a proper redirect URL
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect_url', request.url)
        
        // Use NextResponse.redirect with proper headers
        return NextResponse.redirect(signInUrl, {
          status: 302,
          headers: {
            'Location': signInUrl.toString(),
          }
        })
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      // On auth error, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url)
      return NextResponse.redirect(signInUrl, { status: 302 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 