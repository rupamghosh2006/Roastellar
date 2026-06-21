'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock3, Coins, Eye, Flame, Swords } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Battle } from '@/lib/api'
import { AnimatedItem } from '@/components/AnimatedList'

// ─────────────────────────────────────────────────
// Solid-colour tokens (no gradients anywhere)
// ─────────────────────────────────────────────────
const STATUS = {
  open: {
    card:   'border-sky-500/30',
    badge:  'border-sky-500/30 bg-[#0c1a2e] text-sky-300',
    dot:    'bg-sky-400',
    player: 'border-sky-500/20 bg-[#0c1a2e]',
    avatar: 'bg-[#112236] text-sky-300',
    sub:    'text-sky-400/60',
  },
  active: {
    card:   'border-violet-500/30',
    badge:  'border-violet-500/30 bg-[#150f2e] text-violet-300',
    dot:    'bg-violet-400',
    player: 'border-violet-500/20 bg-[#150f2e]',
    avatar: 'bg-[#1e1040] text-violet-300',
    sub:    'text-violet-400/60',
  },
  ended: {
    card:   'border-[#B88A35]/30',
    badge:  'border-[#B88A35]/30 bg-[#1a1305] text-[#F0D492]',
    dot:    'bg-[#F0D492]',
    player: 'border-[#B88A35]/20 bg-[#1a1305]',
    avatar: 'bg-[#261c04] text-[#F0D492]',
    sub:    'text-[#B88A35]/60',
  },
} as const

interface BattleCardProps {
  battle: Battle
  index?: number
}

export function BattleCard({ battle, index = 0 }: BattleCardProps) {
  const isOpen   = battle.status === 'open'
  const isActive = battle.status === 'active' || battle.status === 'voting'
  const key      = isOpen ? 'open' : isActive ? 'active' : 'ended'
  const s        = STATUS[key]

  const votes        = battle.player1Votes + battle.player2Votes
  const playerOneName = battle.player1?.username ?? 'Creator'
  const playerTwoName = battle.player2?.username ?? 'Open seat'
  const hasP2        = Boolean(battle.player2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      {/* Card shell */}
      <div className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[#0B0F14] transition-all duration-300',
        s.card,
      )}>
        {/* Top accent line */}
        <div className="h-[1px] w-full bg-white/5" />

        <div className="flex flex-1 flex-col p-4 gap-4">

          {/* ── Row 1: Status badge + Pot ── */}
          <div className="flex items-start justify-between gap-2">
            <div className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
              'text-[9px] font-bold uppercase tracking-[0.25em]',
              s.badge,
            )}>
              <span className={cn('h-1.5 w-1.5 shrink-0 animate-pulse rounded-full', s.dot)} />
              {battle.status}
            </div>

            <div className="shrink-0 rounded-xl border border-[#B88A35]/30 bg-[#1a1305] px-3 py-1.5 text-right">
              <div className="flex items-center justify-end gap-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#B88A35]/70">
                <Coins className="h-2.5 w-2.5 shrink-0" />
                Pot
              </div>
              <p className="mt-0.5 font-orbitron text-sm font-bold text-[#F0D492] whitespace-nowrap">
                {battle.pot} XLM
              </p>
            </div>
          </div>

          {/* ── Row 2: Battle title ── */}
          <h3 className={cn(
            'line-clamp-2 break-words font-orbitron text-xl font-black leading-tight tracking-[0.02em] text-white',
            'transition-colors duration-300 group-hover:text-[#F0D492]',
          )}>
            {battle.topic}
          </h3>

          {/* ── Row 3: Players ── */}
          <div className="rounded-xl border border-white/8 bg-[#0d1318]">
            {/* Label row */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-white/5">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/35">Players</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-semibold text-white/35">
                Lobby
              </span>
            </div>

            {/* Slots row */}
            <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-2 p-3">
              {/* Player 1 */}
              <div className={cn('overflow-hidden rounded-lg border p-2', s.player)}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-orbitron text-[10px] font-bold',
                    s.avatar,
                  )}>
                    {playerOneName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-white">{playerOneName}</p>
                    <p className={cn('text-[8px] font-semibold uppercase tracking-wider', s.sub)}>Locked</p>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B88A35]/40 bg-[#1a1305] font-orbitron text-[8px] font-bold text-[#F0D492]">
                VS
              </div>

              {/* Player 2 */}
              <div className={cn(
                'overflow-hidden rounded-lg border p-2',
                hasP2
                  ? 'border-[#B88A35]/20 bg-[#1a1305]'
                  : 'border-dashed border-[#B88A35]/15 bg-[#1a1305]/40 opacity-65',
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#261c04] text-[#F0D492]">
                    {hasP2
                      ? <span className="font-orbitron text-[10px] font-bold">{playerTwoName[0]?.toUpperCase()}</span>
                      : <Flame className="h-3.5 w-3.5 animate-pulse" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-white">{playerTwoName}</p>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-[#B88A35]/50">
                      {hasP2 ? 'Locked' : 'Awaiting'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 4: Metrics (always 2-col) ── */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-[#0d1318] p-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/35">Ends</p>
              <div className="mt-2.5 flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1a1305] text-[#F0D492]">
                  <Clock3 className="h-3.5 w-3.5" />
                </div>
                <p className="truncate text-xs font-bold text-white">
                  {formatRelativeTime(battle.expiresAt)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#0d1318] p-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/35">Votes</p>
              <div className="mt-2.5 flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0c1a2e] text-sky-300">
                  <Eye className="h-3.5 w-3.5" />
                </div>
                <p className="truncate text-xs font-bold text-white">
                  {votes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ── Row 5: CTA button ── */}
          <Link
            href={`/battle/${battle.matchId || battle.id}`}
            className={cn(
              'group/btn mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3',
              'text-sm font-bold transition-all duration-200 active:scale-95',
              isOpen
                ? 'bg-[#B88A35] text-slate-950 hover:bg-[#cfa03e]'
                : 'border border-white/15 bg-[#151d28] text-white hover:bg-[#1c2638]',
            )}
          >
            {isOpen ? 'Join Battle' : 'Watch Match'}
            <Swords className="h-4 w-4 shrink-0 transition-transform group-hover/btn:rotate-12" />
          </Link>

        </div>

        {/* Bottom accent line */}
        <div className="h-[1px] w-full bg-[#B88A35]/15" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// BattleList — unchanged API surface
// ─────────────────────────────────────────────────
interface BattleListProps {
  battles: Battle[]
  title?: string
  emptyMessage?: string
}

export function BattleList({
  battles,
  title,
  emptyMessage = 'No battles found',
}: BattleListProps) {
  return (
    <div className="space-y-5">
      {title && <h2 className="font-orbitron text-xl font-bold text-white">{title}</h2>}

      {battles.length === 0 ? (
        <div className="glass rounded-[28px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Flame className="h-6 w-6 text-white/25" />
          </div>
          <p className="mt-4 text-lg text-white/70">Arena cooling down</p>
          <p className="mt-2 text-sm text-white/45">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {battles.map((battle, i) => (
            <AnimatedItem key={battle.id} index={i} delay={0.06} className="mb-0">
              <BattleCard battle={battle} index={i} />
            </AnimatedItem>
          ))}
        </div>
      )}
    </div>
  )
}