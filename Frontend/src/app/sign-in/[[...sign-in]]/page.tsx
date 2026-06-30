'use client'

import { useEffect, useRef } from 'react'
import { SignIn, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Wallet } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, errors, fetchStatus } = useSignIn()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (fetchStatus !== 'idle' || !signIn || hasRedirected.current) return

    const isUserNotFound = errors.fields?.identifier?.code === 'form_identifier_not_found'

    if (isUserNotFound) {
      hasRedirected.current = true
      router.push('/sign-up?redirect_url=/onboarding?flow=new')
    }
  }, [signIn, errors, fetchStatus, router])

  return (
    <main className="min-h-screen px-4 pb-10 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <BrandLogo size={32} />
          <span className="font-orbitron text-xl font-bold text-premium">Roastellar</span>
        </Link>

      <div className="flex flex-col items-center gap-3">
        
        <div className="mt-6">
          <SignIn signUpUrl="/sign-up?redirect_url=/onboarding?flow=new" />
        </div>


      <div className="">
        OR
        </div>

        <Link
          href="/onboarding?flow=wallet"
          className="mech-btn-purple inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium tracking-[0.04em]"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Freighter Wallet</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

      </div>
      </div>
    </main>
  )
}
