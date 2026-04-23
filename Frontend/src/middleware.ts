import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])
const hasValidClerkSecret =
  Boolean(process.env.CLERK_SECRET_KEY) &&
  !process.env.CLERK_SECRET_KEY?.includes('xxx')

const handler = hasValidClerkSecret
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        await auth.protect()
      }
    })
  : () => NextResponse.next()

export default handler

export const config = {
  matcher: ['/((?!_next).*)'],
}
