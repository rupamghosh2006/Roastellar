'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { LeaderboardTable, Podium } from '@/components/LeaderboardTable'
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
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-2xl p-8 border-l-4 border-l-orange-500/40">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Leaderboard</p>
                <h1 className="font-orbitron text-3xl font-bold text-white sm:text-4xl">Top roasters in the arena</h1>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 space-y-8 animate-pulse">
              <div className="grid gap-6 sm:grid-cols-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="h-64 rounded-3xl border border-white/10 bg-white/5" />
                ))}
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="mb-4 h-20 rounded-xl bg-white/10 last:mb-0" />
                ))}
              </div>
            </div>
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
