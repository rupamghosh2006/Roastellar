'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight, Sparkles, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { FreighterConnectCard } from '@/components/FreighterConnectCard'
import { MiniGame } from '@/components/MiniGame'
import { WalletMintLoader } from '@/components/WalletMintLoader'
import { WalletReveal } from '@/components/WalletReveal'
import { apiRoutes, type Wallet } from '@/lib/api'
import { setOnboardingComplete } from '@/lib/utils'

type Step = 'choice' | 'welcome' | 'game' | 'minting' | 'complete' | 'existingWallet'

export default function OnboardingPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [step, setStep] = useState<Step>('choice')
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [freighterConnected, setFreighterConnected] = useState(false)

  const handleGameComplete = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in before creating your arena wallet.')
      router.push('/sign-in')
      return
    }

    setStep('minting')
    try {
      const token = await getToken({ skipCache: true })

      if (!token) {
        throw new Error('Missing Clerk session token')
      }

      const response = await apiRoutes.wallet.create(token ?? undefined)
      setWallet({
        ...response.data.wallet,
        isNew: !response.data.alreadyExists,
      })
    } catch (error) {
      console.error('Failed to create wallet during onboarding:', error)
      toast.error('We could not create your wallet yet. Please sign in again and retry.')
      setStep('welcome')
      return
    }
    setStep('complete')
  }

  const enterArena = () => {
    setOnboardingComplete()
    router.push('/dashboard')
  }

  const continueWithExistingWallet = () => {
    if (!freighterConnected) {
      toast.error('Please connect your Freighter wallet first.')
      return
    }

    setOnboardingComplete()
    if (isSignedIn) {
      router.push('/dashboard')
      return
    }

    toast.success('Freighter connected. You can add Google or email later from sign in.')
    router.push('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {step === 'choice' && (
            <motion.section
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-12"
            >
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  Are you new to Web3?
                </h1>
                <p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">
                  New users can get a managed wallet through our guided challenge. Existing Web3 users can connect Freighter directly.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setStep('welcome')}
                    className="rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-left transition-colors hover:bg-white/[0.08]"
                  >
                    <p className="font-orbitron text-xl text-white">Yes, I&apos;m new</p>
                    <p className="mt-3 text-sm leading-6 text-white/55">Create my wallet in Roastellar and continue with the current onboarding flow.</p>
                  </button>
                  <button
                    onClick={() => setStep('existingWallet')}
                    className="rounded-[24px] border border-blue-300/25 bg-blue-500/10 p-6 text-left transition-colors hover:bg-blue-500/20"
                  >
                    <p className="font-orbitron text-xl text-white">No, I have a wallet</p>
                    <p className="mt-3 text-sm leading-6 text-white/60">Connect Freighter now. Google or email can stay optional for this step.</p>
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {step === 'welcome' && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-12"
            >
              <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/18 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
                    <Sparkles className="h-4 w-4" />
                    First-time player flow
                  </div>
                  <h1 className="mt-6 font-orbitron text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
                    Welcome to Roastellar.
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                    Before entering the arena, complete your first challenge. You will unlock your wallet, reveal your starter balance,
                    and step into the product with momentum.
                  </p>
                  <button
                    onClick={() => setStep('game')}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-90 sm:mt-10 sm:w-auto"
                  >
                    Start Challenge
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setStep('choice')}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/85 sm:mt-4 sm:w-auto"
                  >
                    Back
                  </button>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 sm:rounded-[28px] sm:p-6 md:rounded-[32px]">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      { label: 'Target', value: '20 flames' },
                      { label: 'Timer', value: '15 seconds' },
                      { label: 'Reward', value: 'Wallet reveal' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[24px] sm:p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                        <p className="mt-3 font-orbitron text-xl text-white sm:text-2xl">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === 'existingWallet' && (
            <motion.section
              key="existingWallet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-10"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 text-center">
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/18 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
                    <WalletIcon className="h-4 w-4" />
                    Existing wallet flow
                  </div>
                  <h2 className="mt-5 font-orbitron text-2xl font-bold text-white sm:text-3xl">Connect your Freighter wallet</h2>
                  <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">
                    If you already use Web3, connect Freighter and continue. Google or email is optional during onboarding for this path.
                  </p>
                </div>

                <FreighterConnectCard
                  onConnected={(state) => {
                    setFreighterConnected(Boolean(state.connected))
                  }}
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={continueWithExistingWallet}
                    disabled={!freighterConnected}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue with Freighter
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setStep('choice')}
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/85"
                  >
                    Back
                  </button>
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
              className="glass rounded-[28px] p-4 sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="font-orbitron text-2xl font-bold text-white sm:text-3xl">Tap the Falling Flame</h2>
                <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">Catch 20 flames before time runs out. Demo mode is tuned so you always leave with a win.</p>
              </div>
              <MiniGame onComplete={handleGameComplete} />
            </motion.section>
          )}

          {step === 'minting' && (
            <motion.section
              key="minting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-3xl"
            >
              <WalletMintLoader />
            </motion.section>
          )}

          {step === 'complete' && wallet && (
            <WalletReveal
              wallet={wallet}
              onEnterArena={enterArena}
              onViewWallet={() => {
                setOnboardingComplete()
                router.push('/wallet')
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
