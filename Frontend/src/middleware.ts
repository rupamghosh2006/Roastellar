import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/webhook(.*)'])
const isAuthRoute = createRouteMatcher(['/onboarding(.*)', '/dashboard(.*)', '/battle(.*)', '/leaderboard(.*)', '/profile(.*)', '/wallet(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAuthRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
