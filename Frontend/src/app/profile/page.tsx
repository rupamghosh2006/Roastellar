'use client'

import { useEffect, useState } from 'react'
import { Award, PenSquare, ShieldCheck, Swords, Trophy } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type User } from '@/lib/api'
import { formatAddress, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRoutes.users.me()
      .then((response) => setUser(response.data))
      .catch((error) => console.error('Failed to load profile:', error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <PageLoader message="Loading profile" />
        </main>
      </div>
    )
  }

  const winRate = user ? ((user.wins / Math.max(user.wins + user.losses, 1)) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="glass rounded-[36px] p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-500/22 to-violet-500/18 font-orbitron text-4xl text-white">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/35">Profile</p>
                  <h1 className="mt-2 font-orbitron text-4xl font-bold text-white">{user?.username}</h1>
                  <p className="mt-2 text-white/55">Member since {formatDate(user?.createdAt ?? new Date())}</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-medium text-white/82">
                <PenSquare className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Stat label="XP" value={(user?.xp ?? 0).toLocaleString()} icon={<Award className="h-5 w-5 text-blue-200" />} />
            <Stat label="Wins" value={String(user?.wins ?? 0)} icon={<Trophy className="h-5 w-5 text-amber-200" />} />
            <Stat label="Losses" value={String(user?.losses ?? 0)} icon={<Swords className="h-5 w-5 text-violet-200" />} />
            <Stat label="Win Rate" value={`${winRate}%`} icon={<ShieldCheck className="h-5 w-5 text-emerald-200" />} />
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="glass rounded-[36px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/35">Wallet address</p>
              <p className="mt-4 break-all text-white/78">{user?.walletAddress ? formatAddress(user.walletAddress, 8) : 'Wallet not linked yet'}</p>
            </div>

            <div className="glass rounded-[36px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/35">Badges</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(user?.badges?.length ? user.badges : ['Rising Roaster', 'Wallet Ready']).map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-[28px] p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/35">
        {icon}
        {label}
      </div>
      <p className="mt-4 font-orbitron text-3xl text-white">{value}</p>
    </div>
  )
}
