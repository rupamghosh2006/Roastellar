'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame, MousePointer2, Sparkles, Target, Timer, Trophy, Zap } from 'lucide-react'
import { cn, GAME_CONFIG } from '@/lib/utils'

type GameState = 'idle' | 'countdown' | 'playing' | 'complete'

interface FlameTarget {
  id: number
  x: number
  size: number
  duration: number
  value: number
  isGolden: boolean
}

interface ScoreBurst {
  id: number
  x: number
  value: number
  isGolden: boolean
}

interface MiniGameProps {
  onComplete: (score: number) => void
}

const MAX_VISIBLE_FLAMES = 7
const COMBO_WINDOW_MS = 1200

export function MiniGame({ onComplete }: MiniGameProps) {
  const prefersReducedMotion = useReducedMotion()
  const [gameState, setGameState] = useState<GameState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.flameDuration)
  const [flames, setFlames] = useState<FlameTarget[]>([])
  const [combo, setCombo] = useState(0)
  const [bursts, setBursts] = useState<ScoreBurst[]>([])
  const flameIdRef = useRef(0)
  const burstIdRef = useRef(0)
  const caughtFlamesRef = useRef(new Set<number>())
  const comboRef = useRef(0)
  const lastCatchAtRef = useRef(0)

  const makeFlame = useCallback((): FlameTarget => {
    const isGolden = Math.random() > 0.82

    return {
      id: flameIdRef.current++,
      x: Math.random() * 80 + 8,
      size: Math.round(Math.random() * 16 + (isGolden ? 48 : 42)),
      duration: Number((Math.random() * 1.35 + (isGolden ? 4.1 : 3.45)).toFixed(2)),
      value: isGolden ? 2 : 1,
      isGolden,
    }
  }, [])

  const removeFlame = useCallback((id: number) => {
    setFlames((current) => current.filter((flame) => flame.id !== id))
  }, [])

  const beginRound = useCallback(() => {
    caughtFlamesRef.current = new Set()
    comboRef.current = 0
    lastCatchAtRef.current = 0
    setScore(0)
    setCombo(0)
    setBursts([])
    setTimeLeft(GAME_CONFIG.flameDuration)
    setFlames([])
    setCountdown(3)
    setGameState('countdown')
  }, [])

  const catchFlame = useCallback((flame: FlameTarget) => {
    if (gameState !== 'playing' || caughtFlamesRef.current.has(flame.id)) return

    caughtFlamesRef.current.add(flame.id)
    removeFlame(flame.id)

    const now = Date.now()
    const nextCombo = now - lastCatchAtRef.current <= COMBO_WINDOW_MS ? comboRef.current + 1 : 1
    comboRef.current = nextCombo
    lastCatchAtRef.current = now
    setCombo(nextCombo)

    const burst = {
      id: burstIdRef.current++,
      x: flame.x,
      value: flame.value,
      isGolden: flame.isGolden,
    }
    setBursts((current) => [...current, burst])
    window.setTimeout(() => {
      setBursts((current) => current.filter((item) => item.id !== burst.id))
    }, 650)

    setScore((current) => {
      const nextScore = current + flame.value
      if (nextScore >= GAME_CONFIG.flameTarget) setGameState('complete')
      return nextScore
    })
  }, [gameState, removeFlame])

  useEffect(() => {
    if (gameState !== 'countdown') return

    if (countdown === 0) {
      setFlames([makeFlame(), makeFlame(), makeFlame()])
      setGameState('playing')
      return
    }

    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 650)
    return () => window.clearTimeout(timer)
  }, [countdown, gameState, makeFlame])

  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnInterval = window.setInterval(() => {
      setFlames((current) => current.length >= MAX_VISIBLE_FLAMES ? current : [...current, makeFlame()])
    }, GAME_CONFIG.flameSpawnRate)

    return () => window.clearInterval(spawnInterval)
  }, [gameState, makeFlame])

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setGameState('complete')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return

    const comboTimer = window.setInterval(() => {
      if (lastCatchAtRef.current && Date.now() - lastCatchAtRef.current > COMBO_WINDOW_MS) {
        comboRef.current = 0
        setCombo(0)
      }
    }, 250)

    return () => window.clearInterval(comboTimer)
  }, [gameState])

  const progress = Math.min((score / GAME_CONFIG.flameTarget) * 100, 100)
  const timeProgress = (timeLeft / GAME_CONFIG.flameDuration) * 100
  const goalReached = score >= GAME_CONFIG.flameTarget

  return (
    <section
      aria-label="Flame catcher onboarding game"
      className="relative isolate h-[min(34rem,calc(100svh-10rem))] min-h-[28rem] w-full overflow-hidden rounded-2xl border border-orange-300/15 bg-[#080a12] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(251,146,60,0.3),transparent_32%),radial-gradient(circle_at_5%_100%,rgba(124,58,237,0.2),transparent_38%),linear-gradient(145deg,#10101d_0%,#070812_58%,#130b0a_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:2.5rem_2.5rem] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-500/10 to-transparent" />

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -9, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5 grid h-24 w-24 place-items-center rounded-[2rem] border border-orange-300/20 bg-orange-400/10 shadow-[0_0_46px_rgba(249,115,22,0.28)]"
            >
              <Flame className="h-12 w-12 fill-orange-400/20 text-orange-400" />
            </motion.div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Arena warm-up
            </div>
            <h3 className="font-orbitron text-2xl font-bold text-white sm:text-3xl">Catch the spark</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
              Tap every flame you can. Golden flames count twice, and a quick streak builds your multiplier. There&apos;s no fail state—this is your warm-up.
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2 text-left">
              {[
                { icon: Target, label: 'Goal', value: `${GAME_CONFIG.flameTarget} sparks` },
                { icon: Timer, label: 'Round', value: `${GAME_CONFIG.flameDuration}s` },
                { icon: Zap, label: 'Bonus', value: 'Golden ×2' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <Icon className="h-4 w-4 text-orange-300" />
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-100 sm:text-sm">{value}</p>
                </div>
              ))}
            </div>
            <button onClick={beginRound} className="btn-primary mt-7 min-w-48">
              Ignite the arena
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {gameState === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex h-full flex-col items-center justify-center text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-200">Flames incoming</p>
            <motion.p
              key={countdown}
              initial={{ opacity: 0, scale: 0.45 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 font-orbitron text-8xl font-black text-white [text-shadow:0_0_36px_rgba(249,115,22,0.7)]"
            >
              {countdown || 'GO'}
            </motion.p>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 h-full">
            <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-5">
              <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2.5 backdrop-blur sm:px-4">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-orange-300" /> Ignite meter</span>
                  <span className="text-orange-100">{score}/{GAME_CONFIG.flameTarget}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-300 to-cyan-300" />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2.5 text-right backdrop-blur sm:px-4">
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-300"><Timer className="h-3.5 w-3.5 text-cyan-300" /> {timeLeft}s</div>
                <div className="mt-2 h-1.5 w-16 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: `${timeProgress}%` }} className="block h-full rounded-full bg-cyan-300" /></div>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 flex items-end justify-between pointer-events-none sm:inset-x-5 sm:bottom-5">
              <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Streak</p>
                <p className={cn('font-orbitron text-xl font-bold transition-colors', combo >= 3 ? 'text-amber-300' : 'text-white')}>
                  {combo}× <span className="text-xs font-medium text-slate-400">combo</span>
                </p>
              </div>
              <p className="hidden max-w-40 text-right text-xs leading-5 text-slate-400 sm:block">Golden flares fill your meter twice as fast.</p>
            </div>

            {flames.map((flame) => (
              <motion.button
                key={flame.id}
                type="button"
                initial={{ y: -90, opacity: 0, scale: 0.7 }}
                animate={{ y: 650, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.25 }}
                transition={{ duration: prefersReducedMotion ? 6.5 : flame.duration, ease: 'linear' }}
                onAnimationComplete={() => removeFlame(flame.id)}
                onClick={() => catchFlame(flame)}
                aria-label={`Catch ${flame.isGolden ? 'golden ' : ''}flame worth ${flame.value} point${flame.value > 1 ? 's' : ''}`}
                className="group absolute z-10 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-90"
                style={{ left: `${flame.x}%` }}
              >
                <span className={cn('absolute inset-1 rounded-full blur-xl transition-opacity group-hover:opacity-100', flame.isGolden ? 'bg-amber-300/55 opacity-75' : 'bg-orange-500/40 opacity-45')} />
                <motion.span
                  animate={prefersReducedMotion ? undefined : { rotate: [-4, 5, -4], scale: [1, 1.11, 1] }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative grid place-items-center"
                >
                  <Flame
                    className={cn('drop-shadow-[0_0_14px_rgba(251,146,60,0.9)] transition-transform group-hover:scale-110', flame.isGolden ? 'fill-amber-200/45 text-amber-200' : 'fill-orange-500/20 text-orange-400')}
                    style={{ width: flame.size, height: flame.size }}
                  />
                  {flame.isGolden && <span className="absolute -right-3 -top-3 rounded-full border border-amber-100/40 bg-amber-300 px-1.5 py-0.5 text-[9px] font-black text-amber-950">×2</span>}
                </motion.span>
              </motion.button>
            ))}

            <AnimatePresence>
              {bursts.map((burst) => (
                <motion.span
                  key={burst.id}
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -62, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.62 }}
                  className={cn('pointer-events-none absolute z-30 font-orbitron text-lg font-black', burst.isGolden ? 'text-amber-200' : 'text-orange-200')}
                  style={{ left: `${burst.x}%`, top: '48%' }}
                >
                  +{burst.value}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { rotate: [-4, 4, -4], y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5 grid h-24 w-24 place-items-center rounded-[2rem] border border-amber-200/20 bg-amber-300/10 shadow-[0_0_48px_rgba(252,211,77,0.24)]"
            >
              {goalReached ? <Trophy className="h-12 w-12 text-amber-200" /> : <Flame className="h-12 w-12 fill-orange-400/20 text-orange-400" />}
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-200">Warm-up complete</p>
            <h3 className="mt-3 font-orbitron text-2xl font-bold text-white sm:text-3xl">{goalReached ? 'Arena spark achieved!' : 'The arena is lit!'}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">You caught <span className="font-bold text-orange-200">{score} sparks</span>{goalReached ? ' and hit your target.' : '. Your wallet is still ready to unlock.'}</p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-cyan-200/15 bg-cyan-300/10 px-5 py-3 text-cyan-100">
              <Zap className="h-5 w-5 text-cyan-200" />
              <span className="font-orbitron text-sm font-bold">+100 onboarding XP</span>
            </div>
            <button onClick={() => onComplete(score)} className="btn-primary mt-7 min-w-56">
              Unlock my wallet
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={beginRound} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
              <MousePointer2 className="h-3.5 w-3.5" />
              Play one more round
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function ChestRewardAnimation({ onComplete }: { onComplete?: () => void }) {
  const [state, setState] = useState<'closed' | 'opening' | 'opened'>('closed')

  useEffect(() => {
    const timer = setTimeout(() => setState('opening'), 500)
    const timer2 = setTimeout(() => {
      setState('opened')
      onComplete?.()
    }, 1500)
    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative w-32 h-32"
    >
      <motion.div
        animate={
          state === 'opening'
            ? { rotateY: [0, -120, -180] }
            : state === 'opened'
            ? { rotateY: -180 }
            : {}
        }
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <div className={cn(
          'w-full h-full rounded-2xl flex items-center justify-center',
          'bg-[#B88A35]/25',
          'border-2 border-accent/50',
          'transition-all duration-300',
          state === 'opened' && 'opacity-50'
        )}>
          <Trophy className={cn(
            'w-12 h-12 text-accent',
            state === 'opened' ? 'animate-pulse' : 'animate-bounce'
          )} />
        </div>
      </motion.div>

      {state === 'opened' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-bold">
            +100 XLM Reward!
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
