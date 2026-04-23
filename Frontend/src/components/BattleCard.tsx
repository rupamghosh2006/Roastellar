'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock3, Eye, Flame, Sparkles, Swords, Users } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <div className={cn(
        'glass glass-hover relative overflow-hidden rounded-[28px] p-6',
        isOpen && 'border-blue-400/20',
        isActive && 'border-violet-400/20'
      )}>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500/12 via-violet-500/10 to-amber-300/8 opacity-70" />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]',
                isOpen ? 'bg-blue-500/14 text-blue-200' : isActive ? 'bg-violet-500/14 text-violet-200' : 'bg-amber-300/14 text-amber-200'
              )}>
                {battle.status}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                <Users className="h-3.5 w-3.5" />
                {battle.spectators}
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
              Pot {battle.pot} XLM
            </div>
          </div>

          <h3 className="font-orbitron text-xl font-bold text-white transition-colors group-hover:text-blue-200">
            {battle.topic}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
            Crowd-fueled roast battle with live votes, predictions, and instant Stellar rewards.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Players</p>
              <div className="mt-3 flex items-center gap-2">
                <AvatarChip name={battle.player1?.username} tone="blue" />
                <span className="text-white/30">vs</span>
                <AvatarChip name={battle.player2?.username} tone="violet" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Window</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-200" />
                  Ends {formatRelativeTime(battle.expiresAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-200" />
                  {battle.player1Votes + battle.player2Votes} votes
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Instant reward settlement
            </div>
            <Link
              href={`/battle/${battle.id}`}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity',
                isOpen
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90'
                  : 'bg-white/8 text-white hover:bg-white/12'
              )}
            >
              {isOpen ? 'Join Battle' : 'Watch Match'}
              <Swords className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AvatarChip({ name, tone }: { name?: string; tone: 'blue' | 'violet' }) {
  const classes = tone === 'blue'
    ? 'from-blue-500/30 to-blue-300/20 text-blue-100'
    : 'from-violet-500/30 to-fuchsia-300/20 text-violet-100'

  return (
    <div className={cn(
      'flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r px-3 py-2 text-sm',
      classes
    )}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-semibold">
        {name?.[0]?.toUpperCase() ?? <Flame className="h-4 w-4" />}
      </div>
      <span className="truncate">{name ?? 'Awaiting challenger'}</span>
    </div>
  )
}

interface BattleListProps {
  battles: Battle[]
  title?: string
  emptyMessage?: string
}

export function BattleList({ battles, title, emptyMessage = 'No battles found' }: BattleListProps) {
  return (
    <div className="space-y-5">
      {title && <h2 className="font-orbitron text-xl font-bold text-white">{title}</h2>}
      {battles.length === 0 ? (
        <div className="glass rounded-[28px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Flame className="h-6 w-6 text-white/25" />
          </div>
          <p className="mt-4 text-lg text-white/72">Arena cooling down</p>
          <p className="mt-2 text-sm text-white/45">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {battles.map((battle, index) => (
            <BattleCard key={battle.id} battle={battle} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
