'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { LeaderboardTable, Podium } from '@/components/LeaderboardTable'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type LeaderboardEntry } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'

export default function LeaderboardPage() {
  const { userId } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRoutes.users.leaderboard()
      .then((response) => setEntries(response.data))
      .catch((error) => console.error('Failed to load leaderboard:', error))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-[36px] p-8">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-200" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-200/75">Leaderboard</p>
                <h1 className="font-orbitron text-4xl font-bold text-white">Top roasters in the arena</h1>
              </div>
            </div>
          </div>

          {loading ? (
            <PageLoader message="Loading leaderboard" />
          ) : (
            <div className="mt-8 space-y-8">
              <Podium topThree={entries.slice(0, 3)} />
              <LeaderboardTable entries={entries} currentUserId={userId ?? undefined} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
