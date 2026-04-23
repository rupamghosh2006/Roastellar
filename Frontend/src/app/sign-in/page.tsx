'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Flame } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Flame className="w-8 h-8 text-primary" />
        <span className="font-orbitron font-bold text-xl text-gradient">Roastellar</span>
      </Link>
      <SignIn />
    </div>
  )
}