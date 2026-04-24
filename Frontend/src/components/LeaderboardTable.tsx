'use client'

import { motion } from 'framer-motion'
import { Award, Medal, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/api'

export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId?: string
}) {
  return (
    <div className="glass overflow-hidden rounded-[24px] sm:rounded-[32px]">
      <div className="space-y-3 p-3 md:hidden">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'rounded-2xl border border-white/10 bg-white/[0.03] p-4',
              currentUserId === entry.clerkId && 'bg-blue-500/10'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/22 to-violet-500/18 font-semibold text-white">
                  {entry.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{entry.username}</p>
                  <p className="text-xs text-white/50">#{entry.rank} rank</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-orbitron text-sm text-white">{entry.xp.toLocaleString()}</p>
                <p className="text-[11px] text-white/45">XP</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/65">
              <span>{entry.wins} wins</span>
              <span>{entry.winRate.toFixed(1)}% win rate</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left">
              {['Rank', 'User', 'XP', 'Wins', 'Win Rate'].map((heading) => (
                <th key={heading} className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'border-b border-white/8 transition-colors hover:bg-white/[0.03]',
                  currentUserId === entry.clerkId && 'bg-blue-500/10'
                )}
              >
                <td className="px-6 py-5">
                  <RankBadge rank={entry.rank} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/22 to-violet-500/18 font-semibold text-white">
                      {entry.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{entry.username}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {entry.badges?.slice(0, 2).map((badge) => (
                          <span key={badge} className="rounded-full bg-white/6 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 font-orbitron text-white">
                    <TrendingUp className="h-4 w-4 text-blue-200" />
                    {entry.xp.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-5 text-white/85">{entry.wins}</td>
                <td className="px-6 py-5 text-white/70">{entry.winRate.toFixed(1)}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-amber-200">
        <Trophy className="h-5 w-5" />
        #{rank}
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-slate-200">
        <Medal className="h-5 w-5" />
        #{rank}
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-amber-500">
        <Award className="h-5 w-5" />
        #{rank}
      </div>
    )
  }

  return <span className="font-orbitron text-white/40">#{rank}</span>
}

export function Podium({ topThree }: { topThree: LeaderboardEntry[] }) {
  const [first, second, third] = topThree

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[second, first, third].filter(Boolean).map((entry, index) => {
        if (!entry) return null

        const order = [2, 1, 3][index]
        const glow = order === 1
          ? 'from-amber-300/18 to-amber-500/10 border-amber-300/18'
          : order === 2
          ? 'from-slate-300/12 to-slate-500/10 border-slate-200/12'
          : 'from-amber-700/16 to-amber-500/10 border-amber-600/16'

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={cn('glass rounded-[24px] border bg-gradient-to-b p-4 text-center sm:rounded-[32px] sm:p-6', glow)}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 font-orbitron text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">
              {order}
            </div>
            <p className="mt-4 break-all font-orbitron text-xl text-white sm:text-2xl">{entry.username}</p>
            <p className="mt-2 text-sm text-white/50">{entry.xp.toLocaleString()} XP</p>
            <div className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-xs text-white/60 sm:text-sm">
              {entry.wins} wins | {entry.winRate.toFixed(1)}% win rate
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
