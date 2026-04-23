'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { useUserProfile } from '@/lib/hooks'
import { User, Trophy, Target, Zap, Calendar, Mail, Badge } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser()
  const router = useRouter()
  const { user, loading, error } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', profileCid: '' })

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        profileCid: user.profileCid || '',
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    // Would call API to save profile
    toast.success('Profile updated!')
    setIsEditing(false)
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-primary" />
                <h1 className="text-3xl sm:text-4xl font-bold">Profile</h1>
              </div>
              <p className="text-muted-foreground">View and manage your Roastellar profile</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-lg p-8 mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl flex-shrink-0">
                  {clerkUser?.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {user?.username || clerkUser?.username || 'Champion'}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </motion.button>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="border-t pt-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-card border border-card hover:border-primary/50 focus:border-primary focus:outline-none transition"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6 mb-8"
            >
              <div className="glass rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-5 h-5 text-accent" />
                  <p className="text-sm font-semibold text-muted-foreground">Rank</p>
                </div>
                <p className="text-3xl font-bold">#{user?.rankPoints || 0}</p>
              </div>
              <div className="glass rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">Total XP</p>
                </div>
                <p className="text-3xl font-bold">{user?.xp || 0}</p>
              </div>
              <div className="glass rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">Wins</p>
                </div>
                <p className="text-3xl font-bold">{user?.wins || 0}</p>
              </div>
              <div className="glass rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="w-5 h-5 text-secondary" />
                  <p className="text-sm font-semibold text-muted-foreground">Badges</p>
                </div>
                <p className="text-3xl font-bold">{user?.badges?.length || 0}</p>
              </div>
            </motion.div>

            {/* Badges Section */}
            {user?.badges && user.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-lg p-8 mb-8"
              >
                <h3 className="text-xl font-bold mb-6">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {user.badges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center text-3xl hover:scale-110 transition cursor-pointer"
                      title={badge}
                    >
                      {badge}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Match History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-lg p-8"
            >
              <h3 className="text-xl font-bold mb-6">Recent Battles</h3>
              <div className="space-y-4">
                {[
                  { battle: 'Battle #42', opponent: 'Player2', result: 'Win', xp: '+50' },
                  { battle: 'Battle #41', opponent: 'Player3', result: 'Loss', xp: '+10' },
                  { battle: 'Battle #40', opponent: 'Player4', result: 'Win', xp: '+50' },
                ].map((match, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{match.battle}</p>
                      <p className="text-sm text-muted-foreground">vs {match.opponent}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          match.result === 'Win' ? 'text-accent' : 'text-muted-foreground'
                        }`}
                      >
                        {match.result}
                      </p>
                      <p className="text-sm text-muted-foreground">{match.xp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
