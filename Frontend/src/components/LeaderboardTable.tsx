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
  const getPodiumStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-white/20 backdrop-blur-xl border border-white/30',
          textColor: 'text-white',
          height: 'h-80',
          order: 'order-2',
        }
      case 2:
        return {
          bg: 'bg-white/15 backdrop-blur-xl border border-white/25',
          textColor: 'text-white',
          height: 'h-64',
          order: 'order-1',
        }
      case 3:
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          textColor: 'text-white',
          height: 'h-56',
          order: 'order-3',
        }
      default:
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          textColor: 'text-white',
          height: 'h-56',
          order: 'order-4',
        }
    }
  }

  const rankOrder: Record<number, number> = { 1: 0, 2: 1, 3: 2 }
  const sortedTopThree = [...topThree]
    .filter((entry) => [1, 2, 3].includes(entry.rank))
    .sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank])

  return (
    <div className="w-full">
      <div className="mb-16 flex flex-wrap items-end justify-center gap-6">
        {sortedTopThree.map((entry, index) => {
          const styles = getPodiumStyles(entry.rank)
          const rankLabel =
            entry.rank === 1 ? '1st place' : entry.rank === 2 ? '2nd place' : '3rd place'
          const avatarFallback = entry.username?.slice(0, 1).toUpperCase() ?? String(entry.rank)

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex flex-col items-center ${styles.order}`}
            >
              <div className="mb-4">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-lg">
                    {avatarFallback}
                  </div>
                )}
              </div>

              <div
                className={`${styles.bg} ${styles.textColor} ${styles.height} flex w-48 flex-col items-center justify-center rounded-3xl px-6 py-8 shadow-2xl`}
              >
                <div className="mb-6 rounded-full bg-black/80 px-4 py-2 text-sm font-bold text-white">
                  {rankLabel}
                </div>
                <div className="text-center font-orbitron text-4xl font-bold">
                  {entry.xp.toLocaleString()}
                </div>
                <div className="mt-1 text-xs opacity-75">XP</div>
                <div className="mt-4 text-center text-sm font-semibold opacity-90">
                  {entry.username}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
