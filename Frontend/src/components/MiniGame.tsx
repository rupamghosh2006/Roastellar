'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, Trophy, Timer } from 'lucide-react'
import { cn, GAME_CONFIG } from '@/lib/utils'

interface FlamePosition {
  id: number
  x: number
  y: number
  size: number
  speed: number
  delay: number
}

interface MiniGameProps {
  onComplete: (score: number) => void
  onSkip?: () => void
}

export function MiniGame({ onComplete, onSkip }: MiniGameProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.flameDuration)
  const [flames, setFlames] = useState<FlamePosition[]>([])
  const [combo, setCombo] = useState(0)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const flameIdRef = useRef(0)
  const particleIdRef = useRef(0)

  const spawnFlame = useCallback(() => {
    const newFlame: FlamePosition = {
      id: flameIdRef.current++,
      x: Math.random() * 80 + 10,
      y: -10,
      size: Math.random() * 20 + 40,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 0.5,
    }
    setFlames((prev) => [...prev, newFlame])
  }, [])

  const removeFlame = useCallback((id: number) => {
    setFlames((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const catchFlame = useCallback((flame: FlamePosition, event: React.MouseEvent) => {
    event.stopPropagation()
    if (gameState !== 'playing') return

    setScore((prev) => prev + 1)
    setCombo((prev) => prev + 1)

    const newParticles = Array.from({ length: 8 }, () => ({
      id: particleIdRef.current++,
      x: flame.x,
      y: flame.y,
    }))
    setParticles((prev) => [...prev, ...newParticles])

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1000)

    removeFlame(flame.id)

    if (score + 1 >= GAME_CONFIG.flameTarget) {
      setGameState('won')
      onComplete(score + 1)
    }
  }, [gameState, score, onComplete, removeFlame])

  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnInterval = setInterval(() => {
      if (flames.length < 8) {
        spawnFlame()
      }
    }, GAME_CONFIG.flameSpawnRate)

    return () => clearInterval(spawnInterval)
  }, [gameState, flames.length, spawnFlame])

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState('won')
          onComplete(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, score, onComplete])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(GAME_CONFIG.flameDuration)
    setCombo(0)
    setFlames([])
  }

  const progress = (score / GAME_CONFIG.flameTarget) * 100

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden glass">
      <AnimatePresence>
        {gameState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <Flame className="w-20 h-20 text-primary animate-pulse-glow" />
            </motion.div>
            <h2 className="font-orbitron text-2xl font-bold text-white mb-4 text-center">
              Tap the Falling Flame
            </h2>
            <p className="text-white/60 text-center mb-6 max-w-md">
              Catch {GAME_CONFIG.flameTarget} flames before time runs out!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity glow-primary"
            >
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'playing' && (
          <>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                  <Timer className="w-5 h-5 text-secondary" />
                  <span className="font-orbitron font-bold text-white">{timeLeft}s</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-orbitron font-bold text-white">{score}/{GAME_CONFIG.flameTarget}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                <Flame className={cn('w-5 h-5', combo >= 3 ? 'text-accent animate-pulse' : 'text-white/50')} />
                <span className="font-orbitron font-bold text-white">{combo}x</span>
              </div>
            </div>

            <div className="absolute top-16 left-4 right-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>

            {flames.map((flame) => (
              <motion.button
                key={flame.id}
                initial={{ y: '-10%', x: `${flame.x}%`, opacity: 0 }}
                animate={{ y: '110%', x: `${flame.x}%`, opacity: 1 }}
                transition={{
                  duration: flame.speed * 3,
                  delay: flame.delay,
                  ease: 'linear',
                }}
                onClick={(e) => catchFlame(flame, e)}
                className="absolute w-16 h-16 flex items-center justify-center cursor-pointer"
                style={{ left: `${flame.x}%` }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <Flame
                    className="text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] hover:text-accent transition-colors"
                    style={{ width: flame.size, height: flame.size }}
                  />
                </motion.div>
              </motion.button>
            ))}

            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 1, x: particle.x, y: particle.y }}
                animate={{ opacity: 0, scale: 0, y: particle.y - 100 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute w-2 h-2 rounded-full bg-accent"
                style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="mb-6"
            >
              <Trophy className="w-24 h-24 text-accent glow-gold" />
            </motion.div>
            <h2 className="font-orbitron text-3xl font-bold text-white mb-2 text-center">
              Challenge Complete!
            </h2>
            <p className="text-white/60 text-center mb-4">
              You caught {score} flames!
            </p>
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass">
              <Zap className="w-6 h-6 text-accent" />
              <span className="font-orbitron text-xl font-bold text-accent">+100 XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
          'bg-gradient-to-br from-accent/40 to-amber-600/30',
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