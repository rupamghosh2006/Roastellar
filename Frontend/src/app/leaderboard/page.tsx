'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { useLeaderboard } from '@/lib/hooks'
import { Trophy, Medal } from 'lucide-react'

const medals = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const { leaderboard, loading, error } = useLeaderboard()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  const topThree = leaderboard.slice(0, 3)
  const restPlayers = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-accent" />
                <h1 className="text-3xl sm:text-4xl font-bold">Global Leaderboard</h1>
              </div>
              <p className="text-muted-foreground">
                The elite players climbing to the top of Roastellar
              </p>
            </motion.div>

            {/* Podium for top 3 */}
            {!loading && topThree.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Second Place (Left) */}
                  {topThree[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass rounded-lg p-6 text-center"
                    >
                      <div className="text-4xl mb-2">🥈</div>
                      <h3 className="font-bold mb-1">{topThree[1].username}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{topThree[1].xp}</p>
                      <p className="text-sm text-muted-foreground">XP</p>
                    </motion.div>
                  )}

                  {/* First Place (Center) */}
                  {topThree[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="glass rounded-lg p-8 text-center border-2 border-accent"
                    >
                      <div className="text-5xl mb-4">🥇</div>
                      <h3 className="font-bold mb-2 text-lg">{topThree[0].username}</h3>
                      <p className="text-3xl font-bold gradient-accent bg-clip-text text-transparent mb-2">
                        {topThree[0].xp}
                      </p>
                      <p className="text-sm text-muted-foreground">XP</p>
                    </motion.div>
                  )}

                  {/* Third Place (Right) */}
                  {topThree[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="glass rounded-lg p-6 text-center"
                    >
                      <div className="text-4xl mb-2">🥉</div>
                      <h3 className="font-bold mb-1">{topThree[2].username}</h3>
                      <p className="text-2xl font-bold text-secondary mb-2">{topThree[2].xp}</p>
                      <p className="text-sm text-muted-foreground">XP</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Full Leaderboard Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        Player
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        XP
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        Wins
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        Win Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Loading leaderboard...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Failed to load leaderboard
                        </td>
                      </tr>
                    ) : leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No players yet
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((player, index) => {
                        const winRate =
                          player.wins + player.losses > 0
                            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
                            : '0'

                        return (
                          <motion.tr
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-card/30 transition"
                          >
                            <td className="px-6 py-4 font-semibold">
                              <span className="text-lg">{medals[index] || `#${index + 1}`}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium">{player.username}</p>
                                <p className="text-xs text-muted-foreground">{player.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-primary">{player.xp}</span>
                            </td>
                            <td className="px-6 py-4">{player.wins}</td>
                            <td className="px-6 py-4">
                              <span className="text-accent font-medium">{winRate}%</span>
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
