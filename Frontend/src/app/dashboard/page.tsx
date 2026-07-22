'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Sparkles, Swords, Trophy, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingScreen'
import { apiRoutes, type Battle, type LeaderboardEntry, type User, type Wallet } from '@/lib/api'
import { setOnboardingComplete } from '@/lib/utils'
import { getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AnimatedList } from '@/components/AnimatedList'

export default function DashboardPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAuthWarning, setHasAuthWarning] = useState(false)

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    const walletMode = isWalletAuthenticated()
    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    Promise.resolve(walletMode ? getWalletAuthToken() : getToken({ skipCache: true }))
      .then((token) => {
        if (!token) throw new Error('Missing auth token')

        return Promise.allSettled([
          apiRoutes.users.me(token),
          apiRoutes.wallet.me(token),
          apiRoutes.battles.open(),
          apiRoutes.users.leaderboard(),
        ])
      })
      .then(([userResult, walletResult, battlesResult, leaderboardResult]) => {
        if (userResult.status === 'fulfilled') {
          const me = userResult.value.data
          setUser(me)

          if (me.onboardingCompleted) {
            setOnboardingComplete()
          } else {
            router.replace('/onboarding')
            return
          }
        } else {
          setHasAuthWarning(true)
        }

        if (walletResult.status === 'fulfilled') {
          setWallet(walletResult.value.data)
        }

        if (battlesResult.status === 'fulfilled') {
          setBattles(battlesResult.value.data)
        }

        if (leaderboardResult.status === 'fulfilled') {
          setLeaderboard(leaderboardResult.value.data)
        }
      })
      .catch(() => {
        setHasAuthWarning(true)
        toast.error('Unable to load your authenticated dashboard session.')
      })
      .finally(() => setIsLoading(false))
  }, [getToken, isLoaded, isSignedIn, router])

  const liveActivity = useMemo(() => {
    const activity: string[] = []

    if (battles.length > 0) {
      activity.push(`${battles.length} open battle${battles.length > 1 ? 's are' : ' is'} live right now.`)
      const hottestBattle = [...battles].sort((a, b) => b.pot - a.pot)[0]
      activity.push(`Highest open pot: ${hottestBattle.pot.toFixed(2)} XLM for "${hottestBattle.topic}".`)
    }

    if (leaderboard[0]) {
      activity.push(`${leaderboard[0].username} leads the leaderboard with ${leaderboard[0].xp.toLocaleString()} XP.`)
    }

    if (user?.rank) {
      activity.push(`Your current rank is #${user.rank}.`)
    }

    if (wallet) {
      activity.push(`Wallet balance available: ${wallet.balance.toFixed(2)} XLM.`)
    }

    if (activity.length === 0) {
      activity.push('No live activity is available yet.')
    }

    return activity.slice(0, 5)
  }, [battles, leaderboard, user?.rank, wallet])

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}
          </div>
          <PageLoader message="Loading your arena hub" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.3)] sm:rounded-[24px] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Arena command</p>
                <h1 className="mt-2 font-orbitron text-2xl font-bold tracking-tight text-white sm:text-3xl">Welcome back, {user?.username ?? 'Player'}</h1>
                <p className="mt-2 text-sm text-slate-400">Your live battles, account standing, and wallet overview.</p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-[#121620] px-3 py-2 text-xs font-medium text-slate-300 sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Arena systems online
              </div>
            </div>

            {hasAuthWarning && (
              <div className="mt-6 border border-amber-300/20 bg-[#231d11] px-4 py-3 text-sm leading-6 text-amber-100/85">
                Account-only stats are unavailable right now because the backend is not accepting authenticated local requests yet. Public battle and leaderboard data can still load.
              </div>
            )}

            <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Rank" value={`#${user?.rank ?? '-'}`} icon={<Trophy className="h-5 w-5 text-amber-200" />} />
              <StatCard label="XP" value={(user?.xp ?? 0).toLocaleString()} icon={<Sparkles className="h-5 w-5 text-blue-200" />} />
              <StatCard label="Wins" value={String(user?.wins ?? 0)} icon={<Swords className="h-5 w-5 text-violet-200" />} />
              <StatCard label="Wallet Balance" value={`${(wallet?.balance ?? user?.walletBalance ?? 0).toFixed(2)} XLM`} icon={<WalletIcon className="h-5 w-5 text-emerald-200" />} />
            </div>
          </header>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Quick actions</p>
                    <h2 className="mt-2 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Next moves</h2>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <QuickAction href="/battles" title="Quick Match" copy="Jump into the freshest open battle." />
                  <QuickAction href="/battles" title="Create Contest" copy="Launch a new battle and set the tone." />
                  <QuickAction href="/battles" title="Join Open Battle" copy="Pick a live opportunity from the queue." />
                  <QuickAction href="/leaderboard" title="Leaderboard" copy="Track rivals and rising stars." />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Open battles</p>
                    <h2 className="mt-2 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Join the arena</h2>
                  </div>
                  <Link href="/battles" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                    Browse all
                  </Link>
                </div>
                <div className="mt-6">
                  <BattleList battles={battles} emptyMessage="No open battles available yet." />
                </div>
              </section>
            </section>

            <section className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:rounded-[24px] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Live activity feed</p>
                <div className="mt-5">
                  <AnimatedList
                    items={liveActivity}
                    showGradients={false}
                    enableArrowNavigation={false}
                    displayScrollbar={false}
                    containerClassName="max-h-none overflow-visible p-0"
                    renderItem={(item) => (
                      <div className="border border-white/10 bg-[#10131a] p-4 text-sm leading-6 text-slate-300">
                        {item}
                      </div>
                    )}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Top players</p>
                    <h2 className="mt-2 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Leaderboard pulse</h2>
                  </div>
                  <Coins className="h-5 w-5 text-[#D1A24A]" />
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                    {[
                      leaderboard[1] ?? null,
                      leaderboard[0] ?? null,
                      leaderboard[2] ?? null,
                    ].map((entry, idx) => {
                      const slot = idx === 0 ? 2 : idx === 1 ? 1 : 3
                      const cardStyles =
                        slot === 1
                          ? 'border-[#B88A35]/45 bg-[#19170f] text-white min-h-[200px]'
                          : slot === 2
                          ? 'border-cyan-200/25 bg-[#101923] text-white min-h-[175px]'
                          : 'border-orange-300/25 bg-[#1a120f] text-white min-h-[175px]'
                      const chipStyles =
                        slot === 1
                          ? 'border-[#B88A35]/30 bg-[#0b0d12] text-[#e8c36b]'
                          : slot === 2
                          ? 'border-cyan-200/25 bg-[#0b0d12] text-cyan-100'
                          : 'border-orange-300/25 bg-[#0b0d12] text-orange-100'

                      return (
                        <motion.div
                          key={`podium-${slot}-${entry?.id ?? 'empty'}`}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="relative"
                        >
                          <div className={`relative border px-5 pb-6 pt-8 ${cardStyles}`}>
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                {entry?.avatar ? (
                                  <Image
                                    src={entry.avatar}
                                    alt={entry.username}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full border-2 border-[#0b0d12] object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0b0d12] bg-[#171d29] text-xs font-bold text-white">
                                    {entry?.username?.slice(0, 2).toUpperCase() ?? `#${slot}`}
                                  </div>
                                )}
                              </div>
                              <div className={`mx-auto inline-flex border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${chipStyles}`}>
                                {slot === 1 ? '1st place' : slot === 2 ? '2nd place' : '3rd place'}
                              </div>
                              <p className="mt-9 text-center font-orbitron text-2xl font-black leading-none">
                                {entry ? entry.xp.toLocaleString() : '0'}
                              </p>
                              <p className="mt-2 text-center text-sm font-semibold">
                                {entry?.username ?? 'Waiting'}
                              </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-4">
                    <AnimatedList
                      items={leaderboard.slice(3, 6)}
                      showGradients={false}
                      enableArrowNavigation={false}
                      displayScrollbar={false}
                      containerClassName="max-h-none overflow-visible p-0"
                      renderItem={(entry) => (
                        <div className="flex items-center justify-between border border-white/10 bg-[#10131a] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171d29] font-orbitron text-white">
                              {entry.rank}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-100">{entry.username}</p>
                              <p className="text-xs text-slate-500">{entry.wins} wins</p>
                            </div>
                          </div>
                          <p className="font-orbitron text-white">{entry.xp.toLocaleString()} XP</p>
                        </div>
                      )}
                    />
                  </div>
                </div>
                <Link href="/leaderboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                  View leaderboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <section className="border border-white/10 bg-[#121620] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-4 font-orbitron text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p>
    </section>
  )
}

function QuickAction({ href, title, copy }: { href: string; title: string; copy: string }) {
  return (
    <Link href={href} className="group block border border-white/10 bg-[#10131a] p-4 transition-colors hover:border-cyan-200/30 hover:bg-[#141923] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-orbitron text-base font-bold tracking-tight text-white sm:text-lg">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
        </div>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-cyan-200" />
      </div>
    </Link>
  )
}
