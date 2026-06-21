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
  const isLandingPage = pathname === '/'
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    return null
  }
  const { isSignedIn } = useAuth()
  const walletMode = isWalletAuthenticated()
  const isAuthenticated = isSignedIn || walletMode
  if (isAuthenticated) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:hidden">
        <div className="mx-auto flex h-16 w-full items-center justify-between rounded-full border border-white/10 bg-black/85 px-4 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-lg" />
              <BrandLogo size={36} className="relative" />
            </div>
            <p className="font-orbitron text-xl font-bold text-white">Roastellar</p>
          </Link>

          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Wallet className="h-4 w-4 text-amber-300" />
            Wallet
          </Link>
        </div>
      </nav>
    )
  }

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
                    className="absolute inset-0 -z-10 rounded-full bg-[#B88A35]/16 ring-1 ring-white/12"
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
              {isLandingPage && (
                <Link
                  href="/sign-in"
                  className="mech-btn-purple inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium tracking-[0.04em]"
                >
                  Get Started
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
