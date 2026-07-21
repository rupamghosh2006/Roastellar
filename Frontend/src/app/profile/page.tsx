'use client'

import { useEffect, useRef, useState } from 'react'
import { SignOutButton, useAuth } from '@clerk/nextjs'
import { Award, Camera, CheckCircle2, ChevronRight, LogOut, PenSquare, ShieldCheck, Swords, Trophy, Vote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { apiRoutes, type ProfileMatch, type User } from '@/lib/api'
import { formatAddress, formatDate } from '@/lib/utils'
import { clearWalletAuthSession, getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'
import dynamic from 'next/dynamic'
const PrismaticTiltCard = dynamic(() => import('@/components/PrismaticTiltCard'), { ssr: false })

export default function ProfilePage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [matchHistory, setMatchHistory] = useState<ProfileMatch[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const avatarInputRef = useRef<HTMLInputElement>(null)
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
        return Promise.all([apiRoutes.users.me(token), apiRoutes.users.matchHistory(token)])
      })
      .then(([userResponse, historyResponse]) => {
        setUser(userResponse.data)
        setMatchHistory(historyResponse.data)
        setUsername(userResponse.data.username ?? '')
        setFirstName(userResponse.data.firstName ?? '')
        setLastName(userResponse.data.lastName ?? '')
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a PNG, JPEG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile pictures must be 5 MB or smaller.')
      return
    }

    try {
      setAvatarUploading(true)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Unable to read image file'))
        reader.readAsDataURL(file)
      })
      const token = walletMode ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) throw new Error('Missing auth token')

      const response = await apiRoutes.users.uploadAvatar(dataUrl, token)
      setUser(response.data)
      toast.success('Profile picture uploaded to Pinata')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload profile picture')
    } finally {
      setAvatarUploading(false)
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
          <div className="glass min-w-0 rounded-2xl p-4 sm:rounded-2xl sm:p-8 border-l-4 border-l-violet-500/40">
            <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`${user.username}'s profile picture`}
                    width={96}
                    height={96}
                    className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/20 object-cover sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#B88A35]/18 font-orbitron text-3xl font-bold text-white sm:h-24 sm:w-24 sm:text-4xl">
                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 sm:text-sm">Profile</p>
                  <h1 className="mt-2 break-all font-orbitron text-2xl font-bold leading-tight text-white sm:text-4xl">{user?.username}</h1>
                  <p className="mt-2 text-sm text-slate-400 sm:text-base">Member since {formatDate(user?.createdAt ?? new Date())}</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  onClick={() => setIsEditing((value) => !value)}
                  className="btn-secondary w-full sm:w-auto"
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-200 transition-colors hover:bg-red-500/20 sm:w-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect Wallet Session
                  </button>
                ) : (
                  <SignOutButton>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-200 transition-colors hover:bg-red-500/20 sm:w-auto">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </SignOutButton>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/10 p-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile picture</p>
                    <p className="mt-1 text-sm text-slate-400">PNG, JPEG, or WebP · up to 5 MB · stored on Pinata</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="btn-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Camera className="h-4 w-4" />
                    {avatarUploading ? 'Uploading...' : 'Change picture'}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
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

          <section className="glass rounded-2xl p-5 sm:p-6 border-l-4 border-l-orange-500/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Match history</p>
                <h2 className="mt-2 font-orbitron text-2xl text-white">Previous matches</h2>
              </div>
              <p className="text-sm text-slate-400">As a player or voter</p>
            </div>

            {matchHistory.length ? (
              <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                {matchHistory.map((match) => {
                  const isPlayer = match.participation.role === 'player'
                  const didWin = isPlayer && match.winnerId === user?.id
                  const isDraw = match.status === 'draw' || (match.status === 'ended' && !match.winnerId)
                  const votedFor = match.player1?.id === match.participation.selectedPlayerId
                    ? match.player1?.username || 'Player 1'
                    : match.player2?.id === match.participation.selectedPlayerId
                      ? match.player2?.username || 'Player 2'
                      : 'a player'
                  const roleLabel = isPlayer
                    ? didWin ? 'Played · Won' : isDraw ? 'Played · Draw' : match.status === 'cancelled' ? 'Played · Cancelled' : 'Played · Lost'
                    : `Voted for ${votedFor}`
                  const roleClass = isPlayer
                    ? didWin ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-violet-400/30 bg-violet-400/10 text-violet-200'
                    : 'border-orange-400/30 bg-orange-400/10 text-orange-200'

                  return (
                    <button
                      key={match.id}
                      onClick={() => router.push(`/battle/${match.matchId}/report`)}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] sm:gap-4"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPlayer ? 'bg-violet-500/15 text-violet-300' : 'bg-orange-500/15 text-orange-300'}`}>
                        {isPlayer ? <Swords className="h-5 w-5" /> : <Vote className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate font-medium text-white">{match.topic}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleClass}`}>{roleLabel}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Battle #{match.matchId} · {match.player1?.username || 'Player 1'} vs {match.player2?.username || 'Player 2'} · {formatDate(match.endedAt || match.createdAt)}
                        </p>
                      </div>
                      {didWin ? <CheckCircle2 className="hidden h-5 w-5 shrink-0 text-emerald-300 sm:block" /> : null}
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center">
                <Swords className="mx-auto h-7 w-7 text-slate-500" />
                <p className="mt-3 text-sm text-slate-300">No previous matches yet.</p>
                <p className="mt-1 text-sm text-slate-500">Play in a battle or vote on one to build your history.</p>
              </div>
            )}
          </section>

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
