'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Flame, ArrowRight, Wallet, Sparkles, CheckCircle } from 'lucide-react'
import { MiniGame, ChestRewardAnimation } from '@/components/MiniGame'
import { WalletCard } from '@/components/WalletCard'
import { apiRoutes } from '@/lib/api'
import type { Wallet } from '@/lib/api'

type Step = 'welcome' | 'game' | 'reward' | 'complete'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [gameScore, setGameScore] = useState(0)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useAuth()
  const router = useRouter()

  const handleGameComplete = async (score: number) => {
    setGameScore(score)
    setStep('reward')
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchWallet()
  }

  const fetchWallet = async () => {
    setIsLoading(true)
    try {
      const response = await apiRoutes.wallet.me()
      setWallet(response.data)
      setStep('complete')
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
      setStep('complete')
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      await apiRoutes.onboarding.complete()
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Flame className="w-12 h-12 text-primary" />
                </div>
              </motion.div>

              <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome to <span className="text-gradient">Roastellar</span>
              </h1>

              <p className="text-xl text-white/60 mb-8 max-w-lg mx-auto">
                Before entering the arena, complete your first challenge
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setStep('game')}
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
                >
                  Start Challenge
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto text-center">
                {[
                  { label: 'Time', value: '15s' },
                  { label: 'Target', value: '20 pts' },
                  { label: 'Reward', value: '100 XLM' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl glass">
                    <p className="font-orbitron text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="text-center mb-6">
                <h2 className="font-orbitron text-2xl font-bold text-white mb-2">
                  Tap the Falling Flame
                </h2>
                <p className="text-white/60">Catch 20 flames before time runs out!</p>
              </div>
              <MiniGame onComplete={handleGameComplete} />
            </motion.div>
          )}

          {step === 'reward' && (
            <motion.div
              key="reward"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="mb-8"
              >
                <ChestRewardAnimation />
              </motion.div>

              <h2 className="font-orbitron text-3xl font-bold text-white mb-4">
                Challenge Complete!
              </h2>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-orbitron text-xl font-bold text-accent">+100 XP</span>
                </div>
              </div>

              <div className="animate-pulse">
                <p className="text-white/60">Creating your wallet...</p>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="inline-block mb-8"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
              </motion.div>

              <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">
                Wallet Created!
              </h2>

              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Your Stellar wallet has been created and funded with testnet XLM
              </p>

              {wallet && (
                <div className="mb-8 flex justify-center">
                  <WalletCard
                    address={wallet.address}
                    balance={wallet.balance}
                    variant="full"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={completeOnboarding}
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
                >
                  Enter Arena
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/wallet')}
                  className="px-8 py-4 rounded-xl glass text-white/80 font-medium text-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  View Wallet
                </button>
              </div>

              <div className="mt-12 p-4 rounded-xl glass max-w-md mx-auto">
                <p className="text-sm text-white/50">
                  Your wallet address is stored securely and can be accessed from the Wallet page
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}