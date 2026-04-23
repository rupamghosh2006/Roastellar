'use client'

import { motion } from 'framer-motion'
import { Battle } from '@/lib/api'
import { Users, Flame } from 'lucide-react'
import Link from 'next/link'

export function BattleCard({ battle }: { battle: Battle }) {
  const isOpen = battle.status === 'open'
  const player2Name =
    typeof battle.player2 === 'string' ? battle.player2 : battle.player2?.username || 'Waiting for opponent'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-lg p-6 transition border ${
        isOpen ? 'border-primary/30 hover:border-primary/60' : 'border-card/50'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase mb-1">Battle #{battle.matchId}</p>
            <h3 className="text-lg font-semibold line-clamp-2">{battle.topic}</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOpen
                ? 'bg-accent/20 text-accent'
                : battle.status === 'active'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted/20 text-muted-foreground'
            }`}
          >
            {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Flame className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {typeof battle.player1 === 'string' ? battle.player1 : battle.player1?.username}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className={`font-medium ${!isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
            {player2Name}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">Entry Fee</p>
          <p className="font-semibold">{battle.entryFee} XLM</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Votes</p>
          <p className="font-semibold">{battle.votesPlayer1 + battle.votesPlayer2}</p>
        </div>
      </div>

      {/* Action Button */}
      {isOpen ? (
        <Link
          href={`/battle/${battle.matchId}`}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition text-center text-sm"
        >
          Join Battle
        </Link>
      ) : (
        <Link
          href={`/battle/${battle.matchId}`}
          className="w-full py-2 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/10 transition text-center text-sm"
        >
          Watch Battle
        </Link>
      )}
    </motion.div>
  )
}
