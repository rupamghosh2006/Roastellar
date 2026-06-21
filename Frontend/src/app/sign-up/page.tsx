'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-6 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BrandLogo size={32} />
        <span className="font-orbitron font-bold text-xl text-premium">Roastellar</span>
      </Link>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              'mech-btn-purple inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium tracking-[0.04em]',
          },
        }}
      />
    </div>
  )
}
