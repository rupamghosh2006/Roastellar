'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isWalletAuthenticated } from '@/lib/walletAuth'
import { BrandLogo } from '@/components/BrandLogo'

const publicLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  // { href: '#leaderboard-preview', label: 'Leaderboard' },
]

const appLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/battles', label: 'Battles' },
  { href: '/wallet', label: 'Wallet' },
]

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const walletMode = isWalletAuthenticated()
  const isAuthenticated = isSignedIn || walletMode
  if (isAuthenticated) return null

  const links = isAuthenticated ? appLinks : publicLinks

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/85 px-4 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-lg" />
            <BrandLogo size={40} className="relative" />
          </div>
          <div>
            <p className="font-orbitron text-lg font-bold text-white">Roastellar</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">Roast. Battle. Earn.</p>
          </div>
        </Link>

        <div className="hidden items-center rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
          {links.map((link) => {
            const isHash = link.href.startsWith('#')
            const isActive = !isHash && (pathname === link.href || pathname.startsWith(`${link.href}/`))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-white/65 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-400/20 via-violet-400/16 to-amber-300/18 ring-1 ring-white/12"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
                <motion.span
                  className="block"
                  whileHover={{ y: -1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                >
                {link.label}
                </motion.span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Wallet className="h-4 w-4 text-amber-300" />
                Wallet
              </Link>
              {!walletMode && (
                <div className="hidden md:block">
                  <UserButton />
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full bg-gradient-to-r from-amber-300 via-amber-600 to-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(232,121,249,0.35)] transition-opacity hover:opacity-90">
                Sign In
              </Link>
              {/* <Link
                href="/onboarding"
                className="rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
              >
                Start Free
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
