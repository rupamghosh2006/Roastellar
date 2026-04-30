'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Flame, Plus, Swords, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { SkeletonCard } from '@/components/LoadingScreen'
import { apiRoutes, normalizeBattleList, type Battle, type User, type Wallet } from '@/lib/api'
import { connectSocket, joinLobby, onOpenBattlesUpdated, removeAllSocketListeners } from '@/lib/socket'
import { getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'

export default function BattlesPage() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [battles, setBattles] = useState<Battle[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [topic, setTopic] = useState('')
  const [entryFee, setEntryFee] = useState('10')
  const [managedWalletBlocked, setManagedWalletBlocked] = useState(false)
  const [enablingBattleMode, setEnablingBattleMode] = useState(false)

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    const walletMode = isWalletAuthenticated()
    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    let active = true
    ;(async () => {
      try {
        const token = walletMode ? getWalletAuthToken() : await getToken({ skipCache: true })
        if (!token) {
          throw new Error('Missing token')
        }

        connectSocket(token)
        joinLobby()

        onOpenBattlesUpdated((payload) => {
          if (!active) return
          if (Array.isArray(payload)) {
            setBattles(normalizeBattleList(payload))
          }
        })

        const [meRes, walletRes, openRes] = await Promise.allSettled([
          apiRoutes.users.me(token),
          apiRoutes.wallet.me(token),
          apiRoutes.battles.open(),
        ])

        if (!active) return

        const nextUser = meRes.status === 'fulfilled' ? meRes.value.data : null
        const nextWallet = walletRes.status === 'fulfilled' ? walletRes.value.data : null
        const openBattles = openRes.status === 'fulfilled' ? openRes.value.data : []

        setUser(nextUser)
        setWallet(nextWallet)
        setBattles(openBattles)
        setManagedWalletBlocked(Boolean(nextUser && !nextUser.hasManagedWallet))

        if (!nextWallet?.publicKey && nextUser?.walletAddress) {
          setWallet({
            address: nextUser.walletAddress,
            publicKey: nextUser.walletAddress,
            balance: Number(nextUser.walletBalance || 0),
            funded: true,
          })
        }
      } catch (error) {
        toast.error('Unable to load battles right now')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
      removeAllSocketListeners()
    }
  }, [getToken, isLoaded, isSignedIn, router])

  const liveStats = useMemo(() => {
    const open = battles.filter((battle) => battle.status === 'open').length
    const active = battles.filter((battle) => battle.status === 'active' || battle.status === 'voting').length
    const totalPot = battles.reduce((sum, battle) => sum + (battle.pot || 0), 0)
    return { open, active, totalPot }
  }, [battles])

  const createBattle = async () => {
    if (!topic.trim()) {
      toast.error('Enter a battle topic first')
      return
    }

    const fee = Number(entryFee)
    if (!Number.isFinite(fee) || fee <= 0) {
      toast.error('Entry fee must be greater than 0')
      return
    }

    const resolvedWallet = wallet?.publicKey || user?.walletAddress
    if (!resolvedWallet) {
      toast.error('Create your wallet first')
      router.push('/onboarding')
      return
    }
    if (managedWalletBlocked) {
      toast.error('Battle create/join is temporarily gated for Freighter-primary accounts until wallet-native signing is enabled.')
      return
    }

    try {
      setSubmitting(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }

      const created = await apiRoutes.battles.create(
        {
          topic: topic.trim(),
          entryFee: fee,
        },
        token
      )

      setTopic('')
      toast.success('Battle created. Waiting for challenger.')
      router.push(`/battle/${created.data.matchId}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create battle')
    } finally {
      setSubmitting(false)
    }
  }

  const enableBattleMode = async () => {
    try {
      setEnablingBattleMode(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }

      await apiRoutes.wallet.create(token)
      const [meRes, walletRes] = await Promise.all([apiRoutes.users.me(token), apiRoutes.wallet.me(token)])
      setUser(meRes.data)
      setWallet(walletRes.data)
      setManagedWalletBlocked(false)
      toast.success('Battle mode enabled. You can now create and join battles.')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to enable battle mode right now')
    } finally {
      setEnablingBattleMode(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="glass h-40 rounded-2xl border-l-4 border-l-orange-500/30" />
            <div className="glass h-52 rounded-2xl border-l-4 border-l-violet-500/30" />
            <div className="glass rounded-2xl border-l-4 border-l-cyan-500/30 p-5">
              <div className="mb-4 h-8 w-56 rounded bg-white/10" />
              <div className="grid gap-5 xl:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <SkeletonCard key={item} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-8 border-l-4 border-l-orange-500/40">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Battle board</p>
                <h1 className="mt-3 font-orbitron text-3xl font-bold text-white sm:text-4xl">It is time for Roasting.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  Create or join live roast battles.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <StatPill label="Open" value={String(liveStats.open)} />
                <StatPill label="Live" value={String(liveStats.active)} />
                <StatPill label="Pot" value={`${liveStats.totalPot} XLM`} />
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 border-l-4 border-l-violet-500/40">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-violet-300" />
              <h2 className="font-orbitron text-2xl text-white">Create Contest</h2>
            </div>
<div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-center">
  <input
    value={topic}
    onChange={(event) => setTopic(event.target.value)}
    placeholder="Example: Roast Web3 influencers in one line"
    className="input-glass"
  />

  <div className="flex items-center gap-2">
    <input
      value={entryFee}
      onChange={(event) => setEntryFee(event.target.value)}
      type="number"
      min={1}
      placeholder="Entry fee"
      className="input-glass w-full"
    />
    <span className="text-sm text-gray-400">XLM</span>
  </div>

  <button
    onClick={createBattle}
    disabled={submitting}
    className="btn-primary disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
  >
    <Swords className="h-4 w-4" />
    {submitting ? 'Creating...' : 'Create Battle'}
  </button>
</div>
            <p className="mt-3 text-xs text-slate-500">
              Signed in as {user?.username ?? 'Player'} | Wallet {(wallet?.publicKey || user?.walletAddress) ? 'ready' : 'missing'}
            </p>
            {managedWalletBlocked && (
              <p className="mt-2 text-xs text-amber-400/90">
                Freighter-primary mode active: battle actions requiring server-managed signing are temporarily gated.
              </p>
            )}
            {managedWalletBlocked && (
              <button
                onClick={enableBattleMode}
                disabled={enablingBattleMode}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-xs font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enablingBattleMode ? 'Enabling Battle Mode...' : 'Enable Battle Mode'}
              </button>
            )}
          </section>

          <section className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 border-l-4 border-l-cyan-500/40">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-300" />
              <h2 className="font-orbitron text-2xl text-white">Open Battles</h2>
            </div>
            <BattleList battles={battles} emptyMessage="No open battles right now. Create one and start the arena." />
          </section>
        </div>
      </main>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-3 py-3 border-t-2 border-t-orange-500/50">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        <Flame className="mr-1 inline h-3.5 w-3.5 text-orange-400" />
        {value}
      </p>
    </div>
  )
}
