'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Sparkles, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { FreighterConnectCard } from '@/components/FreighterConnectCard'
import type { Wallet } from '@/lib/api'
import { formatAddress, formatXLM, getExplorerUrl } from '@/lib/utils'

interface WalletRevealProps {
  wallet: Wallet
  onEnterArena: () => void
  onViewWallet: () => void
}

export function WalletReveal({ wallet, onEnterArena, onViewWallet }: WalletRevealProps) {
  const copyAddress = async () => {
    await navigator.clipboard.writeText(wallet.publicKey)
    toast.success('Wallet address copied')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-12"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 sm:h-20 sm:w-20">
          <CheckCircle2 className="h-8 w-8 text-emerald-300 sm:h-10 sm:w-10" />
        </div>
        <h2 className="mt-6 font-orbitron text-3xl font-bold leading-tight text-white sm:mt-8 sm:text-4xl md:text-5xl">
          Wallet Created Successfully
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
          Your arena wallet is now live on Stellar Testnet. You&apos;re funded, synced, and ready to enter Roastellar.
        </p>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="gradient-border glass rounded-[24px] p-5 text-left sm:rounded-[28px] sm:p-6 md:rounded-[32px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
              <WalletIcon className="h-4 w-4 text-amber-200" />
              Arena Wallet
            </div>
            <div className="mt-5 flex items-end gap-2 sm:mt-6">
              <span className="font-orbitron text-3xl font-bold text-white sm:text-4xl">{formatXLM(wallet.balance)}</span>
              <span className="pb-1 text-sm text-white/50">XLM</span>
            </div>
            <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4 sm:mt-6 sm:rounded-[24px]">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Public Key</p>
              <code className="mt-3 block break-all text-sm text-white/80">{wallet.publicKey}</code>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={copyAddress}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={getExplorerUrl(wallet.publicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            {[
              { title: 'Funded Status', value: wallet.funded ? 'Friendbot deposit complete' : 'Funding pending' },
              { title: 'Testnet XLM Received', value: `${formatXLM(wallet.balance)} XLM available` },
              { title: 'Public Key', value: formatAddress(wallet.publicKey, 6) },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8">
                    <Sparkles className="h-5 w-5 text-blue-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.title}</p>
                    <p className="mt-1 break-words text-sm text-white/72">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={onEnterArena}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 sm:w-auto"
          >
            Enter Arena
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onViewWallet}
            className="w-full rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-medium text-white/85 sm:w-auto"
          >
            View Wallet
          </button>
        </div>

        <div className="mt-8">
          <FreighterConnectCard />
        </div>
      </div>
    </motion.section>
  )
}
