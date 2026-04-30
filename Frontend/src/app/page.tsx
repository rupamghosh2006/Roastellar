'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Coins, Flame, ShieldCheck, Swords, Trophy, Wallet } from 'lucide-react'
import { apiRoutes, type Battle, type LeaderboardEntry, type User } from '@/lib/api'
import { isOnboardingComplete } from '@/lib/utils'
import { isWalletAuthenticated } from '@/lib/walletAuth'
import { BrandLogo } from '@/components/BrandLogo'
import PrismaticTiltCard from '@/components/PrismaticTiltCard'

const features = [
  { icon: Swords, title: 'Live roast battles', copy: '' },
  { icon: Wallet, title: 'Wallets created for users', copy: '' },
  { icon: Coins, title: 'Reward-ready economy', copy: '' },
  { icon: ShieldCheck, title: 'Fintech-grade confidence', copy: '' },
]

const steps = [
  'Sign in and choose your path: create a managed Roastellar wallet or connect Freighter.',
  'Complete onboarding to activate your wallet mode and unlock battle-ready access.',
  'Create or join battles, submit roasts, vote, and climb the leaderboard for rewards.',
]

function GlitchWord({ text }: { text: string }) {
  return (
    <span className="hero-glitch">
      {Array.from(text).map((char, index) => {
        if (char === ' ') {
          return <span key={`space-${index}`} className="inline-block w-[0.42em]" aria-hidden="true" />
        }
        return (
          <span
            key={`${char}-${index}`}
            data-char={char}
            className="hero-glitch-char"
            style={{ transitionDelay: `${index * 26}ms` }}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}

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
              className="mx-auto mt-6 flex w-full max-w-5xl flex-col items-center"
            >
              {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-white/80">
                <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-orange-400/70 text-[8px] text-orange-300">*</span>
                Roast Prediction Arena
              </div> */}

              <div className="matrix-container mt-6">
                <div className="matrix-rain" />
                <h1
                  data-text="Roast Battle Earn."
                  className="matrix-text group cursor-default text-center uppercase transition-all duration-500 ease-out hover:text-[#b7ffb7]"
                  style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: 'clamp(2rem, 7vw, 5.8rem)',
                    letterSpacing: '0.06em',
                    lineHeight: 1.04,
                  }}
                >
                  <span className="block transition-all duration-500">
                    <GlitchWord text="Roast Battle" />
                  </span>
                  <span className="mt-2 block transition-all duration-500">
                    <GlitchWord text="Earn." />
                  </span>
                </h1>
              </div>
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

            <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
              {[
                { value: String(leaderboard.length), label: 'Ranked players' },
                { value: String(openBattles.length), label: 'Open battles now' },
                { value: `${totalPot.toFixed(2)} XLM`, label: 'Open prize pool' },
              ].map((stat) => (
                <PrismaticTiltCard key={stat.label} className="h-full" radius={16}>
                  <div className="glass h-full rounded-2xl border-l-2 border-l-violet-500/50 p-4">
                    <p className="font-orbitron text-2xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                </PrismaticTiltCard>
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
        {/* <p className="text-xs font-medium uppercase tracking-[0.38em] text-slate-500">
          How it works
        </p> */}

        <h2 className="mt-3 max-w-3xl font-orbitron text-4xl font-bold leading-tight text-white sm:text-5xl">
          Two wallet paths, one battle arena
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
        >
          <PrismaticTiltCard className="h-full" radius={24}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent opacity-70" />

              <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_45%)]" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
                <span className="font-orbitron text-lg font-bold text-white/90">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-6 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

              <p className="relative mt-6 text-lg leading-8 text-slate-200">
                {step}
              </p>

              <div className="relative mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                Step {index + 1}
              </div>
            </div>
          </PrismaticTiltCard>
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
                  className="h-full"
                >
                  <PrismaticTiltCard className="h-full" radius={16}>
                    <div className={`glass glass-hover h-full rounded-2xl border-l-4 p-6 ${borderColorClass}`}>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColorClass}`}>
                        <Icon className={`h-5 w-5 ${textColorClass}`} />
                      </div>
                      <h3 className="mt-6 font-orbitron text-xl text-white">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{feature.copy}</p>
                    </div>
                  </PrismaticTiltCard>
                </motion.div>
              )
            })}
          </div>
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


