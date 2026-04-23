'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, LayoutDashboard, Trophy, User, Wallet, Waves, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', hint: 'Arena hub' },
  { href: '/battles', icon: Swords, label: 'Battles', hint: 'Live matches' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', hint: 'Top roasters' },
  { href: '/wallet', icon: Wallet, label: 'Wallet', hint: 'Stellar vault' },
  { href: '/profile', icon: User, label: 'Profile', hint: 'Badges and history' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-white/10 bg-slate-950/40 px-4 py-6 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.4)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <Flame className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <p className="font-orbitron text-lg font-bold text-white">Arena Core</p>
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Premium Access</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'rounded-2xl border px-4 py-3 transition-all',
                    isActive
                      ? 'border-blue-400/30 bg-gradient-to-r from-blue-500/18 via-violet-500/14 to-amber-300/10 text-white'
                      : 'border-transparent bg-white/[0.03] text-white/60 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('rounded-xl p-2', isActive ? 'bg-white/10' : 'bg-white/[0.04]')}>
                      <Icon className={cn('h-4 w-4', isActive ? 'text-blue-300' : 'text-white/60')} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="truncate text-xs text-white/35">{item.hint}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-4 rounded-[28px] border border-amber-300/12 bg-gradient-to-br from-amber-300/10 via-white/[0.03] to-violet-500/10 p-5">
        <div className="flex items-center gap-2 text-amber-200">
          <Waves className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.28em]">Reward Loop</span>
        </div>
        <p className="mt-3 font-orbitron text-xl text-white">Daily challenge resets in 8h</p>
        <p className="mt-2 text-sm text-white/55">Keep your streak alive to unlock bonus testnet XLM and featured placement.</p>
      </div>
    </aside>
  )
}
