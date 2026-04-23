'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface PredictionPanelProps {
  player1Name: string
  player2Name: string
  onPredict: (player: string, amount: number) => void
  isSpectator: boolean
}

export function PredictionPanel({
  player1Name,
  player2Name,
  onPredict,
  isSpectator,
}: PredictionPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [amount, setAmount] = useState('10')

  const handlePredict = () => {
    if (!selectedPlayer) {
      toast.error('Select a player first')
      return
    }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    onPredict(selectedPlayer, numAmount)
    setSelectedPlayer(null)
    setAmount('10')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-lg p-6 sticky top-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold">Predictions</h3>
      </div>

      {isSpectator && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Predict the winner and earn bonus XLM rewards!
          </p>

          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlayer(player1Name)}
              className={`w-full p-4 rounded-lg border-2 transition ${
                selectedPlayer === player1Name
                  ? 'border-primary bg-primary/10'
                  : 'border-card hover:border-primary/50'
              }`}
            >
              <p className="font-semibold">{player1Name}</p>
              <p className="text-xs text-muted-foreground">Will win</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlayer(player2Name)}
              className={`w-full p-4 rounded-lg border-2 transition ${
                selectedPlayer === player2Name
                  ? 'border-primary bg-primary/10'
                  : 'border-card hover:border-primary/50'
              }`}
            >
              <p className="font-semibold">{player2Name}</p>
              <p className="text-xs text-muted-foreground">Will win</p>
            </motion.button>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Amount (XLM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-2 rounded-lg bg-card border border-card hover:border-primary/50 focus:border-primary focus:outline-none transition"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePredict}
            disabled={!selectedPlayer}
            className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Place Prediction
          </motion.button>
        </div>
      )}

      {!isSpectator && (
        <div className="text-center py-8">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Only spectators can make predictions during battle.
          </p>
        </div>
      )}
    </motion.div>
  )
}
