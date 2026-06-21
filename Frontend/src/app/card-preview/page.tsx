'use client'

import { motion } from 'framer-motion'
import { Clock3, Coins, Eye, Flame, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const mockBattle = {
  id: 'mock-1',
  topic: 'Roast AI Web3 Influencers',
  pot: 15,
  status: 'open' as const,
  expiresAt: new Date(Date.now() + 55 * 1000).toISOString(),
  player1: { username: 'Creator' },
  player2: null,
  player1Votes: 0,
  player2Votes: 0,
  matchId: 'mock-1',
}

const mockBattle2 = {
  ...mockBattle,
  id: 'mock-2',
  topic: 'Roast Web3 Communities',
  pot: 5,
  status: 'open' as const,
  player1: { username: 'Creator' },
  player2: { username: 'Challenger' },
  player1Votes: 234,
  player2Votes: 189,
}

export default function CardPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#0D1117] to-[#050608] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="font-orbitron text-5xl font-black text-white mb-4">Premium Battle Cards</h1>
          <p className="text-xl text-white/60">Enhanced design with luxury aesthetics</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {[mockBattle, mockBattle2].map((battle, index) => (
            <PreviewBattleCard key={battle.id} battle={battle} index={index} />
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-12">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-6">Design Enhancements</h2>
          <div className="grid gap-6 md:grid-cols-2 text-white/80">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">✨ Premium Shadows & Depth</h3>
              <p className="text-sm">Enhanced shadow effects and multi-layered lighting create a luxurious look with better visual hierarchy.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">🎨 Luxury Color Palette</h3>
              <p className="text-sm">Gold accents (#B88A35), deep navy backgrounds, and white gradients for a sophisticated appearance.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">✏️ Enhanced Typography</h3>
              <p className="text-sm">Better spacing, improved letter tracking, and gradient text effects for the pot amount.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">🔆 Premium Borders & Glows</h3>
              <p className="text-sm">Gradient borders, subtle glow effects, and improved backdrop blur for a high-end card appearance.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">🎯 Interactive Elements</h3>
              <p className="text-sm">Smooth hover states, animated indicators, and engaging button effects with gradient overlays.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2">💫 Visual Polish</h3>
              <p className="text-sm">Decorative corner accents, improved spacing, and refined component styling throughout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Battle {
  id: string
  topic: string
  pot: number
  status: 'open' | 'active' | 'voting'
  expiresAt: string
  player1?: { username: string }
  player2?: { username: string } | null
  player1Votes: number
  player2Votes: number
  matchId: string
}

interface PreviewCardProps {
  battle: Battle
  index: number
}

function PreviewBattleCard({ battle, index }: PreviewCardProps) {
  const isOpen = battle.status === 'open'
  const votes = battle.player1Votes + battle.player2Votes
  const playerOneName = battle.player1?.username ?? 'Creator'
  const playerTwoName = battle.player2?.username ?? 'Open seat'

  const formatRelativeTime = (date: string) => {
    const ms = new Date(date).getTime() - Date.now()
    const secs = Math.floor(ms / 1000)
    if (secs < 60) return `${secs}s`
    const mins = Math.floor(secs / 60)
    return `${mins}m`
  }

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
        !isOpen && 'border-[#B88A35]/40'
      )}>
        {/* Premium gradient border effect */}
        <div className="absolute inset-0 rounded-[27px] bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B88A35]/40 to-transparent" />

        <div className="relative flex h-full flex-col rounded-[27px] bg-gradient-to-br from-[#0F1419] via-[#0B0F14] to-[#050608]/98 p-5 sm:p-6 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute -top-1 -right-1 w-24 h-24 bg-[#B88A35]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-32 h-32 bg-sky-300/3 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.32em] backdrop-blur-sm',
                'transition-all duration-300 border-sky-300/25 bg-sky-300/10 text-sky-100'
              )}>
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full animate-pulse',
                  'bg-sky-300 shadow-[0_0_16px_rgba(148,163,244,0.6)]'
                )} />
                {battle.status}
              </div>
              <h3 className="mt-5 line-clamp-2 font-orbitron text-3xl font-black leading-[0.98] text-white tracking-[0.02em] transition-all duration-300 group-hover:text-[#F0D492] group-hover:drop-shadow-[0_0_20px_rgba(240,212,146,0.4)] sm:text-4xl">
                {battle.topic}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl border border-[#B88A35]/40 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/10 px-4 py-2.5 text-right backdrop-blur-md shadow-[0_8px_32px_rgba(184,138,53,0.15)]">
              <div className="flex items-center justify-end gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#F0D492]/80 font-semibold">
                <Coins className="h-4 w-4" />
                Pot
              </div>
              <p className="mt-1.5 font-orbitron text-lg font-bold bg-gradient-to-r from-[#F0D492] to-[#E8C063] bg-clip-text text-transparent">{battle.pot} XLM</p>
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br from-[#B88A35]/20 to-[#8B5C1E]/5 font-orbitron text-[9px] font-bold text-[#F0D492] shadow-[0_0_20px_rgba(184,138,53,0.2)] backdrop-blur-sm">
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
            <button
              className={cn(
                'inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-bold transition-all duration-300 group/btn relative overflow-hidden',
                'bg-gradient-to-r from-[#B88A35] to-[#D1A24A] text-slate-950 shadow-[0_0_30px_rgba(184,138,53,0.4),0_12px_32px_rgba(184,138,53,0.25)] hover:shadow-[0_0_50px_rgba(184,138,53,0.6),0_20px_48px_rgba(184,138,53,0.35)] hover:scale-105 active:scale-95'
              )}
            >
              Join Battle
              <Swords className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
            </button>
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
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className={cn(
            'mt-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold',
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
