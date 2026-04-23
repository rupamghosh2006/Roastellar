'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Flame, Menu, Sparkles, Wallet, X } from 'lucide-react'
import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)
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

        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Wallet className="h-4 w-4 text-amber-300" />
                Wallet
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
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

        <button
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden"
        >
          <div className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {isSignedIn ? (
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Arena access active
                </div>
                <UserButton />
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-center text-white/80"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-4 py-3 text-center font-semibold text-slate-950"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}
