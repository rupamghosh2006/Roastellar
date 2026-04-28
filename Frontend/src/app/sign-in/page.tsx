'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BrandLogo size={32} />
        <span className="font-orbitron font-bold text-xl text-gradient">Roastellar</span>
      </Link>
      <SignIn />
    </div>
  )
}
