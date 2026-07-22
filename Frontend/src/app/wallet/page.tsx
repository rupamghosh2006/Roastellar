'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ArrowUpDown, Clock3, Copy, ExternalLink, Eye, EyeOff, KeyRound, Wallet as WalletIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { WalletBalance, WalletCard } from '@/components/WalletCard'
import { AnimatedList } from '@/components/AnimatedList'
import { apiRoutes, type Wallet, type WalletSecretExport } from '@/lib/api'
import { formatDate, getExplorerUrl } from '@/lib/utils'
import { getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'

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

    const walletMode = isWalletAuthenticated()
    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    Promise.resolve(walletMode ? getWalletAuthToken() : getToken({ skipCache: true }))
      .then((token) => {
        if (!token) throw new Error('Missing auth token')

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
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="h-32 rounded-2xl border border-white/10 bg-[#0b0d12]" />
            <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
              <div className="min-h-[400px] rounded-2xl border border-white/10 bg-[#0e1117]" />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                <div className="h-28 rounded-2xl border border-white/10 bg-[#0e1117]" />
                <div className="h-28 rounded-2xl border border-white/10 bg-[#0e1117]" />
                <div className="h-64 rounded-2xl border border-white/10 bg-[#0e1117]" />
                <div className="h-40 rounded-2xl border border-white/10 bg-[#0e1117]" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="mb-3 h-14 rounded-[20px] bg-white/10 last:mb-0" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const exportForFreighter = async () => {
    if (!wallet?.managedWalletAvailable) {
      toast.error('This account uses Freighter as primary wallet. No managed wallet secret is available.')
      return
    }
    try {
      setIsExporting(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) throw new Error('Missing auth token')

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
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#B88A35]/30 bg-[#B88A35]/10">
                <WalletIcon className="h-5 w-5 text-[#D1A24A]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Wallet account</p>
                <h1 className="mt-1 font-orbitron text-2xl font-bold tracking-tight text-white sm:text-3xl">Stellar vault</h1>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-[#121620] px-3 py-2 text-xs font-medium text-slate-300 sm:self-auto">
              <span className={`h-1.5 w-1.5 rounded-full ${wallet?.funded ? 'bg-emerald-300' : 'bg-amber-300'}`} />
              {wallet?.funded ? 'Funded on testnet' : 'Funding in progress'}
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            {wallet ? (
              <WalletCard
                address={wallet.address || wallet.publicKey}
                balance={wallet.balance}
                funded={wallet.funded}
                variant="full"
              />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0e1117] p-5 text-slate-400 sm:p-6">
                Wallet data is unavailable right now. Please refresh after signing in again.
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <WalletBalance label="Available" balance={wallet?.balance ?? 0} icon={<WalletIcon className="h-4 w-4 text-amber-200" />} />
              <WalletBalance label="In Battles" balance={0} icon={<ArrowUpDown className="h-4 w-4 text-blue-200" />} />
              <section className="rounded-2xl border border-white/10 bg-[#0e1117] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="max-w-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Freighter key export</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {wallet?.managedWalletAvailable
                        ? 'Export this Roastellar managed wallet secret key and import it in Freighter.'
                        : 'Managed wallet export is unavailable because your Freighter wallet is the primary identity wallet.'}
                    </p>
                  </div>
                </div>

                {!walletSecret && wallet?.managedWalletAvailable && (
                  <button
                    onClick={exportForFreighter}
                    disabled={isExporting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B88A35] px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[#D1A24A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <KeyRound className="h-5 w-5" />
                    {isExporting ? 'Exporting key...' : 'Reveal wallet key'}
                  </button>
                )}

                {walletSecret && (
                  <div className="mt-4 space-y-3">
                    <div className="border border-amber-300/20 bg-[#231d11] p-3 text-xs leading-5 text-amber-100/95">
                      Never share this secret key. Anyone with this key can control your wallet.
                    </div>
                    <div className="border border-white/10 bg-[#090b10] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Secret key</p>
                      <p className="mt-2 break-all font-space text-xs leading-5 text-slate-200">
                        {showSecret ? walletSecret.secretKey : 'S***************************************'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => setShowSecret((value) => !value)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#171b25] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-[#1d222e] sm:w-auto"
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showSecret ? 'Hide Secret' : 'Show Secret'}
                      </button>
                      <button
                        onClick={copySecret}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#171b25] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-[#1d222e] sm:w-auto"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Secret
                      </button>
                    </div>
                    <div className="border border-white/10 bg-[#090b10] p-3 text-xs leading-5 text-slate-400">
                      Freighter steps: Open Freighter {'->'} Add Wallet {'->'} Import from Secret Key {'->'} paste this key {'->'} switch to TESTNET.
                    </div>
                  </div>
                )}
                {!wallet?.managedWalletAvailable && (
                  <div className="mt-4 border border-cyan-300/20 bg-[#0e1b22] p-3 text-xs leading-5 text-cyan-100/90">
                    Primary wallet mode: your connected Freighter wallet is used as your identity and primary account.
                  </div>
                )}
              </section>
              <section className="rounded-2xl border border-white/10 bg-[#0e1117] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <ExternalLink className="h-4 w-4 text-cyan-200" />
                  Explorer
                </div>
                <a
                  href={wallet ? getExplorerUrl(wallet.address || wallet.publicKey) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex text-sm font-medium text-cyan-200 underline-offset-4 hover:underline"
                >
                  Open wallet on Stellar Expert
                </a>
                <p className="mt-4 text-sm text-slate-500">
                  Created {wallet?.createdAt ? formatDate(wallet.createdAt) : 'date unavailable'}
                </p>
              </section>
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 sm:rounded-[24px] sm:p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-cyan-200" />
              <h2 className="font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Reward history</h2>
            </div>
            <div className="mt-6">
              <AnimatedList
                items={rewardHistory}
                showGradients={false}
                enableArrowNavigation={false}
                displayScrollbar={false}
                containerClassName="max-h-none overflow-visible p-0"
                renderItem={(item) => (
                  <div className="border border-white/10 bg-[#10131a] p-4 text-sm text-slate-300">
                    {item}
                  </div>
                )}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
