'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { WalletCard, WalletBalance } from '@/components/WalletCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes } from '@/lib/api'
import type { Wallet } from '@/lib/api'
import { Wallet as WalletIcon, History, ArrowUpDown, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { getExplorerUrl, formatAddress } from '@/lib/utils'

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await apiRoutes.wallet.me()
        setWallet(response.data)
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWallet()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-2xl">
            <PageLoader />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-8 h-8 text-accent" />
              <h1 className="font-orbitron text-3xl font-bold text-white">Wallet</h1>
            </div>
            <p className="text-white/60">Manage your Stellar wallet</p>
          </div>

          {wallet && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <WalletCard
                  address={wallet.address}
                  balance={wallet.balance}
                  variant="full"
                />
              </motion.div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <WalletBalance
                  balance={wallet.balance}
                  label="Available"
                  icon={<WalletIcon className="w-4 h-4 text-accent" />}
                />
                <WalletBalance
                  balance={0}
                  label="In Battles"
                  icon={<ArrowUpDown className="w-4 h-4 text-secondary" />}
                />
                <WalletBalance
                  balance={wallet.balance}
                  label="Total Earned"
                  icon={<History className="w-4 h-4 text-primary" />}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl glass"
              >
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wallet.address)
                      toast.success('Address copied!')
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-primary" />
                    <span className="text-white">Copy Address</span>
                  </button>
                  <a
                    href={getExplorerUrl(wallet.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-secondary" />
                    <span className="text-white">View on Explorer</span>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl glass mt-6"
              >
                <h3 className="font-semibold text-white mb-4">Transaction History</h3>
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">No transactions yet</p>
                  <p className="text-sm text-white/30 mt-1">Start a battle to see your activity</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}