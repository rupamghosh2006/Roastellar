'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ArrowUpDown, Clock3, ExternalLink, Wallet as WalletIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FreighterConnectCard } from '@/components/FreighterConnectCard'
import { Sidebar } from '@/components/Sidebar'
import { WalletBalance, WalletCard } from '@/components/WalletCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Wallet } from '@/lib/api'
import { formatDate, getExplorerUrl } from '@/lib/utils'

const rewardHistory = [
  'Starter reward credited during onboarding',
  'Prediction payout from semifinal room',
  'Community streak bonus queued',
]

export default function WalletPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    getToken({ skipCache: true })
      .then((token) => {
        if (!token) {
          throw new Error('Missing Clerk session token')
        }

        return apiRoutes.wallet.me(token)
      })
      .then((response) => setWallet(response.data))
      .catch((error) => {
        console.error('Failed to load wallet:', error)
        toast.error('Please sign in again to load your wallet.')
      })
      .finally(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn, router])

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoader message="Loading wallet" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="glass rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 md:rounded-[36px] md:p-8">
            <div className="flex items-center gap-3">
              <WalletIcon className="h-7 w-7 text-amber-200 sm:h-8 sm:w-8" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Wallet</p>
                <h1 className="font-orbitron text-3xl font-bold text-white sm:text-4xl">Your Stellar vault</h1>
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
              <FreighterConnectCard compact />
              <div className="glass rounded-[22px] p-4 sm:rounded-[28px] sm:p-5">
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
                <p className="mt-4 text-sm text-white/50">
                  Created {wallet?.createdAt ? formatDate(wallet.createdAt) : 'just now'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-[28px] p-5 sm:rounded-[36px] sm:p-6">
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
