'use client'

import { motion } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message: _message = 'Booting the arena...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      <div className="absolute inset-0 bg-[#020617]" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/20 bg-white/8">
          <BrandLogo size={56} className="rounded-full border-blue-300/30 bg-transparent" />
        </div>
      </motion.div>
      <div className="mt-4 flex gap-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.75, repeat: Infinity, delay: dot * 0.14 }}
            className="h-2.5 w-2.5 rounded-full bg-blue-300"
          />
        ))}
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.28em] text-white/35">Powered by Stellar testnet rails</p>
    </div>
  )
}

export function PageLoader({ message: _message = 'Loading data' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex gap-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            animate={{ y: [0, -8, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }}
            className="h-2.5 w-2.5 rounded-full bg-violet-300"
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
      <div className="space-y-4">
        <div className="h-4 w-2/3 rounded-full bg-white/10" />
        <div className="h-3 w-1/2 rounded-full bg-white/10" />
        <div className="h-28 rounded-2xl bg-white/10" />
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded-xl bg-white/10" />
          <div className="h-10 w-24 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  )
}
