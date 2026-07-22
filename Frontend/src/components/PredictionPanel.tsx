'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Coins, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PredictionPanelProps {
  player1Id?: string
  player2Id?: string
  player1Name: string
  player2Name: string
  onPredict: (playerId: string, amount: number) => Promise<void> | void
  isSpectator: boolean
  disabled?: boolean
  submitted?: boolean
  submittedPlayerId?: string
}

export function PredictionPanel({ player1Id, player2Id, player1Name, player2Name, onPredict, isSpectator, disabled = false, submitted = false, submittedPlayerId }: PredictionPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [amount, setAmount] = useState('10')
  const [submitting, setSubmitting] = useState(false)

  const submitPrediction = async () => {
    if (!selectedPlayer) {
      toast.error('Choose a player to back')
      return
    }

    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Enter a valid XLM amount')
      return
    }

    try {
      setSubmitting(true)
      await onPredict(selectedPlayer, parsed)
    } finally {
      setSubmitting(false)
    }
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
    { id: player1Id || player1Name, label: player1Name, accent: 'bg-blue-500/12 border-blue-400/18' },
    { id: player2Id || player2Name, label: player2Name, accent: 'bg-violet-500/12 border-violet-400/18' },
  ]
  const selectedOptionId = submittedPlayerId || selectedPlayer
  const submittedPlayer = submittedPlayerId
    ? options.find((option) => String(option.id) === String(submittedPlayerId))
    : undefined

  return (
    <div className="glass rounded-[28px] p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-200" />
        <h3 className="font-semibold text-white">Prediction Desk</h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/50">
        Stake a small amount of testnet XLM and ride the crowd if your read is right.
      </p>

      {submitted && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          {submittedPlayer ? `You predicted ${submittedPlayer.label} will win` : 'Your prediction was recorded'}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ y: -2 }}
            disabled={submitting || disabled}
            onClick={() => setSelectedPlayer(option.id)}
            className={cn(
              'w-full rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
              option.accent,
              selectedOptionId === option.id
                ? 'ring-2 ring-emerald-300/50 opacity-100'
                : 'opacity-80 hover:opacity-100'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{option.label}</p>
              {submittedPlayerId && String(option.id) === String(submittedPlayerId) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Your prediction
                </span>
              )}
            </div>
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
          disabled={submitting || disabled}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full bg-transparent text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="10"
        />
      </div>

      <button
        onClick={submitPrediction}
        disabled={submitting || disabled}
        className="mt-5 w-full rounded-2xl bg-[#B88A35] px-4 py-3 font-semibold text-slate-950 transition-colors hover:bg-[#D1A24A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? 'Placing prediction...'
          : submitted
            ? submittedPlayer
              ? `You predicted ${submittedPlayer.label}`
              : 'Prediction placed'
            : 'Predict Winner'}
      </button>
    </div>
  )
}
