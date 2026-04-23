'use client'

import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader } from '@/components/LoadingScreen'
import { useEffect, useState } from 'react'
import { apiRoutes } from '@/lib/api'
import type { Battle } from '@/lib/api'
import { Swords, Plus } from 'lucide-react'
import Link from 'next/link'

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const response = await apiRoutes.battles.open()
        setBattles(response.data)
      } catch (error) {
        console.error('Failed to fetch battles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBattles()
  }, [])

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white mb-2">Battles</h1>
            <p className="text-white/60">Join or create epic roast battles</p>
          </div>
          <Link
            href="/battles/create"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            <Plus className="w-5 h-5" />
            Create Battle
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Swords className="w-6 h-6 text-primary" />
                <h2 className="font-orbitron text-xl font-bold text-white">Open Battles</h2>
              </div>
              <BattleList 
                battles={battles.filter(b => b.status === 'open')} 
                emptyMessage="No open battles available"
              />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                </div>
                <h2 className="font-orbitron text-xl font-bold text-white">Live Battles</h2>
              </div>
              <BattleList 
                battles={battles.filter(b => b.status === 'active')} 
                emptyMessage="No live battles right now"
              />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}