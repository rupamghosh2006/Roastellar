'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { BattleCard } from '@/components/BattleCard'
import { useOpenBattles } from '@/lib/hooks'
import { Swords, Plus } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function BattlesPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { battles, loading, error } = useOpenBattles()
  const [isCreating, setIsCreating] = useState(searchParams.get('action') === 'create')
  const [formData, setFormData] = useState({ topic: '', entryFee: '10' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  const handleCreateBattle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.topic.trim()) {
      toast.error('Enter a battle topic')
      return
    }

    const fee = parseFloat(formData.entryFee)
    if (isNaN(fee) || fee < 0) {
      toast.error('Enter a valid entry fee')
      return
    }

    setIsSubmitting(true)
    try {
      // Upload topic to IPFS
      const topicResponse = await api.post('/uploads/ipfs', {
        data: { topic: formData.topic },
      })

      // Create battle
      await api.post('/battles/create', {
        topic: formData.topic,
        entryFee: fee,
        topicCid: topicResponse.data.data.cid,
      })

      toast.success('Battle created!')
      setFormData({ topic: '', entryFee: '10' })
      setIsCreating(false)
      // Refresh battles
      router.refresh()
    } catch (error) {
      toast.error('Failed to create battle')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <Swords className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Active Battles</h1>
                  <p className="text-muted-foreground">
                    {battles.length} open battle{battles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Battle
              </motion.button>
            </motion.div>

            {/* Create Battle Form */}
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-lg p-8 mb-8"
              >
                <h2 className="text-2xl font-bold mb-6">Create a New Battle</h2>
                <form onSubmit={handleCreateBattle} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Battle Topic</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Web3 vs Traditional Finance"
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-lg bg-card border border-card focus:border-primary focus:outline-none transition"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.topic.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Entry Fee (XLM)</label>
                    <input
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 rounded-lg bg-card border border-card focus:border-primary focus:outline-none transition"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-lg gradient-primary text-primary-foreground font-bold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Battle'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-3 rounded-lg border border-primary/50 text-primary font-bold hover:bg-primary/10 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Battles Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass rounded-lg p-6 h-64 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="glass rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Failed to load battles</p>
              </div>
            ) : battles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-lg p-12 text-center"
              >
                <div className="text-5xl mb-4">🏜️</div>
                <h3 className="text-xl font-bold mb-2">No Open Battles</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to create a battle and challenge other players!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-bold"
                >
                  Start a Battle
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {battles.map((battle, index) => (
                  <motion.div
                    key={battle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BattleCard battle={battle} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
