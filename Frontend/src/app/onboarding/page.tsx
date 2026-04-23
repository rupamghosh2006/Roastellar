'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Flame, Sparkles, Wallet as WalletIcon } from 'lucide-react'
import { MiniGame, ChestRewardAnimation } from '@/components/MiniGame'
import { WalletCard } from '@/components/WalletCard'
import { apiRoutes, type Wallet } from '@/lib/api'
import { setOnboardingComplete } from '@/lib/utils'

type Step = 'welcome' | 'game' | 'reward' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)

  const handleGameComplete = async () => {
    setStep('reward')
    setIsLoadingWallet(true)
    try {
      const response = await apiRoutes.wallet.me()
      setWallet(response.data)
    } catch (error) {
      console.error('Failed to fetch wallet during onboarding:', error)
    } finally {
      setIsLoadingWallet(false)
      setStep('complete')
    }
  }

  const enterArena = async () => {
    setOnboardingComplete()
    try {
      await apiRoutes.onboarding.complete()
    } catch (error) {
      console.error('Failed to persist onboarding state:', error)
    }
    router.push('/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[40px] p-8 md:p-12"
            >
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/18 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
                    <Sparkles className="h-4 w-4" />
                    First-time player flow
                  </div>
                  <h1 className="mt-6 font-orbitron text-4xl font-black text-white md:text-6xl">
                    Welcome to Roastellar.
                  </h1>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-white/60">
                    Before entering the arena, complete your first challenge. You will unlock your wallet, reveal your starter balance,
                    and step into the product with momentum.
                  </p>
                  <button
                    onClick={() => setStep('game')}
                    className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-90"
                  >
                    Start Challenge
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      { label: 'Target', value: '20 flames' },
                      { label: 'Timer', value: '15 seconds' },
                      { label: 'Reward', value: 'Wallet reveal' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                        <p className="mt-3 font-orbitron text-2xl text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === 'game' && (
            <motion.section
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-[40px] p-6 md:p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="font-orbitron text-3xl font-bold text-white">Tap the Falling Flame</h2>
                <p className="mt-3 text-white/55">Catch 20 flames before time runs out. Demo mode is tuned so you always leave with a win.</p>
              </div>
              <MiniGame onComplete={handleGameComplete} />
            </motion.section>
          )}

          {step === 'reward' && (
            <motion.section
              key="reward"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[40px] p-8 text-center"
            >
              <div className="mx-auto max-w-lg">
                <ChestRewardAnimation />
                <h2 className="mt-8 font-orbitron text-4xl font-bold text-white">Challenge Complete!</h2>
                <p className="mt-4 text-white/55">
                  {isLoadingWallet ? 'Opening your reward chest and preparing your Stellar wallet...' : 'Reward unlocked.'}
                </p>
              </div>
            </motion.section>
          )}

          {step === 'complete' && (
            <motion.section
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[40px] p-8 md:p-12"
            >
              <div className="mx-auto max-w-4xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10">
                  <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                </div>
                <h2 className="mt-8 font-orbitron text-4xl font-bold text-white md:text-5xl">Wallet Created Successfully</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/58">
                  Your onboarding wallet is live. You now have a funded Stellar testnet identity inside Roastellar and can enter the arena immediately.
                </p>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                  <WalletCard
                    address={wallet?.address ?? 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
                    balance={wallet?.balance ?? 100}
                    variant="full"
                  />

                  <div className="space-y-4 text-left">
                    {[
                      { icon: WalletIcon, title: 'Public Address', value: wallet?.address ?? 'Connected and stored' },
                      { icon: Flame, title: 'Testnet XLM Received', value: `${wallet?.balance ?? 100} XLM ready` },
                      { icon: Sparkles, title: 'Powered by Stellar', value: 'Fast settlement rails for every reward loop' },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                              <Icon className="h-5 w-5 text-blue-200" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.title}</p>
                              <p className="mt-1 break-all text-sm text-white/72">{item.value}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    onClick={enterArena}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950"
                  >
                    Enter Arena
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setOnboardingComplete()
                      router.push('/wallet')
                    }}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-medium text-white/85"
                  >
                    View Wallet
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
