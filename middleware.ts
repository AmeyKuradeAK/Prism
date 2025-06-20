import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/webhooks/clerk'
])

export default clerkMiddleware(async (auth, request) => {
  // Allow webhooks to pass through without authentication
  if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return
  }

  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      // Redirect to sign-in instead of returning 401
      const signInUrl = new URL('/sign-in', request.url)
      return Response.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
} 