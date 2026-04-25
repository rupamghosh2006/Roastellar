'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'
import { Flame, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#leaderboard-preview', label: 'Leaderboard' },
]

const appLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/battles', label: 'Battles' },
  { href: '/wallet', label: 'Wallet' },
]

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const links = isSignedIn ? appLinks : publicLinks

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-lg" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/25 bg-white/10">
              <Flame className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <div>
            <p className="font-orbitron text-lg font-bold text-white">Roastellar</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">Roast. Battle. Earn.</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const isHash = link.href.startsWith('#')
            const isActive = !isHash && (pathname === link.href || pathname.startsWith(`${link.href}/`))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Wallet className="h-4 w-4 text-amber-300" />
                Wallet
              </Link>
              <div className="hidden md:block">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
