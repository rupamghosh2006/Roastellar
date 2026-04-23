'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { 
  Flame, Trophy, Wallet, Swords, TrendingUp, 
  Plus, Zap, ArrowRight, Clock, Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingScreen'
import { apiRoutes } from '@/lib/api'
import type { User, Battle, LeaderboardEntry } from '@/lib/api'

export default function DashboardPage() {
  const { userId } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, battlesRes, leaderboardRes] = await Promise.all([
          apiRoutes.users.me(),
          apiRoutes.battles.open(),
          apiRoutes.users.leaderboard(),
        ])
        setUser(userRes.data)
        setBattles(battlesRes.data)
        setLeaderboard(leaderboardRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="mt-8">
            <PageLoader />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Player'}
          </h1>
          <p className="text-white/60">Ready to battle?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<Trophy className="w-5 h-5 text-accent" />}
            label="Rank"
            value={`#${user?.rank || '—'}`}
            gradient="from-accent/20 to-amber-600/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            label="XP"
            value={user?.xp?.toLocaleString() || '0'}
            gradient="from-primary/20 to-secondary/10"
          />
          <StatCard
            icon={<Swords className="w-5 h-5 text-secondary" />}
            label="Wins"
            value={user?.wins?.toString() || '0'}
            gradient="from-secondary/20 to-primary/10"
          />
          <StatCard
            icon={<Wallet className="w-5 h-5 text-green-400" />}
            label="Balance"
            value={`${user?.walletBalance?.toFixed(2) || '0.00'} XLM`}
            gradient="from-green-400/20 to-emerald-600/10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <QuickActionCard
                icon={<Swords className="w-6 h-6" />}
                title="Quick Match"
                description="Find a random battle opponent"
                href="/battles"
                color="primary"
              />
              <QuickActionCard
                icon={<Plus className="w-6 h-6" />}
                title="Create Contest"
                description="Start your own battle"
                href="/battles/create"
                color="secondary"
              />
              <QuickActionCard
                icon={<Trophy className="w-6 h-6" />}
                title="Leaderboard"
                description="View top players"
                href="/leaderboard"
                color="accent"
              />
              <QuickActionCard
                icon={<Wallet className="w-6 h-6" />}
                title="Wallet"
                description="Manage your XLM"
                href="/wallet"
                color="green"
              />
            </div>
          </div>

          <div>
            <h2 className="font-orbitron text-xl font-bold text-white mb-6">Top Players</h2>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl glass"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-accent/20 text-accent' :
                    i === 1 ? 'bg-white/10 text-white/70' :
                    'bg-white/5 text-white/50'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{player.username}</p>
                    <p className="text-xs text-white/50">{player.xp.toLocaleString()} XP</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron text-xl font-bold text-white">Open Battles</h2>
            <Link href="/battles" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <BattleList battles={battles} emptyMessage="No open battles right now" />
        </div>

        <div className="p-6 rounded-2xl glass border border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-accent animate-pulse-glow" />
            <h3 className="font-orbitron font-bold text-white">Daily Challenge</h3>
          </div>
          <p className="text-white/60 mb-4">
            Complete 3 battles today to earn bonus XP and a special badge!
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-0 h-full bg-gradient-to-r from-accent to-amber-600 rounded-full transition-all" />
            </div>
            <span className="text-sm text-white/50">0/3</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, gradient }: { 
  icon: React.ReactNode
  label: string
  value: string
  gradient: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} border border-white/5`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-orbitron text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}

function QuickActionCard({ icon, title, description, href, color }: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: 'primary' | 'secondary' | 'accent' | 'green'
}) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/20 hover:border-primary/40',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/20 hover:border-secondary/40',
    accent: 'from-accent/20 to-accent/5 border-accent/20 hover:border-accent/40',
    green: 'from-green-400/20 to-green-400/5 border-green-400/20 hover:border-green-400/40',
  }

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-2xl glass border ${colorClasses[color]} transition-all`}
      >
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/50">{description}</p>
      </motion.div>
    </Link>
  )
}