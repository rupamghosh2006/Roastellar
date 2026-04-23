'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { StatCard } from '@/components/StatCard'
import { BattleCard } from '@/components/BattleCard'
import { useUserProfile, useOpenBattles, useWalletInfo } from '@/lib/hooks'
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const { user, loading: userLoading, error: userError } = useUserProfile()
  const { battles, loading: battlesLoading, error: battlesError } = useOpenBattles()
  const { wallet, loading: walletLoading, error: walletError } = useWalletInfo()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  const handleCreateBattle = () => {
    router.push('/battles?action=create')
  }

  const handleQuickMatch = async () => {
    try {
      if (battles.length === 0) {
        toast.error('No open battles available. Create one instead!')
        handleCreateBattle()
        return
      }
      const firstBattle = battles[0]
      router.push(`/battle/${firstBattle.matchId}`)
    } catch (error) {
      toast.error('Failed to join battle')
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {user?.username || 'Champion'}!
              </h1>
              <p className="text-muted-foreground">
                Ready to battle and earn rewards? Jump into the arena below.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <button
                onClick={handleQuickMatch}
                className="glass rounded-lg p-4 hover:border-primary/50 transition text-center"
              >
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium">Quick Match</p>
              </button>
              <button
                onClick={handleCreateBattle}
                className="glass rounded-lg p-4 hover:border-primary/50 transition text-center"
              >
                <div className="text-2xl mb-2">🔥</div>
                <p className="text-sm font-medium">Create Battle</p>
              </button>
              <Link
                href="/leaderboard"
                className="glass rounded-lg p-4 hover:border-primary/50 transition text-center"
              >
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm font-medium">Leaderboard</p>
              </Link>
              <Link
                href="/wallet"
                className="glass rounded-lg p-4 hover:border-primary/50 transition text-center"
              >
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm font-medium">Wallet</p>
              </Link>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6"
            >
              <StatCard
                icon={Trophy}
                label="Rank"
                value={`#${user?.rankPoints || 0}`}
                trend="up"
                trendValue="12"
              />
              <StatCard
                icon={Zap}
                label="XP"
                value={user?.xp || 0}
                trend="up"
                trendValue="240"
              />
              <StatCard icon={Target} label="Wins" value={user?.wins || 0} />
              <StatCard
                icon={TrendingUp}
                label="Balance"
                value={`${wallet?.balance.toFixed(2) || 0} XLM`}
              />
            </motion.div>

            {/* Active Battles Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Open Battles</h2>
                <Link
                  href="/battles"
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </Link>
              </div>

              {battlesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-lg p-6 h-64 animate-pulse" />
                  ))}
                </div>
              ) : battlesError ? (
                <div className="glass rounded-lg p-6 text-center text-muted-foreground">
                  Failed to load battles
                </div>
              ) : battles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {battles.slice(0, 3).map((battle) => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              ) : (
                <div className="glass rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">🏜️</div>
                  <h3 className="text-lg font-semibold mb-2">No Open Battles</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a battle and start earning!
                  </p>
                  <button
                    onClick={handleCreateBattle}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                  >
                    Create Battle
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="glass rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">You joined Battle #42</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <span className="text-accent font-semibold">+50 XP</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">You won a prediction</p>
                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                  </div>
                  <span className="text-accent font-semibold">+2.5 XLM</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">You created Battle #41</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                  <span className="text-accent font-semibold">+100 XP</span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
