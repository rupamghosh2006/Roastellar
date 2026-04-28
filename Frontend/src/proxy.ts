import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/onboarding(.*)',
  '/dashboard(.*)',
  '/battles(.*)',
  '/battle(.*)',
  '/wallet(.*)',
  '/leaderboard(.*)',
  '/profile(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const handler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export default handler

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|webp|ico|ttf|woff2?|map)).*)'],
}

