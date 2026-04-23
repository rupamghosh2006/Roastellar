'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Sparkles, Swords, Trophy, Wallet as WalletIcon } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingScreen'
import { apiRoutes, type Battle, type LeaderboardEntry, type User } from '@/lib/api'
import { isOnboardingComplete } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const mockActivity = [
  'NovaBurn won 12 XLM in "Friday Night Fire"',
  'Three new open battles were created in the last hour',
  'Prediction rewards were sent to 42 spectators',
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace('/onboarding')
      return
    }

    Promise.all([
      apiRoutes.users.me(),
      apiRoutes.battles.open(),
      apiRoutes.users.leaderboard(),
    ])
      .then(([userResponse, battlesResponse, leaderboardResponse]) => {
        setUser(userResponse.data)
        setBattles(battlesResponse.data)
        setLeaderboard(leaderboardResponse.data)
      })
      .catch((error) => console.error('Failed to load dashboard:', error))
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}
          </div>
          <PageLoader message="Loading your arena hub" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-[36px] p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-blue-200/75">Dashboard</p>
                <h1 className="mt-3 font-orbitron text-4xl font-bold text-white">Welcome back, {user?.username ?? 'Player'}</h1>
                <p className="mt-3 max-w-2xl text-white/55">
                  Your command center for battles, wallet health, streaks, and everything the arena is doing right now.
                </p>
              </div>
              <div className="rounded-[28px] border border-amber-300/14 bg-amber-300/8 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-100/70">Live edge</p>
                <p className="mt-2 text-sm text-white/72">Spectator predictions are trending 18% above yesterday.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Rank" value={`#${user?.rank ?? '-'}`} icon={<Trophy className="h-5 w-5 text-amber-200" />} />
              <StatCard label="XP" value={(user?.xp ?? 0).toLocaleString()} icon={<Sparkles className="h-5 w-5 text-blue-200" />} />
              <StatCard label="Wins" value={String(user?.wins ?? 0)} icon={<Swords className="h-5 w-5 text-violet-200" />} />
              <StatCard label="Wallet Balance" value={`${(user?.walletBalance ?? 0).toFixed(2)} XLM`} icon={<WalletIcon className="h-5 w-5 text-emerald-200" />} />
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-8">
              <div className="glass rounded-[36px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/35">Quick actions</p>
                    <h2 className="mt-2 font-orbitron text-2xl text-white">Next moves</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <QuickAction href="/battles" title="Quick Match" copy="Jump into the freshest open battle." />
                  <QuickAction href="/battles" title="Create Contest" copy="Launch a new battle and set the tone." />
                  <QuickAction href="/battles" title="Join Open Battle" copy="Pick a live opportunity from the queue." />
                  <QuickAction href="/leaderboard" title="Leaderboard" copy="Track rivals and rising stars." />
                </div>
              </div>

              <div className="glass rounded-[36px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/35">Open battles</p>
                    <h2 className="mt-2 font-orbitron text-2xl text-white">Join the arena</h2>
                  </div>
                  <Link href="/battles" className="text-sm font-semibold text-blue-200">
                    Browse all
                  </Link>
                </div>
                <div className="mt-6">
                  <BattleList battles={battles} emptyMessage="No open battles available yet." />
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="glass rounded-[36px] p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Live activity feed</p>
                <div className="mt-5 space-y-4">
                  {mockActivity.map((item) => (
                    <div key={item} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/68">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-[36px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/35">Top players</p>
                    <h2 className="mt-2 font-orbitron text-2xl text-white">Leaderboard pulse</h2>
                  </div>
                  <Coins className="h-5 w-5 text-amber-200" />
                </div>
                <div className="mt-6 space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 font-orbitron text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{entry.username}</p>
                          <p className="text-sm text-white/45">{entry.wins} wins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-orbitron text-white">{entry.xp.toLocaleString()}</p>
                        <p className="text-xs text-white/40">XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/leaderboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-200">
                  View leaderboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
        {icon}
        {label}
      </div>
      <p className="mt-4 font-orbitron text-3xl text-white">{value}</p>
    </div>
  )
}

function QuickAction({ href, title, copy }: { href: string; title: string; copy: string }) {
  return (
    <Link href={href} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
      <p className="font-orbitron text-xl text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/50">{copy}</p>
    </Link>
  )
}
