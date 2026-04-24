'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, PlugZap, RefreshCcw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { connectFreighter, getFreighterState, type FreighterState } from '@/lib/freighter'
import { cn, formatAddress } from '@/lib/utils'

interface FreighterConnectCardProps {
  className?: string
  compact?: boolean
}

const defaultState: FreighterState = {
  available: false,
  connected: false,
  address: null,
  network: null,
  networkPassphrase: null,
  error: null,
}

export function FreighterConnectCard({ className, compact = false }: FreighterConnectCardProps) {
  const [state, setState] = useState<FreighterState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    getFreighterState()
      .then(setState)
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    const nextState = await connectFreighter()
    setState(nextState)
    setConnecting(false)

    if (nextState.connected) {
      toast.success('Freighter connected')
      if (nextState.network && nextState.network !== 'TESTNET') {
        toast.warning('Freighter is connected, but not on Stellar Testnet.')
      }
      return
    }

    toast.error(nextState.error || 'Unable to connect Freighter')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass rounded-[22px] border border-white/10 p-4 sm:rounded-[28px] sm:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
            <PlugZap className="h-4 w-4 text-blue-200" />
            Freighter Companion Wallet
          </div>
          <h3 className={cn('mt-3 font-orbitron text-white', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>
            Connect Freighter after onboarding
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Your Roastellar arena wallet stays managed by the app. Freighter adds an external wallet connection for signing and future wallet-native actions.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
          {loading ? 'Checking' : state.connected ? 'Connected' : state.available ? 'Ready' : 'Not installed'}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/35">Extension Status</p>
          <p className="mt-2 text-sm text-white/78">
            {loading
              ? 'Checking Freighter availability...'
              : state.available
              ? state.connected
                ? 'Freighter is installed and connected to this app.'
                : 'Freighter is installed. Connect it to continue with wallet-aware actions.'
              : 'Freighter is not detected in this browser yet.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Address</p>
            <p className="mt-2 break-all text-sm text-white/78">
              {state.address ? formatAddress(state.address, 6) : 'Not connected'}
            </p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Network</p>
            <p className="mt-2 text-sm text-white/78">{state.network ?? 'Unknown'}</p>
          </div>
        </div>

        {state.error && (
          <div className="rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100/90">
            {state.error}
          </div>
        )}

        {state.connected && state.network === 'TESTNET' && (
          <div className="flex items-center gap-2 rounded-[20px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100/90">
            <CheckCircle2 className="h-4 w-4" />
            Freighter is connected on Stellar Testnet.
          </div>
        )}

        {state.connected && state.network !== 'TESTNET' && (
          <div className="flex items-center gap-2 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100/90">
            <ShieldCheck className="h-4 w-4" />
            Switch Freighter to Stellar Testnet to match Roastellar&apos;s onboarding wallet flow.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleConnect}
          disabled={connecting || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {connecting ? 'Connecting...' : state.connected ? 'Reconnect Freighter' : 'Connect Freighter'}
        </button>
        <button
          onClick={() => {
            setLoading(true)
            getFreighterState()
              .then(setState)
              .finally(() => setLoading(false))
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-medium text-white/85 sm:w-auto"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Status
        </button>
      </div>
    </motion.div>
  )
}
