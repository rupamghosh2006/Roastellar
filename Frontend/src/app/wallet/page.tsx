'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ArrowUpDown, Clock3, Copy, ExternalLink, Eye, EyeOff, Wallet as WalletIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FreighterConnectCard } from '@/components/FreighterConnectCard'
import { Sidebar } from '@/components/Sidebar'
import { WalletBalance, WalletCard } from '@/components/WalletCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Wallet, type WalletSecretExport } from '@/lib/api'
import { formatDate, getExplorerUrl } from '@/lib/utils'

export default function WalletPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletSecret, setWalletSecret] = useState<WalletSecretExport | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
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

  const rewardHistory = useMemo(() => {
    const history: string[] = []

    if (!wallet) {
      history.push('No wallet is linked to this account yet.')
      return history
    }

    if (wallet.createdAt) {
      history.push(`Wallet created on ${formatDate(wallet.createdAt)}.`)
    }

    history.push(wallet.funded ? 'Wallet funding is confirmed on Stellar testnet.' : 'Wallet funding is still pending.')
    history.push(`Current available balance: ${wallet.balance.toFixed(2)} XLM.`)
    return history
  }, [wallet])

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoader message="Loading wallet" />
        </main>
      </div>
    )
  }

  const exportForFreighter = async () => {
    try {
      setIsExporting(true)
      const token = await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing Clerk session token')
      }

      const response = await apiRoutes.wallet.exportSecret(token)
      setWalletSecret(response.data)
      setShowSecret(true)
      toast.success('Secret key revealed. Import it into Freighter now and keep it private.')
    } catch (error) {
      console.error('Failed to export wallet secret:', error)
      toast.error('Could not export secret key. Please retry.')
    } finally {
      setIsExporting(false)
    }
  }

  const copySecret = async () => {
    if (!walletSecret?.secretKey) {
      return
    }

    try {
      await navigator.clipboard.writeText(walletSecret.secretKey)
      toast.success('Secret key copied. Paste it into Freighter import flow.')
    } catch (error) {
      toast.error('Clipboard copy failed. Select and copy manually.')
    }
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
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
            {wallet ? (
              <WalletCard
                address={wallet.address || wallet.publicKey}
                balance={wallet.balance}
                funded={wallet.funded}
                variant="full"
              />
            ) : (
              <div className="glass rounded-[22px] p-5 text-white/70 sm:rounded-[28px] sm:p-6">
                Wallet data is unavailable right now. Please refresh after signing in again.
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <WalletBalance label="Available" balance={wallet?.balance ?? 0} icon={<WalletIcon className="h-4 w-4 text-amber-200" />} />
              <WalletBalance label="In Battles" balance={0} icon={<ArrowUpDown className="h-4 w-4 text-blue-200" />} />
              <FreighterConnectCard compact />
              <div className="glass rounded-[22px] p-4 sm:rounded-[28px] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/35">Freighter Import</p>
                    <p className="mt-2 text-sm text-white/72">Export this Roastellar wallet secret key and import it in Freighter.</p>
                  </div>
                </div>

                {!walletSecret && (
                  <button
                    onClick={exportForFreighter}
                    disabled={isExporting}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isExporting ? 'Exporting...' : 'Reveal Secret For Freighter'}
                  </button>
                )}

                {walletSecret && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100/95">
                      Never share this secret key. Anyone with this key can control your wallet.
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Secret Key</p>
                      <p className="mt-2 break-all font-mono text-xs text-white/85">
                        {showSecret ? walletSecret.secretKey : 'S***************************************'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => setShowSecret((value) => !value)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white/90 sm:w-auto"
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showSecret ? 'Hide Secret' : 'Show Secret'}
                      </button>
                      <button
                        onClick={copySecret}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white/90 sm:w-auto"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Secret
                      </button>
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3 text-xs text-white/72">
                      Freighter steps: Open Freighter {'->'} Add Wallet {'->'} Import from Secret Key {'->'} paste this key {'->'} switch to TESTNET.
                    </div>
                  </div>
                )}
              </div>
              <div className="glass rounded-[22px] p-4 sm:rounded-[28px] sm:p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
                  <ExternalLink className="h-4 w-4 text-violet-200" />
                  Explorer
                </div>
                <a
                  href={wallet ? getExplorerUrl(wallet.address || wallet.publicKey) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm text-blue-200 underline-offset-4 hover:underline"
                >
                  Open wallet on Stellar Expert
                </a>
                <p className="mt-4 text-sm text-white/50">
                  Created {wallet?.createdAt ? formatDate(wallet.createdAt) : 'date unavailable'}
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
