'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PredictionPanelProps {
  player1Name: string
  player2Name: string
  onPredict: (playerId: string, amount: number) => void
  isSpectator: boolean
}

export function PredictionPanel({ player1Name, player2Name, onPredict, isSpectator }: PredictionPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [amount, setAmount] = useState('10')

  const submitPrediction = () => {
    if (!selectedPlayer) {
      toast.error('Choose a player to back')
      return
    }

    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Enter a valid XLM amount')
      return
    }

    onPredict(selectedPlayer, parsed)
    toast.success('Prediction submitted')
  }

  if (!isSpectator) {
    return (
      <div className="glass rounded-[28px] p-6">
        <div className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-white/40" />
          <h3 className="font-semibold">Prediction Desk</h3>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/50">
          Only spectators can place predictions while a battle is live.
        </p>
      </div>
    )
  }

  const options = [
    { id: player1Name, label: player1Name, accent: 'from-blue-500/16 to-blue-300/10 border-blue-400/18' },
    { id: player2Name, label: player2Name, accent: 'from-violet-500/16 to-fuchsia-300/10 border-violet-400/18' },
  ]

  return (
    <div className="glass rounded-[28px] p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-200" />
        <h3 className="font-semibold text-white">Prediction Desk</h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/50">
        Stake a small amount of testnet XLM and ride the crowd if your read is right.
      </p>

      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedPlayer(option.id)}
            className={cn(
              'w-full rounded-2xl border bg-gradient-to-r p-4 text-left transition-all',
              option.accent,
              selectedPlayer === option.id ? 'ring-2 ring-blue-400/45' : 'opacity-80 hover:opacity-100'
            )}
          >
            <p className="font-semibold text-white">{option.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/40">Will win</p>
          </motion.button>
        ))}
      </div>

      <label className="mt-5 block text-xs uppercase tracking-[0.24em] text-white/35">Amount</label>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <Coins className="h-4 w-4 text-amber-200" />
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full bg-transparent text-white outline-none placeholder:text-white/25"
          placeholder="10"
        />
      </div>

      <button
        onClick={submitPrediction}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-4 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-92"
      >
        Predict Winner
      </button>
    </div>
  )
}
