'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, Swords, Trophy, Wallet, User, 
  ChevronRight, Flame 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/battles', icon: Swords, label: 'Battles' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/5 glass">
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : '')} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto"
                    >
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="px-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-primary animate-pulse-glow" />
                <span className="font-orbitron text-sm text-primary">Daily Reward</span>
              </div>
              <p className="text-xs text-white/60">
                Come back tomorrow for bonus XLM rewards!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="px-4 py-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/40">Powered by</p>
          <p className="text-sm font-semibold text-white/70">Stellar Network</p>
        </div>
      </div>
    </aside>
  )
}