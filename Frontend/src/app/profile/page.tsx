'use client'

import { useEffect, useState } from 'react'
import { SignOutButton, useAuth } from '@clerk/nextjs'
import { Award, LogOut, PenSquare, ShieldCheck, Swords, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { apiRoutes, type User } from '@/lib/api'
import { formatAddress, formatDate } from '@/lib/utils'
import { clearWalletAuthSession, getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'
import PrismaticTiltCard from '@/components/PrismaticTiltCard'

export default function ProfilePage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const walletMode = isWalletAuthenticated()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    Promise.resolve(walletMode ? getWalletAuthToken() : getToken({ skipCache: true }))
      .then((token) => {
        if (!token) throw new Error('Missing auth token')
        return apiRoutes.users.me(token)
      })
      .then((response) => {
        setUser(response.data)
        setUsername(response.data.username ?? '')
        setFirstName(response.data.firstName ?? '')
        setLastName(response.data.lastName ?? '')
      })
      .catch((error) => console.error('Failed to load profile:', error))
      .finally(() => setLoading(false))
  }, [getToken, isLoaded, isSignedIn, router])

  const handleSave = async () => {
    if (!user) {
      return
    }

    const normalizedUsername = username.trim()
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
      toast.error('Username must be 3-20 chars and use letters, numbers, or underscore.')
      return
    }

    try {
      setSaving(true)
      const token = walletMode ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) throw new Error('Missing auth token')

      const response = await apiRoutes.users.updateProfile({
        username: normalizedUsername,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }, token)

      setUser(response.data)
      setUsername(response.data.username ?? normalizedUsername)
      setFirstName(response.data.firstName ?? firstName.trim())
      setLastName(response.data.lastName ?? lastName.trim())
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="glass h-56 rounded-2xl border-l-4 border-l-violet-500/30" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="glass h-32 rounded-2xl border-l-4 border-l-white/20" />
              ))}
            </div>
            <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="glass h-36 rounded-2xl border-l-4 border-l-cyan-500/30" />
              <div className="glass h-36 rounded-2xl border-l-4 border-l-violet-500/30" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const winRate = user ? ((user.wins / Math.max(user.wins + user.losses, 1)) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-8 border-l-4 border-l-violet-500/40">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#B88A35]/18 font-orbitron text-4xl font-bold text-white">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
                  <h1 className="mt-2 font-orbitron text-3xl font-bold text-white sm:text-4xl">{user?.username}</h1>
                  <p className="mt-2 text-slate-400">Member since {formatDate(user?.createdAt ?? new Date())}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEditing((value) => !value)}
                  className="btn-secondary"
                >
                  <PenSquare className="h-4 w-4" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                {walletMode ? (
                  <button
                    onClick={() => {
                      clearWalletAuthSession()
                      toast.success('Wallet session disconnected')
                      router.push('/')
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-5 py-3 font-medium text-red-200 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect Wallet Session
                  </button>
                ) : (
                  <SignOutButton>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-5 py-3 font-medium text-red-200 transition-colors">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </SignOutButton>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Username (unique)</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="your_unique_name"
                    className="input-glass w-full"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">First Name</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    className="input-glass w-full"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Name</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    className="input-glass w-full"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Stat label="XP" value={(user?.xp ?? 0).toLocaleString()} icon={<Award className="h-5 w-5 text-violet-300" />} accentColor="violet" />
            <Stat label="Wins" value={String(user?.wins ?? 0)} icon={<Trophy className="h-5 w-5 text-orange-400" />} accentColor="orange" />
            <Stat label="Losses" value={String(user?.losses ?? 0)} icon={<Swords className="h-5 w-5 text-red-400" />} accentColor="red" />
            <Stat label="Win Rate" value={`${winRate}%`} icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />} accentColor="emerald" />
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="glass rounded-2xl p-6 border-l-4 border-l-cyan-500/40">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Wallet address</p>
              <p className="mt-4 break-all text-slate-300 font-mono text-sm">{user?.walletAddress ? formatAddress(user.walletAddress, 8) : 'Wallet not linked yet'}</p>
            </div>

            <div className="glass rounded-2xl p-6 border-l-4 border-l-violet-500/40">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Badges</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(user?.badges ?? []).map((badge) => (
                  <span key={badge} className="chip-violet">
                    {badge}
                  </span>
                ))}
                {!user?.badges?.length && (
                  <p className="text-sm text-slate-400">No badges earned yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function Stat({ label, value, icon, accentColor = 'blue' }: { label: string; value: string; icon: React.ReactNode; accentColor?: string }) {
  const borderColors: Record<string, string> = {
    violet: 'border-l-violet-500/50',
    orange: 'border-l-orange-500/50',
    red: 'border-l-red-500/50',
    emerald: 'border-l-emerald-500/50',
  };
  return (
    <PrismaticTiltCard radius={16}>
      <div className={`glass rounded-2xl p-5 border-l-4 ${borderColors[accentColor] || 'border-l-blue-500/50'}`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
          {icon}
          {label}
        </div>
        <p className="mt-4 font-orbitron text-3xl text-white">{value}</p>
      </div>
    </PrismaticTiltCard>
  )
}
