'use client'

import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Flame, Menu, X, Wallet, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'

export function Navbar() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="font-orbitron font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Roastellar
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/leaderboard" className="text-sm text-white/70 hover:text-white transition-colors">
                  Leaderboard
                </Link>
                <Link href="/wallet" className="text-sm text-white/70 hover:text-white transition-colors">
                  Wallet
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity glow-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-white/5"
        >
          <div className="px-4 py-4 space-y-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaderboard"
                  className="block px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link
                  href="/wallet"
                  className="block px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Wallet
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="block px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}