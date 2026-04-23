'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { useWalletInfo } from '@/lib/hooks'
import { Copy, ExternalLink, Wallet as WalletIcon, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function WalletPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const { wallet, loading, error } = useWalletInfo()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6 pb-20 md:pb-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <WalletIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl sm:text-4xl font-bold">Stellar Wallet</h1>
              </div>
              <p className="text-muted-foreground">
                Manage your XLM balance and track your earnings
              </p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-lg p-8 mb-8 gradient-primary border"
            >
              <p className="text-primary-foreground/80 mb-2 text-sm font-medium">TOTAL BALANCE</p>
              {loading ? (
                <div className="h-12 bg-primary-foreground/20 rounded animate-pulse" />
              ) : error ? (
                <p className="text-primary-foreground/80">Failed to load balance</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-bold text-primary-foreground">
                    {wallet?.balance.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xl text-primary-foreground/80">XLM</span>
                </div>
              )}
            </motion.div>

            {/* Wallet Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-lg p-8 mb-8"
            >
              <h2 className="text-xl font-bold mb-6">Wallet Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2 uppercase">
                    Public Key
                  </label>
                  <div className="flex items-center justify-between gap-2 bg-card/50 p-4 rounded-lg">
                    <code className="text-sm font-mono break-all flex-1">
                      {wallet?.publicKey || 'Loading...'}
                    </code>
                    <button
                      onClick={() => wallet?.publicKey && copyToClipboard(wallet.publicKey)}
                      className="flex-shrink-0 p-2 hover:bg-card/50 rounded transition"
                      title="Copy public key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2 uppercase">
                    Network
                  </label>
                  <div className="bg-card/50 p-4 rounded-lg">
                    <span className="font-medium">Stellar Testnet</span>
                  </div>
                </div>

                {wallet?.publicKey && (
                  <div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                    >
                      View on Stellar Explorer
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-lg p-8"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {[
                  { type: 'Win Reward', amount: '+5.25', time: '2 hours ago', icon: '🎉' },
                  { type: 'Prediction Reward', amount: '+2.50', time: '5 hours ago', icon: '🎯' },
                  { type: 'Battle Prize', amount: '+10.00', time: '1 day ago', icon: '🏆' },
                  { type: 'Challenge Bonus', amount: '+25.00', time: '2 days ago', icon: '⭐' },
                ].map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">{transaction.icon}</span>
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{transaction.time}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-accent">{transaction.amount}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
