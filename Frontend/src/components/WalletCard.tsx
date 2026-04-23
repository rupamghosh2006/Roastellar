'use client'

import { motion } from 'framer-motion'
import { Wallet as WalletIcon, Copy, ExternalLink, Sparkles } from 'lucide-react'
import { useState } from 'react'
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

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Address copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className={cn(
        'p-6 rounded-2xl glass animate-pulse',
        variant === 'full' && 'max-w-md'
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-24 bg-white/10 rounded" />
          </div>
        </div>
        <div className="h-8 w-40 bg-white/10 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-6 rounded-2xl glass border border-accent/20',
        variant === 'full' && 'max-w-md'
      )}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
          <WalletIcon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">Stellar Wallet</p>
          <p className="font-orbitron font-bold text-white">{formatAddress(address)}</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-white/50 mb-1">Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron text-3xl font-bold text-white">
              {formatXLM(balance)}
            </span>
            <span className="text-sm text-white/50">XLM</span>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyAddress}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={getExplorerUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

interface WalletBalanceProps {
  balance: number
  label?: string
  icon?: React.ReactNode
}

export function WalletBalance({ balance, label = 'Balance', icon }: WalletBalanceProps) {
  return (
    <div className="p-4 rounded-xl glass">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-orbitron text-2xl font-bold text-white">
        {formatXLM(balance)} <span className="text-sm text-white/50">XLM</span>
      </p>
    </div>
  )
}

interface RewardChestProps {
  onOpen?: () => void
}

export function RewardChest({ onOpen }: RewardChestProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = () => {
    setOpened(true)
    toast.success('Reward claimed!')
    onOpen?.()
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <motion.button
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        disabled={opened}
        className={cn(
          'relative w-32 h-32 rounded-2xl flex items-center justify-center',
          'bg-gradient-to-br from-accent/30 to-amber-600/20',
          'border-2 border-accent/40',
          'hover:border-accent/60 transition-colors',
          opened && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div
          animate={opened ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Sparkles className={cn(
            'w-12 h-12',
            opened ? 'text-white/30' : 'text-accent animate-pulse-glow'
          )} />
        </motion.div>
      </motion.button>

      {opened && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">
            Claimed
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}