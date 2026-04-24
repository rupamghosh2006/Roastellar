'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, ShieldCheck, Wallet as WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatAddress, formatXLM, getExplorerUrl } from '@/lib/utils'

interface WalletCardProps {
  address: string
  balance: number
  isLoading?: boolean
  variant?: 'compact' | 'full'
}

export function WalletCard({ address, balance, isLoading, variant = 'compact' }: WalletCardProps) {
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Wallet address copied')
    setTimeout(() => setCopied(false), 1800)
  }

  if (isLoading) {
    return (
      <div className={cn('glass animate-pulse rounded-[22px] p-4 sm:rounded-[28px] sm:p-6', variant === 'full' && 'w-full')}>
        <div className="h-5 w-32 rounded-full bg-white/10" />
        <div className="mt-6 h-10 w-48 rounded-full bg-white/10" />
        <div className="mt-8 h-28 rounded-[24px] bg-white/10" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass gradient-border rounded-[22px] p-4 sm:rounded-[28px] sm:p-6',
        variant === 'full' && 'w-full'
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
            <WalletIcon className="h-4 w-4 text-amber-200" />
            Stellar Wallet
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-orbitron text-3xl font-bold text-white sm:text-4xl">{formatXLM(balance)}</span>
            <span className="pb-1 text-sm text-white/50">XLM</span>
          </div>
        </div>
        <div className="w-full rounded-2xl border border-blue-400/12 bg-blue-500/10 px-3 py-2 text-left sm:w-auto sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80">Status</p>
          <p className="mt-1 text-sm font-semibold text-white">Funded</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-white/35">Public Key</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <code className={cn('text-sm text-white/78', variant === 'full' ? 'break-all' : 'truncate')}>
            {variant === 'full' ? address : formatAddress(address, 6)}
          </code>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </button>
            <a
              href={getExplorerUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Secure testnet custody
        </div>
        {copied && <span className="text-blue-200">Copied</span>}
      </div>
    </motion.div>
  )
}

export function WalletBalance({ balance, label, icon }: { balance: number; label: string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-[20px] p-4 sm:rounded-[24px] sm:p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
        {icon}
        {label}
      </div>
      <p className="mt-4 font-orbitron text-xl font-bold text-white sm:text-2xl">
        {formatXLM(balance)} <span className="text-sm text-white/45">XLM</span>
      </p>
    </div>
  )
}
