'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Flame, Plus, Swords, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { BattleList } from '@/components/BattleCard'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Battle, type User, type Wallet } from '@/lib/api'
import { connectSocket, joinLobby, onOpenBattlesUpdated, removeAllSocketListeners } from '@/lib/socket'

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

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    let active = true
    ;(async () => {
      try {
        const token = await getToken({ skipCache: true })
        if (!token) {
          throw new Error('Missing token')
        }

        connectSocket(token)
        joinLobby()

        onOpenBattlesUpdated((payload) => {
          if (!active) return
          if (Array.isArray(payload)) {
            setBattles(payload)
          }
        })

        const [meRes, walletRes, openRes] = await Promise.all([
          apiRoutes.users.me(token),
          apiRoutes.wallet.me(token),
          apiRoutes.battles.open(),
        ])

        if (!active) return
        setUser(meRes.data)
        setWallet(walletRes.data)
        setBattles(openRes.data)
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

    if (!wallet?.publicKey) {
      toast.error('Create your wallet first')
      router.push('/onboarding')
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken({ skipCache: true })
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

  if (loading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoader message="Loading battles" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="glass rounded-[28px] p-5 sm:rounded-[36px] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-blue-200/75">Battle board</p>
                <h1 className="mt-3 font-orbitron text-3xl font-bold text-white sm:text-4xl">Create or join live roast battles</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55 sm:text-base">
                  Every match is realtime with spectators, voting, predictions, and on-chain settlement.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <StatPill label="Open" value={String(liveStats.open)} />
                <StatPill label="Live" value={String(liveStats.active)} />
                <StatPill label="Pot" value={`${liveStats.totalPot} XLM`} />
              </div>
            </div>
          </section>

          <section className="glass rounded-[28px] p-5 sm:rounded-[36px] sm:p-6">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-200" />
              <h2 className="font-orbitron text-2xl text-white">Create Contest</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_auto]">
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: Roast Web3 influencers in one line"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
              <input
                value={entryFee}
                onChange={(event) => setEntryFee(event.target.value)}
                type="number"
                min={1}
                placeholder="Entry fee"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={createBattle}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Swords className="h-4 w-4" />
                {submitting ? 'Creating...' : 'Create Battle'}
              </button>
            </div>
            <p className="mt-3 text-xs text-white/45">
              Signed in as {user?.username ?? 'Player'} · Wallet {wallet?.publicKey ? 'ready' : 'missing'}
            </p>
          </section>

          <section className="glass rounded-[28px] p-5 sm:rounded-[36px] sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-200" />
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        <Flame className="mr-1 inline h-3.5 w-3.5 text-amber-200" />
        {value}
      </p>
    </div>
  )
}
