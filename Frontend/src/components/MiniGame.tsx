'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

interface Flame {
  id: number
  x: number
  timestamp: number
}

export function MiniGame({
  onComplete,
  targetScore = 20,
}: {
  onComplete: (score: number) => void
  targetScore?: number
}) {
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(15)
  const [flames, setFlames] = useState<Flame[]>([])
  const [nextId, setNextId] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  // Timer
  useEffect(() => {
    if (gameOver || timeRemaining === 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev - 1 === 0) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, timeRemaining])

  // Spawn flames
  useEffect(() => {
    if (gameOver) return

    const spawner = setInterval(() => {
      const newFlame: Flame = {
        id: nextId,
        x: Math.random() * 80 + 10,
        timestamp: Date.now(),
      }
      setFlames((prev) => [...prev, newFlame])
      setNextId((prev) => prev + 1)
    }, 600)

    return () => clearInterval(spawner)
  }, [gameOver, nextId])

  // Auto-remove flames after animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlames((prev) =>
        prev.filter((flame) => Date.now() - flame.timestamp < 3000)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleFlameClick = useCallback(
    (id: number) => {
      setFlames((prev) => prev.filter((f) => f.id !== id))
      const newScore = score + 1
      const newCombo = combo + 1
      setScore(newScore)
      setCombo(newCombo)

      if (newScore >= targetScore) {
        setGameOver(true)
      }
    },
    [score, combo, targetScore]
  )

  if (gameOver && score >= targetScore) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mb-6"
        >
          <div className="text-6xl mb-4">🎉</div>
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>
        <p className="text-xl text-muted-foreground mb-6">
          Final Score: {score}/{targetScore}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(score)}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
        >
          Continue to Wallet
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Score</div>
          <div className="text-3xl font-bold">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Combo</div>
          <motion.div
            className="text-3xl font-bold text-accent"
            animate={combo > 0 ? { scale: [1, 1.2, 1] } : {}}
          >
            {combo}x
          </motion.div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Time</div>
          <motion.div
            className={`text-3xl font-bold ${
              timeRemaining <= 5 ? 'text-destructive' : 'text-primary'
            }`}
            animate={timeRemaining <= 5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {timeRemaining}s
          </motion.div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-full h-[500px] rounded-lg border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
        {/* Target indicator */}
        <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-accent/20 text-sm font-medium">
          Target: {targetScore}
        </div>

        {/* Falling Flames */}
        <AnimatePresence>
          {flames.map((flame) => (
            <motion.button
              key={flame.id}
              initial={{ y: -100, x: `${flame.x}%` }}
              animate={{ y: 500 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              onClick={() => handleFlameClick(flame.id)}
              className="absolute w-12 h-12 cursor-pointer focus:outline-none"
              style={{ left: `${flame.x}%` }}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className="w-full h-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl drop-shadow-lg"
                >
                  🔥
                </motion.div>
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Game Over - Did Not Win */}
        {gameOver && score < targetScore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-muted-foreground mb-4">
                Don&apos;t worry, you still get your wallet!
              </p>
              <p className="text-xl font-semibold mb-6">Final Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(score)}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Continue to Wallet
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-muted-foreground mt-6 text-sm">
        Click the falling flames to collect points. You have {timeRemaining} seconds!
      </p>
    </div>
  )
}
