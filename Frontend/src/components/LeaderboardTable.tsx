'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/api'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Player</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">XP</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Wins</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'border-b border-white/5 hover:bg-white/5 transition-colors',
                  currentUserId === entry.id && 'bg-primary/10'
                )}
              >
                <td className="px-6 py-4">
                  <RankBadge rank={entry.rank} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {entry.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{entry.username}</p>
                      {entry.badges?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {entry.badges.slice(0, 2).map((badge) => (
                            <span key={badge} className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-xs">
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-orbitron font-bold text-white">{entry.xp.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-secondary">{entry.wins}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    'font-semibold',
                    entry.winRate >= 70 ? 'text-accent' : entry.winRate >= 50 ? 'text-secondary' : 'text-white/60'
                  )}>
                    {entry.winRate.toFixed(1)}%
                  </span>
                </td>
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
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <span className="font-orbitron font-bold text-yellow-400">#{rank}</span>
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
          <Medal className="w-5 h-5 text-white" />
        </div>
        <span className="font-orbitron font-bold text-gray-300">#{rank}</span>
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <span className="font-orbitron font-bold text-amber-600">#{rank}</span>
      </div>
    )
  }

  return (
    <span className="font-orbitron font-bold text-white/50">#{rank}</span>
  )
}

interface PodiumProps {
  topThree: LeaderboardEntry[]
}

export function Podium({ topThree }: PodiumProps) {
  const [first, second, third] = topThree

  return (
    <div className="flex items-end justify-center gap-4 py-12">
      {second && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-xl mb-2 ring-4 ring-gray-400/30">
            {second.username?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="font-semibold text-white mb-1">{second.username}</p>
          <p className="text-sm text-gray-400 mb-2">{second.xp.toLocaleString()} XP</p>
          <div className="w-24 h-28 rounded-t-2xl bg-gradient-to-t from-gray-500/30 to-gray-400/10 flex items-center justify-center">
            <span className="font-orbitron text-4xl font-bold text-gray-400">2</span>
          </div>
        </motion.div>
      )}

      {first && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
          </motion.div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl mb-2 ring-4 ring-yellow-400/30 glow-gold">
            {first.username?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="font-semibold text-white mb-1">{first.username}</p>
          <p className="text-sm text-yellow-400 mb-2">{first.xp.toLocaleString()} XP</p>
          <div className="w-32 h-36 rounded-t-2xl bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 flex items-center justify-center glow-gold">
            <span className="font-orbitron text-5xl font-bold text-yellow-400">1</span>
          </div>
        </motion.div>
      )}

      {third && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-xl mb-2 ring-4 ring-amber-600/30">
            {third.username?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="font-semibold text-white mb-1">{third.username}</p>
          <p className="text-sm text-amber-600 mb-2">{third.xp.toLocaleString()} XP</p>
          <div className="w-24 h-20 rounded-t-2xl bg-gradient-to-t from-amber-700/30 to-amber-600/10 flex items-center justify-center">
            <span className="font-orbitron text-4xl font-bold text-amber-600">3</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}