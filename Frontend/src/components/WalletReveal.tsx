'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, CircleDollarSign, Copy, ExternalLink, KeyRound, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
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

  const statusItems = [
    {
      icon: CheckCircle2,
      label: 'Funding',
      value: wallet.funded ? 'Friendbot deposit complete' : 'Funding pending',
      tone: wallet.funded ? 'text-emerald-300' : 'text-amber-300',
    },
    {
      icon: CircleDollarSign,
      label: 'Available balance',
      value: `${formatXLM(wallet.balance)} XLM`,
      tone: 'text-[#D1A24A]',
    },
    {
      icon: KeyRound,
      label: 'Wallet identity',
      value: formatAddress(wallet.publicKey, 6),
      tone: 'text-cyan-200',
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl border border-white/10 bg-[#0b0d12] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-[28px] sm:p-8 lg:p-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-white/10 pb-6 sm:flex sm:items-start sm:justify-between sm:gap-8 sm:pb-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-300/25 bg-emerald-400/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Wallet ready</p>
              <h2 className="mt-2 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Your arena wallet is active</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Funded on Stellar Testnet and ready for your first battle.
              </p>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121620] px-3 py-2 text-xs font-medium text-slate-300 sm:mt-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Testnet connected
          </div>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          <section className="border border-white/10 border-l-[3px] border-l-[#B88A35] bg-[#121620] p-5 sm:p-6" aria-label="Arena wallet details">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <WalletIcon className="h-4 w-4 text-[#D1A24A]" />
              Arena wallet
            </div>
            <div className="mt-7 flex items-end gap-2">
              <span className="font-orbitron text-3xl font-bold tracking-tight text-white sm:text-4xl">{formatXLM(wallet.balance)}</span>
              <span className="mb-1 text-sm font-medium text-slate-500">XLM</span>
            </div>
            <div className="my-6 h-px bg-white/10" />
            <div className="bg-[#0b0d12] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Public key</p>
              <code className="mt-3 block break-all font-space text-sm leading-6 text-slate-200">{wallet.publicKey}</code>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={copyAddress}
                  aria-label="Copy wallet address"
                  className="inline-flex items-center gap-2 border border-white/10 bg-[#171b25] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-[#1d222e] hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <a
                  href={getExplorerUrl(wallet.publicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open wallet in Stellar Explorer"
                  className="inline-flex items-center gap-2 border border-white/10 bg-[#171b25] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-[#1d222e] hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Explorer
                </a>
              </div>
            </div>
          </section>

          <section className="border border-white/10 bg-[#0e1118] p-5 sm:p-6" aria-label="Wallet status">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Account status</p>
            <div className="mt-5 divide-y divide-white/10">
              {statusItems.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.label} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                      <Icon className={`h-5 w-5 ${item.tone}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-200">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-xs leading-5 text-slate-500 sm:order-1">Manage keys and wallet settings any time from your wallet.</p>
          <div className="order-1 flex flex-col gap-3 sm:order-2 sm:flex-row">
            <button
              onClick={onEnterArena}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B88A35] px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[#D1A24A] sm:w-auto"
            >
              Enter Arena
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onViewWallet}
              className="w-full rounded-xl border border-white/10 bg-[#171b25] px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-[#1d222e] hover:text-white sm:w-auto"
            >
              View Wallet
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
