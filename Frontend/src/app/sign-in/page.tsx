'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Wallet } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignInPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <BrandLogo size={32} />
          <span className="font-orbitron text-xl font-bold text-gradient">Roastellar</span>
        </Link>

      <div className="flex flex-col items-center gap-6">
        
        <div className="mt-6">
          <SignIn signUpUrl="/sign-up?redirect_url=/onboarding?flow=new" />
        </div>

        <Link
          href="/onboarding?flow=wallet"
          className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_24px_rgba(255,255,255,0.04)]"
        >
          {/* Shimmer sweep on hover */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Wallet className="h-4 w-4 text-slate-300 transition-colors group-hover:text-white" />
          <span className="tracking-wide">Connect Freighter Wallet</span>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
        </Link>

      </div>
      </div>
    </main>
  )
}
