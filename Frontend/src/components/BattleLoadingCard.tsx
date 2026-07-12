'use client'

import { useEffect, useRef, useState } from 'react'
import lottie from 'lottie-web'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords } from 'lucide-react'

type LoadingPhase = 'connecting' | 'waiting' | 'countdown'

interface BattleLoadingCardProps {
  phase: LoadingPhase
  countdownSeconds?: number
  topic?: string
}

const phaseConfig = {
  connecting: {
    title: 'Preparing the Arena',
    subtitle: 'Connecting to battle servers...',
  },
  waiting: {
    title: 'Waiting for Challenger',
    subtitle: 'Another warrior must step up to face you',
  },
  countdown: {
    title: 'Battle is Starting',
    subtitle: 'Get your roast ready',
  },
}

export function BattleLoadingCard({ phase, countdownSeconds, topic }: BattleLoadingCardProps) {
  const animContainer = useRef<HTMLDivElement>(null)
  const animInstance = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null)
  const [animFailed, setAnimFailed] = useState(false)
  const config = phaseConfig[phase]

  useEffect(() => {
    if (!animContainer.current) return
    animInstance.current?.destroy()
    try {
      animInstance.current = lottie.loadAnimation({
        container: animContainer.current,
        path: '/animations/swords-attack.json',
        renderer: 'svg',
        loop: true,
        autoplay: true,
      })
      animInstance.current.addEventListener('data_failed', () => setAnimFailed(true))
    } catch {
      setAnimFailed(true)
    }
    return () => {
      animInstance.current?.destroy()
      animInstance.current = null
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass rounded-2xl mx-4 w-full max-w-sm border-l-4 border-l-amber-500/50 p-8 text-center"
      >
        <div className="mx-auto flex h-48 w-48 items-center justify-center">
          {animFailed ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Swords className="h-16 w-16 text-amber-400/60" />
            </motion.div>
          ) : (
            <div ref={animContainer} className="h-full w-full" />
          )}
        </div>

        <h2 className="mt-4 font-orbitron text-xl text-white sm:text-2xl">{config.title}</h2>

        {topic && (
          <p className="mt-2 text-sm text-amber-400/80 font-medium">{topic}</p>
        )}

        <AnimatePresence mode="wait">
          {phase === 'countdown' && countdownSeconds != null && (
            <motion.div
              key="countdown"
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-5"
            >
              <span className="font-orbitron text-6xl font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                {countdownSeconds}
              </span>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== 'countdown' && (
          <div className="mt-5 flex justify-center gap-2">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.75, repeat: Infinity, delay: dot * 0.14 }}
                className="h-2.5 w-2.5 rounded-full bg-amber-400/70"
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-xs uppercase tracking-[0.28em] text-white/35">{config.subtitle}</p>
      </motion.div>
    </motion.div>
  )
}
