'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Award, PenSquare, ShieldCheck, Swords, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type User } from '@/lib/api'
import { formatAddress, formatDate } from '@/lib/utils'

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

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    getToken({ skipCache: true })
      .then((token) => {
        if (!token) {
          throw new Error('Missing Clerk session token')
        }
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
      const token = await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing Clerk session token')
      }

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
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoader message="Loading profile" />
        </main>
      </div>
    )
  }

  const winRate = user ? ((user.wins / Math.max(user.wins + user.losses, 1)) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="glass rounded-[28px] p-5 sm:rounded-[36px] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-500/22 to-violet-500/18 font-orbitron text-4xl text-white">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/35">Profile</p>
                  <h1 className="mt-2 font-orbitron text-3xl font-bold text-white sm:text-4xl">{user?.username}</h1>
                  <p className="mt-2 text-white/55">Member since {formatDate(user?.createdAt ?? new Date())}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 font-medium text-white/82"
              >
                <PenSquare className="h-4 w-4" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {isEditing && (
              <div className="mt-6 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/45">Username (unique)</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="your_unique_name"
                    className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/45">First Name</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/45">Last Name</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}
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
                {(user?.badges ?? []).map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
                    {badge}
                  </span>
                ))}
                {!user?.badges?.length && (
                  <p className="text-sm text-white/55">No badges earned yet.</p>
                )}
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
