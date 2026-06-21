'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock3, Coins, Eye, Flame, Swords } from 'lucide-react'
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

  const statusDotClasses = isOpen
    ? 'bg-sky-300 shadow-[0_0_16px_rgba(148,163,244,0.6)]'
    : isActive
      ? 'bg-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.6)]'
      : 'bg-[#F0D492] shadow-[0_0_16px_rgba(240,212,146,0.6)]'

  const borderClasses = isOpen
    ? 'border-sky-300/30'
    : isActive
      ? 'border-violet-300/30'
      : 'border-[#B88A35]/40'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      {/* Outer border shell — overflow-hidden clips all children */}
      <div className={cn(
        'relative h-full overflow-hidden rounded-[28px] border p-[1.5px] transition-all duration-300',
        'shadow-[0_0_60px_rgba(184,138,53,0.15),0_20px_60px_rgba(0,0,0,0.5)]',
        'hover:shadow-[0_0_80px_rgba(184,138,53,0.25),0_30px_80px_rgba(0,0,0,0.6)]',
        borderClasses,
      )}>
        {/* Decorative inner rim highlights */}
        <div className="pointer-events-none absolute inset-0 rounded-[27px] bg-gradient-to-br from-white/8 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B88A35]/40 to-transparent" />

        {/* Card body */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-gradient-to-br from-[#0F1419] via-[#0B0F14] to-[#050608]/98 p-5 backdrop-blur-sm sm:p-6">
          {/* Corner glows — pointer-events-none keeps them decorative */}
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-[#B88A35]/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-sky-300/3 blur-3xl" />

          {/* ── Header row: status badge + title + pot ── */}
          <div className="relative flex min-w-0 items-start gap-3">
            {/* Left: badge + title — min-w-0 + overflow-hidden allow truncation */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className={cn(
                'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5',
                'text-[9px] font-bold uppercase tracking-[0.32em] backdrop-blur-sm transition-all duration-300',
                statusClasses,
              )}>
                <span className={cn('h-1.5 w-1.5 shrink-0 animate-pulse rounded-full', statusDotClasses)} />
                <span className="shrink-0">{battle.status}</span>
              </div>

              {/* Title — break-words prevents single long word overflow; line-clamp caps height */}
              <h3 className={cn(
                'mt-4 line-clamp-2 break-words font-orbitron text-xl font-black leading-tight tracking-[0.02em] text-white',
                'transition-all duration-300 sm:text-2xl',
                'group-hover:text-[#F0D492] group-hover:drop-shadow-[0_0_20px_rgba(240,212,146,0.4)]',
              )}>
                {battle.topic}
              </h3>
            </div>

            {/* Pot badge — shrink-0 + fixed max-w so it never crushes the title */}
            <div className="mt-0.5 max-w-[96px] shrink-0 rounded-2xl border border-[#B88A35]/40 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/10 px-3 py-2.5 text-right shadow-[0_8px_32px_rgba(184,138,53,0.15)] backdrop-blur-md sm:max-w-[112px]">
              <div className="flex items-center justify-end gap-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#F0D492]/80">
                <Coins className="h-3 w-3 shrink-0" />
                <span className="leading-none">Pot</span>
              </div>
              <p className="mt-1.5 truncate font-orbitron text-sm font-bold bg-gradient-to-r from-[#F0D492] to-[#E8C063] bg-clip-text text-transparent sm:text-base">
                {battle.pot} XLM
              </p>
            </div>
          </div>

          {/* ── Players + Metrics ── */}
          {/*
            On mobile  : players section fills full width, metrics sit below as a 2-col row.
            On sm+     : side-by-side — players flex-1, metrics fixed 152px column.
          */}
          <div className="relative mt-6 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            {/* Players lobby */}
            <div className="min-w-0 flex-1 overflow-hidden rounded-[20px] border border-white/15 bg-gradient-to-br from-white/8 to-white/3 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/50">Players</p>
                <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[9px] font-semibold text-white/50 backdrop-blur-sm">
                  Lobby
                </span>
              </div>

              {/* 3-col grid: player1 | VS | player2 */}
              <div className="grid min-w-0 grid-cols-[1fr_36px_1fr] items-center gap-2">
                <PlayerSlot name={playerOneName} tone="blue" />

                {/* VS badge — fixed border colour (no gradient border in Tailwind) */}
                <div className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B88A35]/50 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/5 font-orbitron text-[8px] font-bold text-[#F0D492] shadow-[0_0_20px_rgba(184,138,53,0.2)]">
                  VS
                </div>

                <PlayerSlot name={playerTwoName} tone="gold" isEmpty={!battle.player2} />
              </div>
            </div>

            {/* Metrics column — 2-col on mobile, stacked at sm+ */}
            <div className="grid grid-cols-2 gap-3 sm:w-36 sm:shrink-0 sm:grid-cols-1">
              <MetricTile icon={Clock3} label="Ends" value={formatRelativeTime(battle.expiresAt)} tone="gold" />
              <MetricTile icon={Eye} label="Votes" value={votes.toLocaleString()} tone="blue" />
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="relative mt-5 flex justify-end">
            <Link
              href={`/battle/${battle.matchId || battle.id}`}
              className={cn(
                'group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3',
                'text-sm font-bold whitespace-nowrap transition-all duration-300',
                isOpen
                  ? [
                      'bg-gradient-to-r from-[#B88A35] to-[#D1A24A] text-slate-950',
                      'shadow-[0_0_30px_rgba(184,138,53,0.4),0_12px_32px_rgba(184,138,53,0.25)]',
                      'hover:scale-105 hover:shadow-[0_0_50px_rgba(184,138,53,0.6),0_20px_48px_rgba(184,138,53,0.35)]',
                      'active:scale-95',
                    ]
                  : [
                      'border-2 border-white/20 bg-gradient-to-r from-white/12 to-white/5 text-white',
                      'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
                      'hover:border-white/40 hover:from-white/20 hover:to-white/8 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]',
                    ],
              )}
            >
              {isOpen ? 'Join Battle' : 'Watch Match'}
              <Swords className="h-4 w-4 shrink-0 transition-transform group-hover/btn:rotate-12" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────

type PlayerTone = 'blue' | 'gold'

function PlayerSlot({
  name,
  tone,
  isEmpty = false,
}: {
  name: string
  tone: PlayerTone
  isEmpty?: boolean
}) {
  const isBlue = tone === 'blue'

  const slotBg = isBlue
    ? 'border-sky-300/30 bg-gradient-to-br from-sky-300/15 to-sky-300/5'
    : 'border-[#B88A35]/35 bg-gradient-to-br from-[#B88A35]/15 to-[#8B5C1E]/5'

  const avatarBg = isBlue
    ? 'bg-gradient-to-br from-sky-300/30 to-sky-300/10 text-sky-200 shadow-[0_0_16px_rgba(148,163,244,0.2)]'
    : 'bg-gradient-to-br from-[#B88A35]/30 to-[#8B5C1E]/10 text-[#F0D492] shadow-[0_0_16px_rgba(184,138,53,0.2)]'

  const subText = isBlue ? 'text-sky-200/60' : 'text-[#F0D492]/60'

  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-2xl border p-3 backdrop-blur-sm transition-all duration-300',
        'shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
        slotBg,
        isEmpty && 'border-dashed opacity-70',
        !isEmpty && 'group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Avatar */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
            'font-orbitron text-xs font-bold transition-all duration-300',
            avatarBg,
          )}
        >
          {isEmpty ? <Flame className="h-4 w-4 animate-pulse" /> : name[0]?.toUpperCase()}
        </div>

        {/* Name + label — min-w-0 on this wrapper is the crucial fix for truncate to work */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{name}</p>
          <p
            className={cn(
              'mt-0.5 text-[8px] font-semibold uppercase tracking-[0.2em]',
              isEmpty ? 'text-white/40' : subText,
            )}
          >
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
  const isBlue = tone === 'blue'

  const iconClasses = isBlue
    ? 'text-sky-200 bg-gradient-to-br from-sky-300/25 to-sky-300/8 shadow-[0_0_16px_rgba(148,163,244,0.15)]'
    : 'text-[#F0D492] bg-gradient-to-br from-[#B88A35]/25 to-[#8B5C1E]/8 shadow-[0_0_16px_rgba(184,138,53,0.15)]'

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/15 bg-gradient-to-br from-white/10 to-white/4 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/50">{label}</p>
      <div className="mt-3 flex min-w-0 items-center gap-2">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300', iconClasses)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="min-w-0 truncate text-xs font-bold text-white sm:text-sm">{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// BattleList
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