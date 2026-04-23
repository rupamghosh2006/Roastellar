'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LeaderboardTable, Podium } from '@/components/LeaderboardTable'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'
import type { LeaderboardEntry } from '@/lib/api'
import { Trophy } from 'lucide-react'

export default function LeaderboardPage() {
  const { userId } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiRoutes.users.leaderboard()
        setEntries(response.data)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="font-orbitron text-3xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-white/60">Top roasters in the arena</p>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <>
            {entries.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Podium topThree={entries.slice(0, 3)} />
              </motion.div>
            )}

            <LeaderboardTable
              entries={entries}
              currentUserId={userId}
            />
          </>
        )}
      </main>
    </div>
  )
}