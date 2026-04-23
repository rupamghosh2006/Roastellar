'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MiniGame } from '@/components/MiniGame'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Copy, ExternalLink, ChevronRight } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3

export default function OnboardingPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  const [step, setStep] = useState<OnboardingStep>(1)
  const [gameScore, setGameScore] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  const handleGameComplete = async (score: number) => {
    setGameScore(score)
    setStep(2)

    // Fetch wallet info
    setLoading(true)
    try {
      const response = await api.get('/wallet/me')
      const walletData = response.data.data
      setWalletAddress(walletData.publicKey)
      setWalletBalance(walletData.balance)
    } catch (error) {
      toast.error('Failed to fetch wallet info')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnterArena = () => {
    router.push('/dashboard')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success('Wallet address copied!')
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress indicators */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/50 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-primary' : 'bg-card'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-20 pt-32">
        {/* Step 1: Welcome & Game */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <div className="inline-block text-6xl mb-4">🎮</div>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Welcome to Roastellar
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                Before entering the arena, complete your first challenge. Tap the falling flames to earn your spot!
              </p>
            </div>

            <MiniGame onComplete={handleGameComplete} targetScore={20} />
          </motion.div>
        )}

        {/* Step 2: Victory & Wallet Reveal */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Chest animation placeholder */}
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                💎
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Challenge Complete!
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your wallet has been created on the Stellar network.
              </p>
            </div>

            {/* Wallet Info Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-lg p-8 space-y-6"
            >
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
                  Wallet Created Successfully
                </h3>
                <div className="flex items-center justify-between gap-2 bg-card/50 p-4 rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {walletAddress || 'Loading...'}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    disabled={!walletAddress}
                    className="flex-shrink-0 p-2 hover:bg-card/50 rounded transition disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
                  Testnet XLM Balance
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-accent">
                    {walletBalance.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">XLM</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Powered by Stellar
                </p>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  View on Stellar Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnterArena}
                className="px-8 py-4 rounded-lg gradient-primary text-primary-foreground font-semibold"
              >
                Enter Arena
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                className="px-8 py-4 rounded-lg border border-primary/50 text-primary font-semibold hover:bg-primary/10 transition"
              >
                View Wallet Details
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Wallet Details */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold">Your Stellar Wallet</h2>

            <div className="glass rounded-lg p-8 space-y-6">
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Public Key
                </label>
                <div className="flex items-center justify-between gap-2 bg-card/50 p-4 rounded-lg">
                  <code className="text-sm font-mono break-all">{walletAddress}</code>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 p-2 hover:bg-card/50 rounded transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Balance (Testnet)
                </label>
                <div className="flex items-baseline gap-2 bg-card/50 p-4 rounded-lg">
                  <span className="text-2xl font-bold text-accent">
                    {walletBalance.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">XLM</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  View on Stellar Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnterArena}
              className="w-full py-4 rounded-lg gradient-primary text-primary-foreground font-semibold"
            >
              Let&apos;s Battle
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
