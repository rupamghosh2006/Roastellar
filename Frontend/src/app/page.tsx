'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Flame, ShieldCheck, Swords, Trophy, Wallet } from 'lucide-react'
import { apiRoutes, type Battle, type LeaderboardEntry, type User } from '@/lib/api'
import { isOnboardingComplete } from '@/lib/utils'
import { isWalletAuthenticated } from '@/lib/walletAuth'
import { BrandLogo } from '@/components/BrandLogo'
import TextPressure from '@/components/TextPressure'

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
    if (!isSignedIn && !isWalletAuthenticated()) return
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
      <section className="relative px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.15)_0%,transparent_70%)]" />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16">
          <div className="w-full max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-6 w-full max-w-5xl"
            >
              <TextPressure
                text="Roast Battle Earn"
                textColor="#f8fafc"
                minFontSize={52}
                width
                weight
                italic
                alpha={false}
                flex
                scale={false}
                className="font-orbitron tracking-tight"
              />
            </motion.div>

            {/* <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/60"
            >
              Roastellar turns competitive social banter into a premium multiplayer experience with live battles,
              instant wallet onboarding, spectator predictions, and reward-ready Stellar rails.
            </motion.p> */}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border-2 border-[#725AC1] bg-transparent px-[30px] py-[15px] text-[18px] font-medium tracking-[1px] text-[#725AC1] transition-all duration-500 ease-out [box-shadow:inset_0_0_0_0_#725AC1] hover:text-white hover:[box-shadow:inset_0_-100px_0_0_#725AC1] active:scale-90"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-3 transition-all duration-200"
              >
                Watch Demo
              </a> */}
            </motion.div>

            <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
              {[
                { value: String(leaderboard.length), label: 'Ranked players' },
                { value: String(openBattles.length), label: 'Open battles now' },
                { value: `${totalPot.toFixed(2)} XLM`, label: 'Open prize pool' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4 border-l-2 border-l-violet-500/50">
                  <p className="font-orbitron text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18 }}
            className="relative mt-8 w-full max-w-5xl"
          >
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/88 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.6)] backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
  <div className="space-y-3">
    {/* Premium Badge */}
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-gradient-to-r from-emerald-500/12 via-emerald-400/8 to-transparent px-4 py-1.5 shadow-[0_0_18px_rgba(16,185,129,0.12)] backdrop-blur-xl">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60"></span>
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
      </span>

      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-300">
        Live Match Preview
      </p>
    </div>

    {/* Title */}
    <div className="space-y-1">
      <p className="font-orbitron text-2xl font-semibold leading-tight text-white">
        {featuredBattle?.topic ?? "No live battle yet"}
      </p>

      <p className="text-sm text-slate-400">
        Real-time arena status and battle readiness
      </p>
    </div>
  </div>

  {/* Status Chip */}
  <div
    className={`relative overflow-hidden rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] backdrop-blur-xl transition-all ${
      featuredBattle?.status === "active"
        ? "border-orange-400/30 bg-orange-500/10 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.14)]"
        : featuredBattle?.status === "voting"
        ? "border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(168,85,247,0.14)]"
        : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)]"
    }`}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></span>
    <span className="relative">
      {featuredBattle ? featuredBattle.status.toUpperCase() : "IDLE"}
    </span>
  </div>
</div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(featuredPlayers.length ? featuredPlayers : [null, null]).slice(0, 2).map((player, index) => (
                  <div key={player?.id ?? `slot-${index}`} className={`rounded-2xl border p-5 ${
                    index === 0
                      ? 'border-orange-500/45 bg-slate-900/75'
                      : 'border-violet-500/40 bg-slate-900/75'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        index === 0
                          ? 'border-orange-500/35 bg-orange-500/15'
                          : 'border-violet-500/35 bg-violet-500/15'
                      }`}>
                        <Flame className={`h-6 w-6 ${index === 0 ? 'text-orange-400' : 'text-violet-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{player?.username ?? 'Waiting for player'}</p>
                        <p className="text-sm text-slate-300">
                          {player ? `${player.wins} wins | ${player.xp.toLocaleString()} XP` : 'Seat is still open'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-slate-700/70 bg-slate-950/70 p-4 text-sm leading-7 text-slate-200">
                      {index === 0
                        ? featuredBattle?.roast1 || 'Roast will appear here when the first player submits.'
                        : featuredBattle?.roast2 || 'Roast will appear here when the second player submits.'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Spectators', value: totalSpectators.toLocaleString(), color: 'cyan' },
                  { label: 'Votes', value: totalVotes.toLocaleString(), color: 'orange' },
                  { label: 'Pot', value: `${totalPot.toFixed(2)} XLM`, color: 'violet' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border bg-slate-900/78 p-4 ${
                    item.color === 'cyan' ? 'border-cyan-500/40' : 
                    item.color === 'orange' ? 'border-orange-500/40' : 
                    'border-violet-500/40'
                  }`}>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-2 font-orbitron text-2xl font-semibold text-slate-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

     <section
  id="how-it-works"
  className="relative px-4 py-24 sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-7xl">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.38em] text-slate-500">
          How it works
        </p>

        <h2 className="mt-3 max-w-3xl font-orbitron text-4xl font-bold leading-tight text-white sm:text-5xl">
          One flow from sign-up to reward
        </h2>
      </div>

    </motion.div>

    {/* Cards */}
    <div className="mt-14 grid gap-6 lg:grid-cols-3">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{
            duration: 0.55,
            delay: index * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ y: -6, scale: 1.015 }}
          className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
        >
          {/* subtle shine */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent opacity-70" />

          {/* soft hover glow */}
          <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_45%)]" />

          {/* Number */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
            <span className="font-orbitron text-lg font-bold text-white/90">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Divider */}
          <div className="relative mt-6 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

          {/* Content */}
          <p className="relative mt-6 text-lg leading-8 text-slate-200">
            {step}
          </p>

          {/* footer accent */}
          <div className="relative mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            Step {index + 1}
          </div>
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
              const accentColors = ['orange', 'violet', 'cyan', 'emerald'];
              const accentColor = accentColors[index % accentColors.length];
              const bgColorClass = {
                orange: 'bg-orange-500/10',
                violet: 'bg-violet-500/10',
                cyan: 'bg-cyan-500/10',
                emerald: 'bg-emerald-500/10',
              }[accentColor];
              const textColorClass = {
                orange: 'text-orange-300',
                violet: 'text-violet-300',
                cyan: 'text-cyan-300',
                emerald: 'text-emerald-300',
              }[accentColor];
              const borderColorClass = {
                orange: 'border-l-orange-500/30',
                violet: 'border-l-violet-500/30',
                cyan: 'border-l-cyan-500/30',
                emerald: 'border-l-emerald-500/30',
              }[accentColor];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className={`glass glass-hover rounded-2xl p-6 border-l-4 ${borderColorClass}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColorClass}`}>
                    <Icon className={`h-5 w-5 ${textColorClass}`} />
                  </div>
                  <h3 className="mt-6 font-orbitron text-xl text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.copy}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="leaderboard-preview" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl border border-white/8 p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Leaderboard preview</p>
              <h2 className="mt-3 font-orbitron text-4xl font-bold text-white">Competitive by default</h2>
            </div>
            <Link href="/onboarding" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Join the leaderboard →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {topLeaderboard.length > 0 ? topLeaderboard.map((entry, index) => {
              const rankColors = ['bg-yellow-500/10 border-l-yellow-500/40', 'bg-gray-500/10 border-l-gray-400/40', 'bg-orange-600/10 border-l-orange-700/40'];
              const rankBg = rankColors[index];
              const rankTextColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400';
              return (
              <div key={entry.id} className={`glass rounded-xl p-5 border-l-4 ${rankBg}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full font-orbitron text-white font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                    index === 1 ? 'bg-gray-500/20 text-gray-300' :
                    'bg-orange-600/20 text-orange-300'
                  }`}>
                    #{index + 1}
                  </div>
                  <Trophy className={`h-5 w-5 ${rankTextColor}`} />
                </div>
                <p className="mt-5 font-orbitron text-2xl text-white">{entry.username}</p>
                <p className="mt-2 text-sm text-slate-400">{entry.xp.toLocaleString()} XP</p>
                <div className="mt-4 chip-fire">
                  {entry.wins} wins
                </div>
              </div>
            )}) : (
              <div className="glass rounded-xl p-5 text-slate-400">
                Leaderboard data will show here once players start competing.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {arenaSignals.slice(0, 3).map((signal, idx) => {
            const signalColors = ['border-l-orange-500/40', 'border-l-violet-500/40', 'border-l-cyan-500/40'];
            return (
            <div key={signal} className={`glass rounded-xl p-6 text-slate-300 border-l-4 ${signalColors[idx]}`}>
              <p className="text-lg leading-8">{signal}</p>
              <p className="mt-6 text-sm uppercase tracking-[0.28em] text-slate-500">Arena Signal</p>
            </div>
          )})}
        </div>
      </section>

      <footer className="border-t border-white/8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <BrandLogo size={20} className="rounded-md border-orange-400/30" />
            Roastellar
          </div>
          <p>Gaming energy. Fintech confidence. Stellar-native rewards.</p>
        </div>
      </footer>
    </main>
  )
}

