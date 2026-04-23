'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Swords } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Battle } from '@/lib/api'

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRoutes.battles.open()
      .then((response) => setBattles(response.data))
      .catch((error) => console.error('Failed to load battles:', error))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-[36px] p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-blue-200/75">Battle board</p>
                <h1 className="mt-3 font-orbitron text-4xl font-bold text-white">Open matches and live rooms</h1>
                <p className="mt-3 text-white/55">Discover active contests, enter as a player, or watch as a predictor-ready spectator.</p>
              </div>
              <Link
                href="/battles"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Create Contest
              </Link>
            </div>
          </div>

          <div className="mt-8 glass rounded-[36px] p-6">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-blue-200" />
              <h2 className="font-orbitron text-2xl text-white">Arena queue</h2>
            </div>
            <div className="mt-6">
              {loading ? <PageLoader message="Loading battles" /> : <BattleList battles={battles} emptyMessage="No battles are open yet." />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
