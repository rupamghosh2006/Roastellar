'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock3, Coins, Eye, Flame, Swords, Zap } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Battle } from '@/lib/api'
import { AnimatedItem } from '@/components/AnimatedList'

interface BattleCardProps {
  battle: Battle
  index?: number
}

export function BattleCard({ battle, index = 0 }: BattleCardProps) {
  const isOpen = battle.status === 'open'
  const isActive = battle.status === 'active' || battle.status === 'voting'
  const votes = battle.player1Votes + battle.player2Votes
  const playerOneName = battle.player1?.username ?? 'Creator'
  const playerTwoName = battle.player2?.username ?? 'Open seat'
  const statusClasses = isOpen
    ? 'border-sky-300/25 bg-sky-300/10 text-sky-100'
    : isActive
      ? 'border-violet-300/25 bg-violet-300/10 text-violet-100'
      : 'border-[#B88A35]/30 bg-[#B88A35]/12 text-[#F0D492]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className={cn(
        'relative h-full overflow-hidden rounded-[28px] border p-[1.5px] transition-all duration-300',
        'shadow-[0_0_60px_rgba(184,138,53,0.15),0_20px_60px_rgba(0,0,0,0.5)]',
        'hover:shadow-[0_0_80px_rgba(184,138,53,0.25),0_30px_80px_rgba(0,0,0,0.6)]',
        isOpen && 'border-sky-300/30',
        isActive && 'border-violet-300/30',
        !isOpen && !isActive && 'border-[#B88A35]/40'
      )}>
        {/* Premium gradient border effect */}
        <div className="absolute inset-0 rounded-[27px] bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B88A35]/40 to-transparent" />

        <div className="relative flex h-full flex-col rounded-[27px] bg-gradient-to-br from-[#0F1419] via-[#0B0F14] to-[#050608]/98 p-5 sm:p-6 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute -top-1 -right-1 w-24 h-24 bg-[#B88A35]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-32 h-32 bg-sky-300/3 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-start justify-between gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <div className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.32em] backdrop-blur-sm',
                'transition-all duration-300',
                statusClasses
              )}>
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full animate-pulse shrink-0',
                  isOpen && 'bg-sky-300 shadow-[0_0_16px_rgba(148,163,244,0.6)]',
                  isActive && 'bg-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.6)]',
                  !isOpen && !isActive && 'bg-[#F0D492] shadow-[0_0_16px_rgba(240,212,146,0.6)]'
                )} />
                <span className="shrink-0">{battle.status}</span>
              </div>
              <h3 className="mt-5 line-clamp-2 font-orbitron text-2xl sm:text-3xl font-black leading-tight text-white tracking-[0.02em] transition-all duration-300 group-hover:text-[#F0D492] group-hover:drop-shadow-[0_0_20px_rgba(240,212,146,0.4)] break-words">
                {battle.topic}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl border border-[#B88A35]/40 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/10 px-4 py-2.5 text-right backdrop-blur-md shadow-[0_8px_32px_rgba(184,138,53,0.15)]">
              <div className="flex items-center justify-end gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#F0D492]/80 font-semibold whitespace-nowrap">
                <Coins className="h-4 w-4 shrink-0" />
                Pot
              </div>
              <p className="mt-1.5 font-orbitron text-base sm:text-lg font-bold bg-gradient-to-r from-[#F0D492] to-[#E8C063] bg-clip-text text-transparent truncate">{battle.pot} XLM</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-[22px] border border-white/15 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/50">Players</p>
                <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[9px] text-white/50 font-semibold backdrop-blur-sm">Lobby</span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <PlayerSlot name={playerOneName} tone="blue" />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gradient-to-r from-[#B88A35]/60 to-[#8B5C1E]/40 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/5 font-orbitron text-[9px] font-bold text-[#F0D492] shadow-[0_0_20px_rgba(184,138,53,0.2)] backdrop-blur-sm">
                  VS
                </div>
                <PlayerSlot name={playerTwoName} tone="gold" isEmpty={!battle.player2} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:w-56 lg:grid-cols-1">
              <MetricTile icon={Clock3} label="Ends" value={formatRelativeTime(battle.expiresAt)} tone="gold" />
              <MetricTile icon={Eye} label="Votes" value={votes.toLocaleString()} tone="blue" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href={`/battle/${battle.matchId || battle.id}`}
              className={cn(
                'inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-bold transition-all duration-300 group/btn relative overflow-hidden',
                isOpen
                  ? 'bg-gradient-to-r from-[#B88A35] to-[#D1A24A] text-slate-950 shadow-[0_0_30px_rgba(184,138,53,0.4),0_12px_32px_rgba(184,138,53,0.25)] hover:shadow-[0_0_50px_rgba(184,138,53,0.6),0_20px_48px_rgba(184,138,53,0.35)] hover:scale-105 active:scale-95'
                  : 'border-2 border-white/20 bg-gradient-to-r from-white/12 to-white/5 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-white/40 hover:from-white/20 hover:to-white/8 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
              )}
            >
              {isOpen ? 'Join Battle' : 'Watch Match'}
              <Swords className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

type PlayerTone = 'blue' | 'gold'

function PlayerSlot({ name, tone, isEmpty = false }: { name: string; tone: PlayerTone; isEmpty?: boolean }) {
  const isBlueTone = tone === 'blue'
  const classes = isBlueTone
    ? 'border-sky-300/30 bg-gradient-to-br from-sky-300/15 to-sky-300/5'
    : 'border-[#B88A35]/35 bg-gradient-to-br from-[#B88A35]/15 to-[#8B5C1E]/5'

  return (
    <div className={cn(
      'min-w-0 rounded-2xl border p-3.5 backdrop-blur-sm transition-all duration-300',
      'shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
      classes,
      isEmpty && 'border-dashed opacity-70',
      !isEmpty && 'group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-orbitron text-xs font-bold transition-all duration-300',
          isBlueTone 
            ? 'bg-gradient-to-br from-sky-300/30 to-sky-300/10 text-sky-200 shadow-[0_0_16px_rgba(148,163,244,0.2)]'
            : 'bg-gradient-to-br from-[#B88A35]/30 to-[#8B5C1E]/10 text-[#F0D492] shadow-[0_0_16px_rgba(184,138,53,0.2)]'
        )}>
          {isEmpty ? <Flame className="h-5 w-5 animate-pulse" /> : name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs sm:text-sm font-semibold text-white">{name}</p>
          <p className={cn(
            'mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap',
            isEmpty ? 'text-white/40' : isBlueTone ? 'text-sky-200/60' : 'text-[#F0D492]/60'
          )}>
            {isEmpty ? 'Awaiting' : 'Locked'}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3
  label: string
  value: string
  tone: PlayerTone
}) {
  const isBlueTone = tone === 'blue'
  const toneClasses = isBlueTone 
    ? 'text-sky-200 bg-gradient-to-br from-sky-300/25 to-sky-300/8 shadow-[0_0_16px_rgba(148,163,244,0.15)]'
    : 'text-[#F0D492] bg-gradient-to-br from-[#B88A35]/25 to-[#8B5C1E]/8 shadow-[0_0_16px_rgba(184,138,53,0.15)]'

  return (
    <div className="rounded-[22px] border border-white/15 bg-gradient-to-br from-white/10 to-white/4 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/50">{label}</p>
      <div className="mt-3.5 flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300', toneClasses)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="min-w-0 truncate text-sm font-bold text-white">{value}</p>
      </div>
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
        <div className="grid gap-6 xl:grid-cols-2">
          {battles.map((battle, index) => (
            <AnimatedItem key={battle.id} index={index} delay={0.06} className="mb-0">
              <BattleCard battle={battle} index={index} />
            </AnimatedItem>
          ))}
        </div>
      )}
    </div>
  )
}
