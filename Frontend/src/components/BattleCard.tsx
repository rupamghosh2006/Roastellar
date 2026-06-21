'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock3, Coins, Eye, Flame, Sparkles, Swords, Users } from 'lucide-react'
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
      whileHover={{ y: -6 }}
      className="group"
    >
      <div className={cn(
        'relative h-full overflow-hidden rounded-[30px] border bg-[#111820]/92 p-[1px] shadow-[0_24px_80px_rgba(0,0,0,0.42)] transition-all duration-300',
        isOpen && 'border-sky-300/24',
        isActive && 'border-violet-300/24',
        !isOpen && !isActive && 'border-[#B88A35]/24'
      )}>
        <div className="absolute inset-x-5 top-0 h-px bg-white/18" />
        <div className="absolute bottom-0 left-8 right-8 h-px bg-[#B88A35]/35" />

        <div className="relative flex h-full flex-col rounded-[29px] bg-[#0B0F14]/96 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em]',
                statusClasses
              )}>
                <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
                {battle.status}
              </div>
              <h3 className="mt-4 line-clamp-2 font-orbitron text-2xl font-black leading-tight text-white tracking-[0.02em] transition-colors group-hover:text-[#F0D492] sm:text-3xl">
                {battle.topic}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl border border-[#B88A35]/24 bg-[#B88A35]/12 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#F0D492]/70">
                <Coins className="h-3.5 w-3.5" />
                Pot
              </div>
              <p className="mt-1 font-orbitron text-sm font-bold text-[#F0D492]">{battle.pot} XLM</p>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-6 text-white/54">
            Crowd-fueled roast battle with live votes, predictions, and instant Stellar rewards.
          </p>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[22px] border border-white/10 bg-[#151B21] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">Players</p>
                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] text-white/45">Duel lobby</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <PlayerSlot name={playerOneName} tone="blue" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B88A35]/25 bg-[#B88A35]/12 font-orbitron text-[10px] font-bold text-[#F0D492]">
                  VS
                </div>
                <PlayerSlot name={playerTwoName} tone="gold" isEmpty={!battle.player2} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <MetricTile icon={Clock3} label="Ends" value={formatRelativeTime(battle.expiresAt)} tone="gold" />
              <MetricTile icon={Eye} label="Votes" value={votes.toLocaleString()} tone="blue" />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs text-white/48">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B88A35]/12 text-[#F0D492]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>Instant settlement after final vote</span>
            </div>

            <Link
              href={`/battle/${battle.matchId || battle.id}`}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200',
                isOpen
                  ? 'bg-[#B88A35] text-slate-950 shadow-[0_14px_34px_rgba(184,138,53,0.22)] hover:bg-[#D1A24A]'
                  : 'border border-white/10 bg-white/8 text-white hover:bg-white/12'
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

type PlayerTone = 'blue' | 'gold'

function PlayerSlot({ name, tone, isEmpty = false }: { name: string; tone: PlayerTone; isEmpty?: boolean }) {
  const classes = tone === 'blue'
    ? 'border-sky-300/18 bg-sky-300/8 text-sky-100'
    : 'border-[#B88A35]/20 bg-[#B88A35]/10 text-[#F0D492]'

  return (
    <div className={cn(
      'min-w-0 rounded-2xl border p-3',
      classes,
      isEmpty && 'border-dashed opacity-75'
    )}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/25 font-orbitron text-sm font-bold">
          {isEmpty ? <Flame className="h-4 w-4" /> : name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/32">
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
  const toneClasses = tone === 'blue' ? 'text-sky-200 bg-sky-300/8' : 'text-[#F0D492] bg-[#B88A35]/10'

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#151B21] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', toneClasses)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="min-w-0 truncate text-sm font-semibold text-white/72">{value}</p>
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
