'use client'

import { useEffect, useState } from 'react'
import { ArrowUpDown, Clock3, ExternalLink, Wallet as WalletIcon } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { WalletBalance, WalletCard } from '@/components/WalletCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Wallet } from '@/lib/api'
import { getExplorerUrl } from '@/lib/utils'

const rewardHistory = [
  'Starter reward credited during onboarding',
  'Prediction payout from semifinal room',
  'Community streak bonus queued',
]

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRoutes.wallet.me()
      .then((response) => setWallet(response.data))
      .catch((error) => console.error('Failed to load wallet:', error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <PageLoader message="Loading wallet" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="glass rounded-[36px] p-8">
            <div className="flex items-center gap-3">
              <WalletIcon className="h-8 w-8 text-amber-200" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Wallet</p>
                <h1 className="font-orbitron text-4xl font-bold text-white">Your Stellar vault</h1>
              </div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
            <WalletCard
              address={wallet?.address ?? 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
              balance={wallet?.balance ?? 0}
              variant="full"
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <WalletBalance label="Available" balance={wallet?.balance ?? 0} icon={<WalletIcon className="h-4 w-4 text-amber-200" />} />
              <WalletBalance label="In Battles" balance={0} icon={<ArrowUpDown className="h-4 w-4 text-blue-200" />} />
              <div className="glass rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
                  <ExternalLink className="h-4 w-4 text-violet-200" />
                  Explorer
                </div>
                <a
                  href={wallet ? getExplorerUrl(wallet.address) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm text-blue-200 underline-offset-4 hover:underline"
                >
                  Open wallet on Stellar Expert
                </a>
              </div>
            </div>
          </div>

          <div className="glass rounded-[36px] p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-blue-200" />
              <h2 className="font-orbitron text-2xl text-white">Reward history</h2>
            </div>
            <div className="mt-6 space-y-3">
              {rewardHistory.map((item) => (
                <div key={item} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/68">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
