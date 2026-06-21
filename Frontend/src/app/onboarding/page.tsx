'use client'

import { useEffect, useState } from 'react'
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
import { getFreighterState, signFreighterMessage } from '@/lib/freighter'
import { setOnboardingComplete } from '@/lib/utils'
import { setWalletAuthSession } from '@/lib/walletAuth'

type Step = 'choice' | 'welcome' | 'game' | 'minting' | 'complete' | 'existingWallet'

export default function OnboardingPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [step, setStep] = useState<Step>('choice')
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [freighterConnected, setFreighterConnected] = useState(false)
  const [freighterAddress, setFreighterAddress] = useState<string | null>(null)

  const handleGameComplete = async () => {
    if (!isSignedIn) {
      toast.error('Please sign up before creating your arena wallet.')
      router.push('/sign-up?redirect_url=/onboarding?flow=new')
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

  const continueWithExistingWallet = async () => {
    const liveState = await getFreighterState()
    const effectiveAddress = (liveState.address || freighterAddress || '').trim()

    if (!liveState.connected || !effectiveAddress) {
      toast.error('Freighter is not connected with a valid wallet address. Reconnect and try again.')
      return
    }

    try {
      const challenge = await apiRoutes.auth.walletChallenge({
        walletAddress: effectiveAddress,
      })

      const signed = await signFreighterMessage(challenge.data.challenge, effectiveAddress)
      if (signed.error || !signed.signedMessage) {
        throw new Error(signed.error || 'Freighter signature was empty')
      }

      const verified = await apiRoutes.auth.walletVerify({
        walletAddress: effectiveAddress,
        nonce: challenge.data.nonce,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress || effectiveAddress,
      })

      setWalletAuthSession(verified.data.token, effectiveAddress)
      setOnboardingComplete()
      toast.success('Freighter connected. Wallet identity unlocked.')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Wallet login failed:', error)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to start wallet session. Please try again.'
      toast.error(message)
    }
  }

  const startNewUserFlow = () => {
    if (!isSignedIn) {
      router.push('/sign-up?redirect_url=/onboarding?flow=new')
      return
    }
    setStep('game')
  }

  useEffect(() => {
    const flow = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('flow')
      : null
    if (step === 'choice' && isSignedIn && flow === 'new') {
      setStep('game')
      return
    }
    if (step === 'choice' && flow === 'wallet') {
      setStep('existingWallet')
    }
  }, [isSignedIn, step])

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
              className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 md:rounded-2xl md:p-12"
            >
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  Are you new to Web3?
                </h1>
                {/* <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
                  New users can get a managed wallet through our guided challenge. Existing Web3 users can connect Freighter directly.
                </p> */}

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={startNewUserFlow}
                    className="glass rounded-xl border-l-4 border-l-orange-500/50 p-6 text-left transition-colors hover:bg-white/10 hover:border-l-orange-500/70"
                  >
                    <p className="font-orbitron text-xl text-white">Yes, I&apos;m new</p>
                    {/* <p className="mt-3 text-sm leading-6 text-slate-400">Create my wallet in Roastellar and continue with the current onboarding flow.</p> */}
                  </button>
                  <button
                    onClick={() => setStep('existingWallet')}
                    className="glass rounded-xl border-l-4 border-l-violet-500/50 p-6 text-left transition-colors hover:bg-white/10 hover:border-l-violet-500/70"
                  >
                    <p className="font-orbitron text-xl text-white">No, I have a wallet</p>
                    {/* <p className="mt-3 text-sm leading-6 text-slate-400">Connect Freighter now. Google or email can stay optional for this step.</p> */}
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
              className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 md:rounded-2xl md:p-12"
            >
              <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                    <Sparkles className="h-4 w-4" />
                    First-time player flow
                  </div>
                  <h1 className="mt-6 font-orbitron text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
                    Welcome to Roastellar.
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                    Before entering the arena, complete your first challenge. You will unlock your wallet, reveal your starter balance,
                    and step into the product with momentum.
                  </p>
                  <button
                    onClick={() => setStep('game')}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B88A35] px-6 py-3 font-bold text-slate-950 shadow-lg shadow-[#B88A35]/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#D1A24A] hover:shadow-[#B88A35]/30 sm:mt-10 sm:w-auto"
                  >
                    Start Challenge
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setStep('choice')}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-3 text-sm font-medium transition-all duration-200 sm:mt-4 sm:w-auto"
                  >
                    Back
                  </button>
                </div>

                <div className="glass rounded-xl p-4 sm:rounded-xl sm:p-6 border-l-4 border-l-orange-500/40">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      { label: 'Target', value: '20 flames' },
                      { label: 'Timer', value: '15 seconds' },
                      { label: 'Reward', value: 'Wallet reveal' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-xl sm:p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
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
              className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 md:rounded-2xl md:p-10"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 text-center">
                  {/* <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                    <WalletIcon className="h-4 w-4" />
                    Existing wallet flow
                  </div> */}
                  <h2 className="mt-5 font-orbitron text-2xl font-bold text-white sm:text-3xl">Connect your Freighter wallet</h2>
                  {/* <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                    If you already use Web3, connect Freighter and continue anonymously. Sign in stays optional.
                  </p> */}
                </div>

                <FreighterConnectCard
                  onConnected={(state) => {
                    setFreighterConnected(Boolean(state.connected))
                    setFreighterAddress(state.address ?? null)
                  }}
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={continueWithExistingWallet}
                    disabled={!freighterConnected}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B88A35] px-6 py-3 font-bold text-slate-950 shadow-lg shadow-[#B88A35]/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#D1A24A] hover:shadow-[#B88A35]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue with Freighter
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setStep('choice')}
                    className="inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-3 text-sm font-medium transition-all duration-200"
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
              className="glass rounded-2xl p-4 sm:rounded-2xl sm:p-6 md:rounded-2xl md:p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="font-orbitron text-2xl font-bold text-white sm:text-3xl">Tap the Falling Flame</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">Catch 20 flames before time runs out. Demo mode is tuned so you always leave with a win.</p>
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
