import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/onboarding(.*)', '/sign-in(.*)', '/sign-up(.*)'])

const handler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export default handler

export const config = {
  matcher: ['/((?!_next).*)'],
}

