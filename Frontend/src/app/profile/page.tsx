'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { PageLoader } from '@/components/LoadingScreen'
import { WalletCard } from '@/components/WalletCard'
import { apiRoutes } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'
import type { User } from '@/lib/api'
import { User as UserIcon, Trophy, TrendingUp, Swords, Badge } from 'lucide-react'

export default function ProfilePage() {
  const { userId } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRoutes.users.me()
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <PageLoader />
        </main>
      </div>
    )
  }

  const winRate = user ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1) : '0'

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-orbitron text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-white/60">Your roast battle statistics</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl glass mb-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-orbitron text-2xl font-bold text-white mb-1">{user?.username}</h2>
                <p className="text-white/50">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatItem icon={<TrendingUp className="w-5 h-5" />} label="XP" value={user?.xp?.toLocaleString() || '0'} />
              <StatItem icon={<Swords className="w-5 h-5" />} label="Wins" value={user?.wins?.toString() || '0'} />
              <StatItem icon={<Swords className="w-5 h-5" />} label="Losses" value={user?.losses?.toString() || '0'} />
              <StatItem icon={<Trophy className="w-5 h-5" />} label="Win Rate" value={`${winRate}%`} />
            </div>
          </motion.div>

          {user?.badges && user.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl glass mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-white">Badges</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge) => (
                  <span key={badge} className="px-4 py-2 rounded-xl bg-accent/20 text-accent font-medium">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {user?.walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl glass"
            >
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Wallet Address</h3>
              </div>
              <p className="text-white/70 font-mono text-sm break-all">{user.walletAddress}</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 text-center">
      <div className="flex items-center justify-center mb-2 text-white/50">{icon}</div>
      <p className="font-orbitron text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  )
}