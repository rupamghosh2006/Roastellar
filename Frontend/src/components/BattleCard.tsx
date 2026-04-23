'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Swords, Users, Clock, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Battle } from '@/lib/api'

interface BattleCardProps {
  battle: Battle
  index?: number
}

export function BattleCard({ battle, index = 0 }: BattleCardProps) {
  const isOpen = battle.status === 'open'
  const isActive = battle.status === 'active'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <div className={cn(
        'p-6 rounded-2xl glass glass-hover',
        isOpen && 'border-primary/30',
        isActive && 'border-secondary/30'
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className={cn(
              'w-5 h-5',
              isOpen ? 'text-primary' : 'text-secondary'
            )} />
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              isOpen ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
            )}>
              {battle.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <Users className="w-4 h-4" />
            <span>{battle.spectators}</span>
          </div>
        </div>

        <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
          {battle.topic}
        </h3>

        <p className="text-sm text-white/60 mb-4">
          Pot: <span className="text-accent font-semibold">{battle.pot} XLM</span>
        </p>

        <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
          <Clock className="w-4 h-4" />
          <span>{new Date(battle.expiresAt).toLocaleDateString()}</span>
        </div>

        {battle.player1 && battle.player2 ? (
          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                {battle.player1.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm text-white/70">vs</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold text-sm">
                {battle.player2.username?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
            <Link
              href={`/battles/${battle.id}`}
              className="px-4 py-2 rounded-xl bg-secondary/20 text-secondary text-sm font-medium hover:bg-secondary/30 transition-colors"
            >
              Watch
            </Link>
          </div>
        ) : (
          <Link
            href={`/battles/${battle.id}`}
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-center font-medium hover:opacity-90 transition-opacity text-sm"
          >
            {isOpen ? 'Join Battle' : 'View Details'}
          </Link>
        )}
      </div>
    </motion.div>
  )
}

interface BattleListProps {
  battles: Battle[]
  title?: string
  emptyMessage?: string
}

export function BattleList({ battles, title, emptyMessage = 'No battles found' }: BattleListProps) {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="font-orbitron text-xl font-bold text-white">{title}</h2>
      )}
      {battles.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Flame className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {battles.map((battle, index) => (
            <BattleCard key={battle.id} battle={battle} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}