'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, ShieldCheck, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatAddress, formatXLM, getExplorerUrl } from '@/lib/utils'

interface WalletCardProps {
  address: string
  balance: number
  funded?: boolean
  isLoading?: boolean
  variant?: 'compact' | 'full'
}

export function WalletCard({ address, balance, funded = false, isLoading, variant = 'compact' }: WalletCardProps) {
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Wallet address copied')
    setTimeout(() => setCopied(false), 1800)
  }

  if (isLoading) {
    return (
      <div className={cn('animate-pulse rounded-2xl border border-white/10 bg-[#0e1117] p-5 sm:rounded-[24px] sm:p-6', variant === 'full' && 'w-full')}>
        <div className="h-4 w-32 bg-white/10" />
        <div className="mt-6 h-10 w-48 bg-white/10" />
        <div className="mt-8 h-28 bg-white/10" />
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-white/10 border-l-[3px] border-l-[#B88A35] bg-[#0e1117] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.3)] sm:rounded-[24px] sm:p-6',
        variant === 'full' && 'min-h-[400px] w-full'
      )}
      aria-label="Stellar wallet"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <WalletIcon className="h-4 w-4 text-[#D1A24A]" />
            Stellar wallet
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-orbitron text-3xl font-bold tracking-tight text-white sm:text-4xl">{formatXLM(balance)}</span>
            <span className="mb-1 text-sm font-medium text-slate-500">XLM</span>
          </div>
        </div>
        <div className="w-full border border-white/10 bg-[#171d29] px-3 py-2.5 text-left sm:w-auto sm:min-w-28 sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
          <p className={cn('mt-1 text-sm font-semibold', funded ? 'text-emerald-300' : 'text-amber-300')}>
            {funded ? 'Funded' : 'Pending'}
          </p>
        </div>
      </div>

      <div className="mt-7 border border-white/10 bg-[#090b10] p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Public key</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <code className={cn('font-space text-sm leading-6 text-slate-200', variant === 'full' ? 'break-all' : 'truncate')}>
            {variant === 'full' ? address : formatAddress(address, 6)}
          </code>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={copyAddress}
              aria-label="Copy wallet address"
              className="inline-flex items-center gap-2 border border-white/10 bg-[#171b25] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-[#1d222e] hover:text-white"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <a
              href={getExplorerUrl(address)}
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
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Secure testnet custody
        </div>
        {copied && <span className="text-cyan-200">Address copied</span>}
      </div>
    </motion.section>
  )
}

export function WalletBalance({ balance, label, icon }: { balance: number; label: string; icon?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0e1117] p-4 sm:rounded-[20px] sm:p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-4 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">
        {formatXLM(balance)} <span className="text-sm font-medium text-slate-500">XLM</span>
      </p>
    </section>
  )
}
