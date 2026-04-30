'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Wallet } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignInPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <BrandLogo size={32} />
          <span className="font-orbitron text-xl font-bold text-gradient">Roastellar</span>
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Clerk sign in card</p>
            <h1 className="mt-3 font-orbitron text-2xl font-bold text-white sm:text-3xl">Continue with Google or Email</h1>
            <p className="mt-2 text-sm text-slate-400">New user? Create your account inside this card.</p>
            <div className="mt-6">
              <SignIn signUpUrl="/sign-up?redirect_url=/onboarding?flow=new" />
            </div>
          </section>

          <section className="glass rounded-2xl border border-violet-400/30 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Or</p>
            <h2 className="mt-3 font-orbitron text-2xl font-bold text-white sm:text-3xl">Connect Freighter Wallet</h2>
            <p className="mt-2 text-sm text-slate-300">Already have a wallet? Continue straight into wallet auth.</p>
            <Link
              href="/onboarding?flow=wallet"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-bold text-white transition-all duration-200 hover:from-orange-400 hover:to-red-400"
            >
              <Wallet className="h-4 w-4" />
              Connect Freighter Wallet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
