'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative"
      >
        <Flame className="w-20 h-20 text-primary" />
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Flame className="w-28 h-28 text-primary/30 blur-sm" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <p className="font-orbitron text-lg text-white/80">{message}</p>
        <div className="mt-4 flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8"
      >
        <p className="text-xs text-white/30">
          Powered by Stellar
        </p>
      </motion.div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl glass animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-white/10 rounded-lg w-1/2" />
        <div className="h-20 bg-white/10 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-8 bg-white/10 rounded-lg w-20" />
          <div className="h-8 bg-white/10 rounded-lg w-20" />
        </div>
      </div>
    </div>
  )
}