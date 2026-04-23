'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth, UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Menu, X, Flame, Trophy, Users, Wallet, ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">Roastellar</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Enter Arena
              </Link>
            </SignedIn>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </SignedIn>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/5"
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/#how-it-works"
              className="block text-sm text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/leaderboard"
              className="block text-sm text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className="block px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Enter Arena
              </Link>
            </SignedIn>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/battle" className="hover:text-foreground">Battles</Link></li>
              <li><Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground">API</a></li>
              <li><a href="#" className="hover:text-foreground">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-violet-500" />
            <span className="font-semibold">Roastellar</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Stellar. Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}