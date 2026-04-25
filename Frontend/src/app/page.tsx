'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Flame, ShieldCheck, Sparkles, Swords, Trophy, Wallet } from 'lucide-react'
import { apiRoutes, type Battle, type LeaderboardEntry, type User } from '@/lib/api'
import { isOnboardingComplete } from '@/lib/utils'

const features = [
  { icon: Swords, title: 'Live roast battles', copy: 'Fast-paced match rooms with real-time submissions, votes, and reactions.' },
  { icon: Wallet, title: 'Wallets created for users', copy: 'Every player gets a Stellar wallet experience baked directly into onboarding.' },
  { icon: Coins, title: 'Reward-ready economy', copy: 'Predict outcomes, win contests, and track rewards without leaving the app.' },
  { icon: ShieldCheck, title: 'Fintech-grade confidence', copy: 'A dark, premium UI built to make the product feel investable and real.' },
]

const steps = [
  'Sign in with Clerk and enter the arena in seconds.',
  'Beat the onboarding mini-game to reveal your new Stellar wallet.',
  'Join battles, vote on winners, and climb the leaderboard.',
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [openBattles, setOpenBattles] = useState<Battle[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!isSignedIn) return
    router.replace(isOnboardingComplete() ? '/dashboard' : '/onboarding')
  }, [isSignedIn, router])

  useEffect(() => {
    Promise.allSettled([apiRoutes.battles.open(), apiRoutes.users.leaderboard()]).then(([battlesResult, leaderboardResult]) => {
      if (battlesResult.status === 'fulfilled') {
        setOpenBattles(battlesResult.value.data)
      }

      if (leaderboardResult.status === 'fulfilled') {
        setLeaderboard(leaderboardResult.value.data)
      }
    })
  }, [])

  const featuredBattle = useMemo(() => {
    if (openBattles.length === 0) {
      return null
    }
    return [...openBattles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }, [openBattles])

  const featuredPlayers = useMemo(
    () => [featuredBattle?.player1, featuredBattle?.player2].filter((player): player is User => Boolean(player)),
    [featuredBattle]
  )

  const totalSpectators = useMemo(() => openBattles.reduce((sum, battle) => sum + battle.spectators, 0), [openBattles])
  const totalVotes = useMemo(
    () => openBattles.reduce((sum, battle) => sum + battle.player1Votes + battle.player2Votes, 0),
    [openBattles]
  )
  const totalPot = useMemo(() => openBattles.reduce((sum, battle) => sum + battle.pot, 0), [openBattles])
  const topLeaderboard = leaderboard.slice(0, 3)

  const arenaSignals = useMemo(() => {
    const signals: string[] = []
    if (featuredBattle) {
      signals.push(`Latest open topic: "${featuredBattle.topic}"`)
    }
    if (leaderboard[0]) {
      signals.push(`${leaderboard[0].username} is leading with ${leaderboard[0].xp.toLocaleString()} XP.`)
    }
    if (openBattles.length > 0) {
      signals.push(`${openBattles.length} open battles are available in the arena right now.`)
    }
    if (signals.length === 0) {
      signals.push('Live arena signals will appear as soon as battles and leaderboard activity starts.')
    }
    return signals
  }, [featuredBattle, leaderboard, openBattles.length])

  return (
    <main className="overflow-hidden pt-16">
      <section className="relative px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.08),transparent_32%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/18 bg-blue-500/10 px-4 py-2 text-sm text-blue-100"
            >
              <Sparkles className="h-4 w-4" />
              Built for social competition on Stellar
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6 max-w-3xl font-orbitron text-5xl font-black leading-tight text-white md:text-7xl"
            >
              Roast. Battle. <span className="text-gradient">Earn.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-white/60"
            >
              Roastellar turns competitive social banter into a premium multiplayer experience with live battles,
              instant wallet onboarding, spectator predictions, and reward-ready Stellar rails.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-90"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-medium text-white/85 transition-colors hover:bg-white/[0.08]"
              >
                Watch Demo
              </a>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { value: String(leaderboard.length), label: 'Ranked players' },
                { value: String(openBattles.length), label: 'Open battles now' },
                { value: `${totalPot.toFixed(2)} XLM`, label: 'Open prize pool' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-[24px] p-4">
                  <p className="font-orbitron text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18 }}
            className="relative"
          >
            <div className="glass glow-primary rounded-[36px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">Live Match Preview</p>
                  <p className="mt-2 font-orbitron text-2xl text-white">{featuredBattle?.topic ?? 'No live battle yet'}</p>
                </div>
                <div className="rounded-full bg-emerald-400/14 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  {featuredBattle ? featuredBattle.status.toUpperCase() : 'IDLE'}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(featuredPlayers.length ? featuredPlayers : [null, null]).slice(0, 2).map((player, index) => (
                  <div key={player?.id ?? `slot-${index}`} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 ? 'bg-blue-500/16' : 'bg-violet-500/16'}`}>
                        <Flame className={`h-6 w-6 ${index === 0 ? 'text-blue-300' : 'text-violet-300'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{player?.username ?? 'Waiting for player'}</p>
                        <p className="text-sm text-white/45">
                          {player ? `${player.wins} wins | ${player.xp.toLocaleString()} XP` : 'Seat is still open'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/72">
                      {index === 0
                        ? featuredBattle?.roast1 || 'Roast will appear here when the first player submits.'
                        : featuredBattle?.roast2 || 'Roast will appear here when the second player submits.'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Spectators', value: totalSpectators.toLocaleString() },
                  { label: 'Votes', value: totalVotes.toLocaleString() },
                  { label: 'Pot', value: `${totalPot.toFixed(2)} XLM` },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                    <p className="mt-2 font-orbitron text-2xl text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-blue-200/70">How it works</p>
              <h2 className="mt-3 font-orbitron text-4xl font-bold text-white">One flow from sign-up to reward</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/50">
              The first-time user experience is engineered to feel magical: account, challenge, wallet, and arena access in one progression.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass rounded-[32px] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 font-orbitron text-xl text-white">
                  {index + 1}
                </div>
                <p className="mt-6 text-lg leading-8 text-white/78">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass glass-hover rounded-[32px] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/14 to-violet-500/12">
                    <Icon className="h-5 w-5 text-blue-200" />
                  </div>
                  <h3 className="mt-6 font-orbitron text-xl text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/50">{feature.copy}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="leaderboard-preview" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-amber-200/80">Leaderboard preview</p>
              <h2 className="mt-3 font-orbitron text-4xl font-bold text-white">Competitive by default</h2>
            </div>
            <Link href="/sign-up" className="text-sm font-semibold text-blue-200 hover:text-blue-100">
              Join the leaderboard
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {topLeaderboard.length > 0 ? topLeaderboard.map((entry, index) => (
              <div key={entry.id} className="glass rounded-[28px] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 font-orbitron text-white">
                    {index + 1}
                  </div>
                  <Trophy className="h-5 w-5 text-amber-200" />
                </div>
                <p className="mt-5 font-orbitron text-2xl text-white">{entry.username}</p>
                <p className="mt-2 text-sm text-white/50">{entry.xp.toLocaleString()} XP</p>
                <div className="mt-4 rounded-full bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/45">
                  {entry.wins} wins
                </div>
              </div>
            )) : (
              <div className="glass rounded-[28px] p-5 text-white/65">
                Leaderboard data will show here once players start competing.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {arenaSignals.slice(0, 3).map((signal) => (
            <div key={signal} className="glass rounded-[32px] p-6 text-white/70">
              <p className="text-lg leading-8">{signal}</p>
              <p className="mt-6 text-sm uppercase tracking-[0.28em] text-white/35">Arena Signal</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-white/70">
            <Flame className="h-5 w-5 text-blue-300" />
            Roastellar
          </div>
          <p>Gaming energy. Fintech confidence. Stellar-native rewards.</p>
        </div>
      </footer>
    </main>
  )
}
